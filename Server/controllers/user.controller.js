
import User from '../model/user.model.js';
import Franchise from '../model/franchise.model.js';
import bcrypt from 'bcryptjs';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Log the raw query for debugging
    console.log('Raw query:', req.query);

    const {
      page = 1,
      limit = 10,
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Log all query parameters for debugging
    console.log('Query parameters:', { page, limit, role, search, sortBy, sortOrder });

    // Filter by role if provided
    if (role) {
      // Make sure role is a string and trim any whitespace
      const roleValue = String(role).trim();
      console.log(`Filtering by role: ${roleValue}`);

      // Check if the role value is valid
      if (['admin', 'orderManager', 'user'].includes(roleValue)) {
        query.role = roleValue;
      } else {
        console.log(`Invalid role value: ${roleValue}`);
      }
    }

    // Search by name or email if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Log the query for debugging
    console.log('User query:', JSON.stringify(query));
    console.log('Sort:', JSON.stringify(sort));
    console.log('Skip:', skip, 'Limit:', parseInt(limit));

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .populate('franchise', 'name address contactNumber email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    console.log('Total users found:', totalUsers);
    console.log('Total pages:', totalPages);
    console.log('Users returned:', users.length);

    // Log the roles of returned users for debugging
    console.log('User roles:', users.map(user => user.role));

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total: totalUsers,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('franchise', 'name address contactNumber email')
      .populate('address_info')
      .populate('shopping_cart')
      .populate('order_history');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, phone, img_url, franchiseId, password, email } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the user is updating their own profile or if admin is updating
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (img_url) user.img_url = img_url;

    // Allow admin to update email
    if (email && req.user.role === 'admin') {
      // Check if email is already in use by another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another user' });
      }
      user.email = email;
    }

    // Update password if provided (admin only or self)
    if (password) {
      if (req.user.role === 'admin' || req.user._id.toString() === userId) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
      }
    }

    // Handle franchise assignment for managers
    if (franchiseId !== undefined && req.user.role === 'admin') {
      // If franchiseId is empty string, remove franchise assignment
      if (franchiseId === '') {
        user.franchise = null;
      } else {
        // Verify franchise exists
        const franchise = await Franchise.findById(franchiseId);
        if (!franchise) {
          return res.status(404).json({ success: false, message: 'Franchise not found' });
        }
        user.franchise = franchiseId;

        // Update franchise with manager ID if user is an orderManager
        if (user.role === 'orderManager') {
          await Franchise.findByIdAndUpdate(franchiseId, { orderManager: user._id });
        }
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        img_url: user.img_url,
        role: user.role,
        franchise: user.franchise
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Change user status (admin only)
export const changeUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.Status = status;
    await user.save();

    return res.status(200).json({ success: true, message: `User status changed to ${status}` });
  } catch (error) {
    console.error('Change user status error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create manager with optional franchise (admin only)
export const createManager = async (req, res) => {
  try {
    const { name, email, password, phone, franchiseId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create manager data object
    const managerData = {
      name,
      email,
      password,
      phone,
      role: 'orderManager'
    };

    // If franchiseId is provided, check if franchise exists and associate it
    if (franchiseId) {
      const franchise = await Franchise.findById(franchiseId);
      if (!franchise) {
        return res.status(404).json({ success: false, message: 'Franchise not found' });
      }

      // Add franchise to manager data
      managerData.franchise = franchiseId;
    }

    // Create new manager
    const manager = await User.create(managerData);

    // If franchiseId is provided, update franchise with new manager
    if (franchiseId) {
      await Franchise.findByIdAndUpdate(franchiseId, { orderManager: manager._id });
    }

    return res.status(201).json({
      success: true,
      message: 'Manager created successfully',
      manager: {
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        role: manager.role,
        franchise: franchiseId || null
      }
    });
  } catch (error) {
    console.error('Create manager error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all managers (admin only)
export const getAllManagers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('Manager query parameters:', { page, limit, search, sortBy, sortOrder });

    // Build query
    const query = { role: 'orderManager' };

    // Search by name or email if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Log the query for debugging
    console.log('Manager query:', JSON.stringify(query));
    console.log('Sort:', JSON.stringify(sort));
    console.log('Skip:', skip, 'Limit:', parseInt(limit));

    // Execute query with pagination
    const managers = await User.find(query)
      .select('-password')
      .populate('franchise', 'name address contactNumber email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalManagers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalManagers / parseInt(limit));

    console.log('Total managers found:', totalManagers);
    console.log('Total pages:', totalPages);
    console.log('Managers returned:', managers.length);

    return res.status(200).json({
      success: true,
      managers,
      pagination: {
        total: totalManagers,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Get all managers error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Change user password
export const changePassword = async (req, res) => {
  try {
    const { oldpassword, newpassword } = req.body;
    console.log('Change password request:', req.body);
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(oldpassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newpassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If user is a manager, check if they're assigned to a franchise
    if (user.role === 'orderManager' && user.franchise) {
      // Update the franchise to remove the manager reference
      await Franchise.findByIdAndUpdate(
        user.franchise,
        { $unset: { orderManager: 1 } },
        { new: true }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
