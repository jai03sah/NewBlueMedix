import React from 'react';

const BlueMedixWorkflowDiagram = () => {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">BlueMedix System Workflow Diagram</h1>
      
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">System Overview</h2>
        <p className="text-gray-700 mb-4">
          This diagram illustrates the complete workflow of the BlueMedix system, from user interaction through the frontend 
          to backend processing and database operations. The system supports three user roles: regular users, order managers, 
          and administrators, each with specific permissions and access to different parts of the application.
        </p>
      </div>

      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10 bg-blue-50">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">User Authentication Flow</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <div className="w-1/3 p-3 bg-blue-100 rounded-lg mr-4">
              <h3 className="font-bold">User Interaction</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>User visits login page</li>
                <li>Enters email and password</li>
                <li>Clicks login button</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-green-100 rounded-lg mr-4">
              <h3 className="font-bold">Frontend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Form validation</li>
                <li>API request to /api/auth/login</li>
                <li>Stores JWT token in localStorage</li>
                <li>Redirects based on user role</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-purple-100 rounded-lg">
              <h3 className="font-bold">Backend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Validates credentials</li>
                <li>Generates JWT token</li>
                <li>Sets HTTP-only cookie</li>
                <li>Returns user data and token</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10 bg-blue-50">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">User Registration Flow</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <div className="w-1/3 p-3 bg-blue-100 rounded-lg mr-4">
              <h3 className="font-bold">User Interaction</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>User visits registration page</li>
                <li>Enters personal details</li>
                <li>Submits registration form</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-green-100 rounded-lg mr-4">
              <h3 className="font-bold">Frontend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Form validation</li>
                <li>API request to /api/auth/register</li>
                <li>Stores user data and token</li>
                <li>Redirects to dashboard</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-purple-100 rounded-lg">
              <h3 className="font-bold">Backend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Validates user data</li>
                <li>Creates user record</li>
                <li>Creates address record if provided</li>
                <li>Returns user data and token</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10 bg-blue-50">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Product Browsing & Shopping Flow</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <div className="w-1/3 p-3 bg-blue-100 rounded-lg mr-4">
              <h3 className="font-bold">User Interaction</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Browse products by category</li>
                <li>View product details</li>
                <li>Add products to cart</li>
                <li>Proceed to checkout</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-green-100 rounded-lg mr-4">
              <h3 className="font-bold">Frontend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Fetch products from API</li>
                <li>Update cart state</li>
                <li>Calculate totals</li>
                <li>Submit order to API</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-purple-100 rounded-lg">
              <h3 className="font-bold">Backend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Query products from database</li>
                <li>Update cart items</li>
                <li>Process order creation</li>
                <li>Update inventory</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10 bg-blue-50">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Order Management Flow</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <div className="w-1/3 p-3 bg-blue-100 rounded-lg mr-4">
              <h3 className="font-bold">Manager Interaction</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>View pending orders</li>
                <li>Update order status</li>
                <li>Process shipments</li>
                <li>Handle returns</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-green-100 rounded-lg mr-4">
              <h3 className="font-bold">Frontend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Fetch orders from API</li>
                <li>Display order details</li>
                <li>Submit status updates</li>
                <li>Generate reports</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-purple-100 rounded-lg">
              <h3 className="font-bold">Backend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Query orders from database</li>
                <li>Update order status</li>
                <li>Process inventory changes</li>
                <li>Notify customers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10 bg-blue-50">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Admin Management Flow</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <div className="w-1/3 p-3 bg-blue-100 rounded-lg mr-4">
              <h3 className="font-bold">Admin Interaction</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Manage users and managers</li>
                <li>Manage products</li>
                <li>Manage franchises</li>
                <li>View reports</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-green-100 rounded-lg mr-4">
              <h3 className="font-bold">Frontend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Admin dashboard interface</li>
                <li>CRUD operations via API</li>
                <li>Data visualization</li>
                <li>Access control enforcement</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-purple-100 rounded-lg">
              <h3 className="font-bold">Backend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Admin-only API endpoints</li>
                <li>Database operations</li>
                <li>System configuration</li>
                <li>Data aggregation for reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10 bg-blue-50">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Logout Flow</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <div className="w-1/3 p-3 bg-blue-100 rounded-lg mr-4">
              <h3 className="font-bold">User Interaction</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>User clicks logout</li>
                <li>Confirmation dialog (optional)</li>
                <li>Redirect to login page</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-green-100 rounded-lg mr-4">
              <h3 className="font-bold">Frontend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>API request to /api/auth/logout</li>
                <li>Clear localStorage</li>
                <li>Clear application state</li>
                <li>Redirect to login page</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-purple-100 rounded-lg">
              <h3 className="font-bold">Backend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Clear HTTP-only cookie</li>
                <li>Invalidate token (if implemented)</li>
                <li>Return success response</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-blue-200 p-6 rounded-lg mb-10 bg-blue-50">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Password Reset Flow</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start">
            <div className="w-1/3 p-3 bg-blue-100 rounded-lg mr-4">
              <h3 className="font-bold">User Interaction</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>User visits forgot password page</li>
                <li>Enters email address</li>
                <li>Receives OTP</li>
                <li>Enters OTP and new password</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-green-100 rounded-lg mr-4">
              <h3 className="font-bold">Frontend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Form validation</li>
                <li>API request to forgot password</li>
                <li>API request to reset password</li>
                <li>Redirect to login page</li>
              </ul>
            </div>
            <div className="w-1/3 p-3 bg-purple-100 rounded-lg">
              <h3 className="font-bold">Backend Processing</h3>
              <ul className="list-disc pl-5 mt-2">
                <li>Generate OTP</li>
                <li>Store OTP with expiry</li>
                <li>Verify OTP validity</li>
                <li>Update user password</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-2 border-gray-200 p-6 rounded-lg bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Database Schema Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <h3 className="font-bold">User Collection</h3>
            <p className="text-sm text-gray-600 mt-1">Stores user accounts, credentials, and profile information</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <h3 className="font-bold">Product Collection</h3>
            <p className="text-sm text-gray-600 mt-1">Stores product details, pricing, and inventory information</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <h3 className="font-bold">Order Collection</h3>
            <p className="text-sm text-gray-600 mt-1">Stores order details, status, and history</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <h3 className="font-bold">Cart Collection</h3>
            <p className="text-sm text-gray-600 mt-1">Stores user shopping cart items</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <h3 className="font-bold">Address Collection</h3>
            <p className="text-sm text-gray-600 mt-1">Stores user shipping and billing addresses</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <h3 className="font-bold">Franchise Collection</h3>
            <p className="text-sm text-gray-600 mt-1">Stores franchise information and relationships</p>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-gray-500 text-sm">
        <p>BlueMedix System Workflow Diagram - Created for development and documentation purposes</p>
      </div>
    </div>
  );
};

export default BlueMedixWorkflowDiagram;