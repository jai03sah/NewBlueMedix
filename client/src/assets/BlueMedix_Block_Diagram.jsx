import React from 'react';

const BlueMedixBlockDiagram = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">BlueMedix System Architecture</h1>
      
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">System Overview</h2>
        <p className="text-gray-700 mb-4">
          This block diagram illustrates the high-level architecture of the BlueMedix system, showing the main components
          and their interactions. The system follows a modern client-server architecture with a React frontend, 
          Node.js/Express backend, and MongoDB database.
        </p>
      </div>

      {/* Main Architecture Diagram */}
      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10 bg-blue-50">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700 text-center">System Architecture Block Diagram</h2>
        
        <div className="flex flex-col items-center">
          {/* Client Layer */}
          <div className="w-full mb-8">
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 text-center">
              <h3 className="text-xl font-bold mb-2">Client Layer</h3>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <h4 className="font-semibold">User Interface</h4>
                  <p className="text-sm mt-1">React Components, Tailwind CSS</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <h4 className="font-semibold">State Management</h4>
                  <p className="text-sm mt-1">React Context, Local Storage</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <h4 className="font-semibold">API Integration</h4>
                  <p className="text-sm mt-1">Axios, Fetch API</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Arrow Down */}
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-yellow-300 border-r-[20px] border-r-transparent mb-8"></div>
          
          {/* API Gateway Layer */}
          <div className="w-full mb-8">
            <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
              <h3 className="text-xl font-bold mb-2">API Gateway Layer</h3>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <h4 className="font-semibold">Authentication</h4>
                  <p className="text-sm mt-1">JWT, Cookies, Middleware</p>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <h4 className="font-semibold">Request Handling</h4>
                  <p className="text-sm mt-1">Express.js, CORS, Validation</p>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <h4 className="font-semibold">Response Formatting</h4>
                  <p className="text-sm mt-1">JSON, Error Handling</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Arrow Down */}
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-green-300 border-r-[20px] border-r-transparent mb-8"></div>
          
          {/* Business Logic Layer */}
          <div className="w-full mb-8">
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center">
              <h3 className="text-xl font-bold mb-2">Business Logic Layer</h3>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-semibold">User Management</h4>
                  <p className="text-sm mt-1">Authentication, Authorization</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-semibold">Product Management</h4>
                  <p className="text-sm mt-1">Inventory, Pricing</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-semibold">Order Processing</h4>
                  <p className="text-sm mt-1">Cart, Checkout, Fulfillment</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <h4 className="font-semibold">Franchise Management</h4>
                  <p className="text-sm mt-1">Locations, Managers</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Arrow Down */}
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-300 border-r-[20px] border-r-transparent mb-8"></div>
          
          {/* Data Access Layer */}
          <div className="w-full mb-8">
            <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 text-center">
              <h3 className="text-xl font-bold mb-2">Data Access Layer</h3>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <h4 className="font-semibold">Models</h4>
                  <p className="text-sm mt-1">Mongoose Schemas, Validation</p>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <h4 className="font-semibold">Data Operations</h4>
                  <p className="text-sm mt-1">CRUD Operations, Queries</p>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <h4 className="font-semibold">Data Relationships</h4>
                  <p className="text-sm mt-1">References, Population</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Arrow Down */}
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-purple-300 border-r-[20px] border-r-transparent mb-8"></div>
          
          {/* Database Layer */}
          <div className="w-full">
            <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
              <h3 className="text-xl font-bold mb-2">Database Layer</h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <h4 className="font-semibold">MongoDB</h4>
                  <p className="text-sm mt-1">Document Storage, Collections</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <h4 className="font-semibold">Data Persistence</h4>
                  <p className="text-sm mt-1">Indexes, Transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Details */}
      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Component Details</h2>
        
        <div className="space-y-6">
          {/* Client Layer Details */}
          <div>
            <h3 className="text-xl font-bold text-yellow-700 mb-2">Client Layer</h3>
            <p className="mb-3">The client layer is responsible for the user interface and interaction.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">React Components:</span> Modular UI components organized by feature</li>
              <li><span className="font-semibold">Routing:</span> React Router for navigation between pages</li>
              <li><span className="font-semibold">State Management:</span> React Context API and local storage for state persistence</li>
              <li><span className="font-semibold">API Integration:</span> Axios for HTTP requests to the backend</li>
              <li><span className="font-semibold">Styling:</span> Tailwind CSS for responsive design</li>
            </ul>
          </div>
          
          {/* API Gateway Layer Details */}
          <div>
            <h3 className="text-xl font-bold text-green-700 mb-2">API Gateway Layer</h3>
            <p className="mb-3">The API gateway handles incoming requests, authentication, and routing to appropriate controllers.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Express.js:</span> Web framework for handling HTTP requests</li>
              <li><span className="font-semibold">Authentication Middleware:</span> JWT verification for protected routes</li>
              <li><span className="font-semibold">Request Validation:</span> Input validation and sanitization</li>
              <li><span className="font-semibold">CORS:</span> Cross-Origin Resource Sharing configuration</li>
              <li><span className="font-semibold">Error Handling:</span> Centralized error handling middleware</li>
            </ul>
          </div>
          
          {/* Business Logic Layer Details */}
          <div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">Business Logic Layer</h3>
            <p className="mb-3">The business logic layer contains the core functionality of the application.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Controllers:</span> Handle business logic for each domain area</li>
              <li><span className="font-semibold">Authentication:</span> User registration, login, and session management</li>
              <li><span className="font-semibold">Product Management:</span> Inventory tracking, pricing, and categorization</li>
              <li><span className="font-semibold">Order Processing:</span> Cart management, checkout, and order fulfillment</li>
              <li><span className="font-semibold">Franchise Management:</span> Franchise creation, manager assignment, and reporting</li>
            </ul>
          </div>
          
          {/* Data Access Layer Details */}
          <div>
            <h3 className="text-xl font-bold text-purple-700 mb-2">Data Access Layer</h3>
            <p className="mb-3">The data access layer provides an interface to the database.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">Mongoose Models:</span> Schema definitions and validation rules</li>
              <li><span className="font-semibold">Data Operations:</span> CRUD operations and complex queries</li>
              <li><span className="font-semibold">Relationships:</span> Managing references between collections</li>
              <li><span className="font-semibold">Middleware:</span> Pre/post hooks for data processing</li>
            </ul>
          </div>
          
          {/* Database Layer Details */}
          <div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Database Layer</h3>
            <p className="mb-3">The database layer stores all application data.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><span className="font-semibold">MongoDB:</span> NoSQL database for flexible document storage</li>
              <li><span className="font-semibold">Collections:</span> User, Product, Order, Franchise, etc.</li>
              <li><span className="font-semibold">Indexes:</span> Optimized queries for frequently accessed data</li>
              <li><span className="font-semibold">Data Persistence:</span> Reliable storage with backup capabilities</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cross-Cutting Concerns */}
      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">Cross-Cutting Concerns</h2>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-lg font-bold text-red-700 mb-2">Security</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>JWT Authentication</li>
              <li>Password Hashing</li>
              <li>Role-Based Access Control</li>
              <li>Input Validation</li>
              <li>HTTPS Communication</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-bold text-indigo-700 mb-2">Logging & Monitoring</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Request Logging</li>
              <li>Error Tracking</li>
              <li>Performance Monitoring</li>
              <li>Audit Trails</li>
              <li>System Health Checks</li>
            </ul>
          </div>
          
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <h3 className="text-lg font-bold text-teal-700 mb-2">Configuration</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Environment Variables</li>
              <li>Feature Flags</li>
              <li>Deployment Profiles</li>
              <li>API Endpoints</li>
              <li>System Constants</li>
            </ul>
          </div>
        </div>
      </div>

      {/* External Integrations */}
      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10">
        <h2 className="text-2xl font-semibold mb-6 text-blue-700">External Integrations</h2>
        
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
            <h3 className="font-semibold">Payment Gateway</h3>
            <p className="text-xs mt-1">For processing payments</p>
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
            <h3 className="font-semibold">Email Service</h3>
            <p className="text-xs mt-1">For notifications</p>
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
            <h3 className="font-semibold">Cloud Storage</h3>
            <p className="text-xs mt-1">For file storage</p>
          </div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
            <h3 className="font-semibold">Analytics</h3>
            <p className="text-xs mt-1">For usage tracking</p>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-gray-500 text-sm">
        <p>BlueMedix System Architecture Block Diagram - Created for development and documentation purposes</p>
      </div>
    </div>
  );
};

export default BlueMedixBlockDiagram;