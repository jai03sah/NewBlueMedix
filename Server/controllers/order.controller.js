import Order from '../model/order.model.js';
import Product from '../model/product.model.js';
import User from '../model/user.model.js';
import Franchise from '../model/franchise.model.js';
import Address from '../model/address.model.js';
import FranchiseStock from '../model/franchisestock.model.js';
import { v4 as uuidv4 } from 'uuid';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      product_id,
      product_details,
      deliveryAddress,
      subtotalAmount, 
      totalAmount,
      deliveryCharge,
      franchise
    } = req.body;

    // Validate required fields
    if (!product_id || !franchise || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Product, delivery address, and franchise are required'
      });
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if franchise exists
    const franchiseExists = await Franchise.findById(franchise);
    if (!franchiseExists) {
      return res.status(404).json({ success: false, message: 'Franchise not found' });
    }

    // Check if address exists
    const address = await Address.findById(deliveryAddress);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    
    // Check if the product is in stock at the specified franchise
    const franchiseStock = await FranchiseStock.findOne({
      franchise: franchise,
      product: product_id
    });
    
    // If no stock entry exists or quantity is 0, the product is out of stock
    if (!franchiseStock || franchiseStock.quantity === 0) {
      return res.status(200).json({ 
        success: false, 
        outOfStock: true,
        message: 'This product is out of stock at the selected franchise. Please try ordering from another franchise.' 
      });
    }

    // Generate unique order ID
    const order_id = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Calculate delivery charge based on pincode comparison
    let calculatedDeliveryCharge = 0;

    // If delivery address pincode is different from franchise pincode, add $2 delivery charge
    if (address.pincode !== franchiseExists.address.pincode) {
      calculatedDeliveryCharge = 2; // $2 delivery charge for different pincode
      console.log(`Delivery charge of $${calculatedDeliveryCharge} applied for different pincode delivery`);
      console.log(`Delivery pincode: ${address.pincode}, Franchise pincode: ${franchiseExists.address.pincode}`);
    } else {
      console.log('Free delivery applied as delivery is within same pincode');
    }

    // Use the calculated delivery charge if none was provided in the request
    const finalDeliveryCharge = deliveryCharge !== undefined ? deliveryCharge : calculatedDeliveryCharge;

    // Calculate the final total amount
    const finalSubtotalAmount = subtotalAmount || product.price;
    const finalTotalAmount = totalAmount || (finalSubtotalAmount + finalDeliveryCharge);

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      product_id,
      order_id,
      product_details: product_details || {
        name: product.name,
        image: product.image
      },
      deliveryAddress,
      subtotalAmount: finalSubtotalAmount,
      totalAmount: finalTotalAmount,
      deliveryCharge: finalDeliveryCharge,
      franchise,
      deliverystatus: 'pending',
      paymentStatus: 'pending'
    });

    // Update product warehouse stock
    product.warehouseStock = Math.max(0, product.warehouseStock - 1);
    await product.save();
    
    // Update franchise stock
    try {
      await franchiseStock.updateStock(1, false); // Decrease stock by 1
    } catch (error) {
      console.error('Error updating franchise stock:', error);
      // If there's an error updating franchise stock, we should still continue
      // as the order has been created, but log the error
    }

    // Populate order with details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('product_id', 'name price image')
      .populate('deliveryAddress')
      .populate('franchise', 'name');

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all orders (admin or manager)
export const getAllOrders = async (req, res) => {
  try {
    // Parse query parameters for filtering
    const { 
      deliverystatus, 
      paymentStatus, 
      franchiseId,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Admin can see all orders, manager can only see orders for their franchise
    if (req.user.role === 'orderManager' && req.user.franchise) {
      filter.franchise = req.user.franchise;
    } else if (franchiseId) {
      filter.franchise = franchiseId;
    }

    if (deliverystatus) filter.deliverystatus = deliverystatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (userId) filter.user = userId;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateObj;
      }
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('product_id', 'name price image')
      .populate('deliveryAddress')
      .populate('franchise', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    return res.status(200).json({ 
      success: true, 
      orders,
      pagination: {
        total: totalOrders,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalOrders / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('product_id', 'name price image')
      .populate('deliveryAddress')
      .populate('franchise', 'name address contactNumber email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if user has permission to view this order
    if (req.user.role === 'orderManager' && 
        req.user.franchise && 
        order.franchise._id.toString() !== req.user.franchise.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    if (req.user.role === 'user' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update order delivery status (admin or manager)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliverystatus } = req.body;

    if (!deliverystatus) {
      return res.status(400).json({ success: false, message: 'Delivery status is required' });
    }

    // Validate status
    const validStatuses = ['pending', 'accepted', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(deliverystatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    } 

    // Check if manager has permission to update this order
    if (req.user.role === 'orderManager' && 
        req.user.franchise && 
        order.franchise.toString() !== req.user.franchise.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    // If cancelling order, restore product stock
    if (deliverystatus === 'cancelled' && order.deliverystatus !== 'cancelled') {
      const product = await Product.findById(order.product_id);
      if (product) {
        product.warehouseStock += 1;
        await product.save();
      }
      
      // Restore franchise stock
      try {
        // Find the franchise stock entry
        let franchiseStock = await FranchiseStock.findOne({
          franchise: order.franchise,
          product: order.product_id
        });
        
        // If stock entry exists, increment it
        if (franchiseStock) {
          await franchiseStock.updateStock(1, true); // Increase stock by 1
        } else {
          // Create new stock entry if it doesn't exist
          franchiseStock = await FranchiseStock.create({
            franchise: order.franchise,
            product: order.product_id,
            quantity: 1
          });
        }
      } catch (error) {
        console.error('Error restoring franchise stock:', error);
        // Continue even if there's an error, but log it
      }
    }

    // Update status
    order.deliverystatus = deliverystatus;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        order_id: order.order_id,
        deliverystatus: order.deliverystatus
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update payment status (admin only)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, paymentid } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ success: false, message: 'Payment status is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update payment info
    order.paymentStatus = paymentStatus;
    if (paymentid) order.paymentid = paymentid;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      order: {
        _id: order._id,
        order_id: order.order_id,
        paymentStatus: order.paymentStatus,
        paymentid: order.paymentid
      }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ user: userId })
      .populate('product_id', 'name price image')
      .populate('deliveryAddress')
      .populate('franchise', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Generate invoice for order (admin or manager)
export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { invoice_reciept } = req.body;

    if (!invoice_reciept) {
      return res.status(400).json({ success: false, message: 'Invoice receipt is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if manager has permission to update this order
    if (req.user.role === 'orderManager' && 
        req.user.franchise && 
        order.franchise.toString() !== req.user.franchise.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    // Update invoice
    order.invoice_reciept = invoice_reciept;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Invoice generated successfully',
      order: {
        _id: order._id,
        order_id: order.order_id,
        invoice_reciept: order.invoice_reciept
      }
    });
  } catch (error) {
    console.error('Generate invoice error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};