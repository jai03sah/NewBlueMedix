import React from 'react';

const BlueMedixERDiagram = () => {
  // Define styles for different entity types
  const styles = {
    container: "p-8 bg-white rounded-lg shadow-lg max-w-6xl mx-auto",
    title: "text-3xl font-bold text-center mb-8 text-blue-800",
    subtitle: "text-2xl font-semibold mb-4 text-blue-700",
    description: "text-gray-700 mb-4",
    diagramContainer: "border-2 border-blue-200 p-6 rounded-lg mb-10 bg-blue-50 overflow-auto",
    entityContainer: "relative",
    entity: {
      user: "bg-blue-100 border-2 border-blue-300 rounded-lg p-4 shadow-md",
      product: "bg-green-100 border-2 border-green-300 rounded-lg p-4 shadow-md",
      order: "bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 shadow-md",
      franchise: "bg-purple-100 border-2 border-purple-300 rounded-lg p-4 shadow-md",
      address: "bg-red-100 border-2 border-red-300 rounded-lg p-4 shadow-md",
      cart: "bg-orange-100 border-2 border-orange-300 rounded-lg p-4 shadow-md",
      category: "bg-teal-100 border-2 border-teal-300 rounded-lg p-4 shadow-md",
      franchisestock: "bg-indigo-100 border-2 border-indigo-300 rounded-lg p-4 shadow-md",
    },
    entityTitle: "text-lg font-bold mb-2",
    attributeContainer: "mt-2",
    attribute: "text-sm py-1 border-b border-gray-200 flex justify-between",
    primaryKey: "font-bold text-blue-800",
    foreignKey: "italic text-purple-800",
    relationshipLine: "absolute border-2 border-gray-400",
    relationshipLabel: "bg-white px-2 text-xs text-gray-600 absolute",
    legendContainer: "mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200",
    legendTitle: "font-bold text-lg mb-2",
    legendItem: "flex items-center mb-1",
    legendColor: "w-4 h-4 mr-2 rounded",
    legendText: "text-sm",
    relationshipContainer: "mt-8",
    relationshipTitle: "font-bold text-lg mb-2",
    relationshipItem: "mb-2 pl-4 border-l-2 border-gray-300",
    relationshipName: "font-semibold",
    relationshipDescription: "text-sm text-gray-600",
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>BlueMedix Database Entity-Relationship Diagram</h1>
      
      <div className="mb-10">
        <h2 className={styles.subtitle}>Database Overview</h2>
        <p className={styles.description}>
          This diagram illustrates the structure and relationships between the different entities in the BlueMedix database.
          The system uses MongoDB as its database, with Mongoose for object modeling. Each box represents a collection in the 
          database, showing its fields and relationships to other collections.
        </p>
      </div>

      {/* ER Diagram */}
      <div className={styles.diagramContainer}>
        <h2 className="text-2xl font-semibold mb-6 text-blue-700 text-center">Entity-Relationship Diagram</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Entity */}
          <div className={styles.entity.user}>
            <h3 className={styles.entityTitle}>User</h3>
            <div className={styles.attributeContainer}>
              <div className={styles.attribute}>
                <span className={styles.primaryKey}>_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>name</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>email</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>password</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>img_url</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>verify_email</span>
                <span>Boolean</span>
              </div>
              <div className={styles.attribute}>
                <span>last_login_date</span>
                <span>Date</span>
              </div>
              <div className={styles.attribute}>
                <span>Status</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>address_info</span>
                <span>[ObjectId]</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>shopping_cart</span>
                <span>[ObjectId]</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>order_history</span>
                <span>[ObjectId]</span>
              </div>
              <div className={styles.attribute}>
                <span>forgot_password_otp</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>forgot_password_expiry</span>
                <span>Date</span>
              </div>
              <div className={styles.attribute}>
                <span>role</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>phone</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>franchise</span>
                <span>ObjectId</span>
              </div>
            </div>
          </div>

          {/* Product Entity */}
          <div className={styles.entity.product}>
            <h3 className={styles.entityTitle}>Product</h3>
            <div className={styles.attributeContainer}>
              <div className={styles.attribute}>
                <span className={styles.primaryKey}>_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>name</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>description</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>category</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>price</span>
                <span>Number</span>
              </div>
              <div className={styles.attribute}>
                <span>discount</span>
                <span>Number</span>
              </div>
              <div className={styles.attribute}>
                <span>warehouseStock</span>
                <span>Number</span>
              </div>
              <div className={styles.attribute}>
                <span>lowStockThreshold</span>
                <span>Number</span>
              </div>
              <div className={styles.attribute}>
                <span>image</span>
                <span>Array</span>
              </div>
              <div className={styles.attribute}>
                <span>manufacturer</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>publish</span>
                <span>Boolean</span>
              </div>
            </div>
          </div>

          {/* Order Entity */}
          <div className={styles.entity.order}>
            <h3 className={styles.entityTitle}>Order</h3>
            <div className={styles.attributeContainer}>
              <div className={styles.attribute}>
                <span className={styles.primaryKey}>_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>user</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>product_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>order_id</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>product_details</span>
                <span>Object</span>
              </div>
              <div className={styles.attribute}>
                <span>paymentid</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>paymentStatus</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>deliveryAddress</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>subtotalAmount</span>
                <span>Number</span>
              </div>
              <div className={styles.attribute}>
                <span>totalAmount</span>
                <span>Number</span>
              </div>
              <div className={styles.attribute}>
                <span>invoice_reciept</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>deliverystatus</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>franchise</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>deliveryCharge</span>
                <span>Number</span>
              </div>
            </div>
          </div>

          {/* Franchise Entity */}
          <div className={styles.entity.franchise}>
            <h3 className={styles.entityTitle}>Franchise</h3>
            <div className={styles.attributeContainer}>
              <div className={styles.attribute}>
                <span className={styles.primaryKey}>_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>name</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>address</span>
                <span>Object</span>
              </div>
              <div className={styles.attribute}>
                <span>contactNumber</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>email</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>isActive</span>
                <span>Boolean</span>
              </div>
              <div className={styles.attribute}>
                <span>createdAt</span>
                <span>Date</span>
              </div>
            </div>
          </div>

          {/* Address Entity */}
          <div className={styles.entity.address}>
            <h3 className={styles.entityTitle}>Address</h3>
            <div className={styles.attributeContainer}>
              <div className={styles.attribute}>
                <span className={styles.primaryKey}>_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>Street</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>city</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>state</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>pincode</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>country</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>phone_number</span>
                <span>Number</span>
              </div>
              <div className={styles.attribute}>
                <span>status</span>
                <span>Boolean</span>
              </div>
            </div>
          </div>

          {/* Cart Entity */}
          <div className={styles.entity.cart}>
            <h3 className={styles.entityTitle}>Cart</h3>
            <div className={styles.attributeContainer}>
              <div className={styles.attribute}>
                <span className={styles.primaryKey}>_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>productid</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>quantity</span>
                <span>Number</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>user_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>franchise</span>
                <span>ObjectId</span>
              </div>
            </div>
          </div>

          {/* Category Entity */}
          <div className={styles.entity.category}>
            <h3 className={styles.entityTitle}>Category</h3>
            <div className={styles.attributeContainer}>
              <div className={styles.attribute}>
                <span className={styles.primaryKey}>_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>name</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>image</span>
                <span>String</span>
              </div>
              <div className={styles.attribute}>
                <span>createdAt</span>
                <span>Date</span>
              </div>
            </div>
          </div>

          {/* FranchiseStock Entity */}
          <div className={styles.entity.franchisestock}>
            <h3 className={styles.entityTitle}>FranchiseStock</h3>
            <div className={styles.attributeContainer}>
              <div className={styles.attribute}>
                <span className={styles.primaryKey}>_id</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>franchise</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span className={styles.foreignKey}>product</span>
                <span>ObjectId</span>
              </div>
              <div className={styles.attribute}>
                <span>quantity</span>
                <span>Number</span>
              </div>
              <div className={styles.attribute}>
                <span>lastUpdated</span>
                <span>Date</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className={styles.legendContainer}>
          <h3 className={styles.legendTitle}>Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} bg-blue-300`}></div>
              <span className={styles.legendText}>User Entity</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} bg-green-300`}></div>
              <span className={styles.legendText}>Product Entity</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} bg-yellow-300`}></div>
              <span className={styles.legendText}>Order Entity</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} bg-purple-300`}></div>
              <span className={styles.legendText}>Franchise Entity</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} bg-red-300`}></div>
              <span className={styles.legendText}>Address Entity</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} bg-orange-300`}></div>
              <span className={styles.legendText}>Cart Entity</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} bg-teal-300`}></div>
              <span className={styles.legendText}>Category Entity</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} bg-indigo-300`}></div>
              <span className={styles.legendText}>FranchiseStock Entity</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.primaryKey}>Field</span>
              <span className={styles.legendText}>Primary Key</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.foreignKey}>Field</span>
              <span className={styles.legendText}>Foreign Key</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relationships Description */}
      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Entity Relationships</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>User → Address (One-to-Many)</h3>
            <p className={styles.relationshipDescription}>
              A user can have multiple addresses stored in their profile. The user's address_info array contains references to address documents.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>User → Cart (One-to-Many)</h3>
            <p className={styles.relationshipDescription}>
              A user can have multiple items in their shopping cart. The user's shopping_cart array contains references to cart documents.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>User → Order (One-to-Many)</h3>
            <p className={styles.relationshipDescription}>
              A user can place multiple orders. The user's order_history array contains references to order documents.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>User → Franchise (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple users (specifically order managers) can be associated with a single franchise. The user's franchise field references a franchise document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>Product → Category (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple products can belong to a single category. The product's category field references a category document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>Order → User (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple orders can be placed by a single user. The order's user field references a user document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>Order → Product (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple orders can be for a single product. The order's product_id field references a product document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>Order → Address (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple orders can be delivered to a single address. The order's deliveryAddress field references an address document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>Order → Franchise (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple orders can be fulfilled by a single franchise. The order's franchise field references a franchise document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>Cart → Product (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple cart items can reference a single product. The cart's productid field references a product document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>Cart → User (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple cart items can belong to a single user. The cart's user_id field references a user document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>Cart → Franchise (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple cart items can be fulfilled by a single franchise. The cart's franchise field references a franchise document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>FranchiseStock → Franchise (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple franchise stock entries can belong to a single franchise. The franchiseStock's franchise field references a franchise document.
            </p>
          </div>
          
          <div className={styles.relationshipItem}>
            <h3 className={styles.relationshipName}>FranchiseStock → Product (Many-to-One)</h3>
            <p className={styles.relationshipDescription}>
              Multiple franchise stock entries can reference a single product. The franchiseStock's product field references a product document.
            </p>
          </div>
        </div>
      </div>

      {/* Database Schema Overview */}
      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Database Schema Overview</h2>
        
        <p className="mb-4">
          The BlueMedix database is designed to support a medical supply management system with multiple user roles (admin, order manager, user),
          franchise management, product inventory, and order processing. The schema follows these design principles:
        </p>
        
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li><span className="font-semibold">Document-Oriented Structure:</span> Leverages MongoDB's document model for flexible schema design</li>
          <li><span className="font-semibold">Reference-Based Relationships:</span> Uses ObjectId references to establish relationships between collections</li>
          <li><span className="font-semibold">Role-Based Access:</span> User schema includes role field to support different permission levels</li>
          <li><span className="font-semibold">Inventory Management:</span> Tracks both warehouse and franchise-specific inventory</li>
          <li><span className="font-semibold">Order Tracking:</span> Comprehensive order schema with status tracking and payment information</li>
        </ul>
        
        <p>
          This schema design allows for efficient querying of related data while maintaining data integrity through Mongoose schema validation
          and middleware hooks.
        </p>
      </div>

      <div className="mt-10 text-center text-gray-500 text-sm">
        <p>BlueMedix Database Entity-Relationship Diagram - Created for development and documentation purposes</p>
      </div>
    </div>
  );
};

export default BlueMedixERDiagram;