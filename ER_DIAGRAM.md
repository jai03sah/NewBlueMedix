# BlueMedix Database Entity-Relationship Diagram

This document provides information about the BlueMedix Database Entity-Relationship (ER) Diagram, which illustrates the database structure and interconnections between different entities.

## Overview

The ER diagram provides a comprehensive visualization of the BlueMedix database schema, including:

- All database collections (entities)
- Fields within each collection
- Relationships between collections
- Primary and foreign keys
- Data types for each field

## Accessing the Diagram

The ER diagram is available within the application at the following URL:

```
/er-diagram
```

You can access this page directly in your browser when the application is running.

## Database Collections

The BlueMedix database consists of the following main collections:

1. **User**
   - Stores user account information
   - Contains references to addresses, cart items, and orders
   - Includes role-based access control fields

2. **Product**
   - Stores product information
   - Contains pricing, inventory, and categorization data
   - Tracks warehouse stock levels

3. **Order**
   - Stores order information
   - Contains references to users, products, and delivery addresses
   - Tracks order status and payment information

4. **Franchise**
   - Stores franchise information
   - Contains contact details and location information
   - Tracks franchise status

5. **Address**
   - Stores address information
   - Used for user shipping addresses and franchise locations
   - Contains contact information

6. **Cart**
   - Stores shopping cart items
   - Contains references to products, users, and franchises
   - Tracks quantity of each item

7. **Category**
   - Stores product categories
   - Contains category names and images
   - Used for product organization

8. **FranchiseStock**
   - Stores inventory information for each franchise
   - Contains references to products and franchises
   - Tracks quantity of each product at each franchise

## Key Relationships

The diagram illustrates the following key relationships:

1. **User → Address (One-to-Many)**
   - A user can have multiple addresses
   - Addresses are referenced in the user's address_info array

2. **User → Cart (One-to-Many)**
   - A user can have multiple items in their shopping cart
   - Cart items are referenced in the user's shopping_cart array

3. **User → Order (One-to-Many)**
   - A user can place multiple orders
   - Orders are referenced in the user's order_history array

4. **User → Franchise (Many-to-One)**
   - Multiple users (specifically order managers) can be associated with a single franchise
   - The franchise is referenced in the user's franchise field

5. **Product → Category (Many-to-One)**
   - Multiple products can belong to a single category
   - The category is referenced in the product's category field

6. **Order → User, Product, Address, Franchise (Many-to-One)**
   - Multiple orders can be associated with a single user, product, address, or franchise
   - These entities are referenced in the order's respective fields

7. **FranchiseStock → Franchise, Product (Many-to-One)**
   - Multiple franchise stock entries can be associated with a single franchise or product
   - These entities are referenced in the franchiseStock's respective fields

## Database Schema Design

The BlueMedix database follows these design principles:

- **Document-Oriented Structure:** Leverages MongoDB's document model for flexible schema design
- **Reference-Based Relationships:** Uses ObjectId references to establish relationships between collections
- **Role-Based Access:** User schema includes role field to support different permission levels
- **Inventory Management:** Tracks both warehouse and franchise-specific inventory
- **Order Tracking:** Comprehensive order schema with status tracking and payment information

## Technical Implementation

The ER diagram is implemented as a React component that renders a visual representation of the database schema. The component is located at:

```
client/src/assets/BlueMedix_ER_Diagram.jsx
```

The page that displays this diagram is located at:

```
client/src/pages/ERDiagram.jsx
```

## Development and Maintenance

When making significant changes to the database schema, please update the diagram to reflect these changes. This ensures that the documentation remains accurate and useful for developers and stakeholders.

To modify the diagram:

1. Edit the `BlueMedix_ER_Diagram.jsx` file
2. Update the relevant sections to reflect the new schema or changes
3. Test the changes by viewing the diagram in the application

## Purpose

This diagram serves several important purposes:

- **Database Documentation:** Provides a clear overview of the database structure
- **Onboarding:** Helps new developers understand the data model quickly
- **Planning:** Assists in identifying areas for schema improvement or expansion
- **Communication:** Facilitates discussions about data structure with stakeholders

## Relationship to Other Diagrams

The ER Diagram complements the other system diagrams:

- **Workflow Diagram:** Shows the processes and user interactions (the "how")
- **Block Diagram:** Shows the system components and architecture (the "what")
- **ER Diagram:** Shows the data structure and relationships (the "where")