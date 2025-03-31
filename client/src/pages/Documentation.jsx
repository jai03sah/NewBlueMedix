import React from 'react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-blue-900 mb-12">BlueMedix System Documentation</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Workflow Diagram Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Workflow Diagram</h2>
              <p className="text-gray-600 mb-4">
                A comprehensive visualization of the system flow from user interaction to backend processing.
                This diagram illustrates the complete user journeys and process flows within the BlueMedix system.
              </p>
              <Link
                to="/workflow-diagram"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                View Workflow Diagram
              </Link>
            </div>
          </div>

          {/* Block Diagram Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-green-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Block Diagram</h2>
              <p className="text-gray-600 mb-4">
                A high-level representation of the system components and their interactions.
                This diagram provides an architectural overview of the BlueMedix system structure.
              </p>
              <Link
                to="/block-diagram"
                className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                View Block Diagram
              </Link>
            </div>
          </div>

          {/* ER Diagram Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 bg-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ER Diagram</h2>
              <p className="text-gray-600 mb-4">
                An Entity-Relationship diagram showing the database structure and interconnections.
                This diagram illustrates how data is organized and related in the BlueMedix database.
              </p>
              <Link
                to="/er-diagram"
                className="inline-block px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
              >
                View ER Diagram
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Additional Documentation</h2>
          <ul className="space-y-3">
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <a href="/API_DOCUMENTATION.md" target="_blank" className="text-blue-600 hover:underline">API Documentation</a>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <a href="/WORKFLOW_DIAGRAM.md" target="_blank" className="text-blue-600 hover:underline">Workflow Documentation</a>
            </li>
            <li className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <a href="/ADMIN_SETUP.md" target="_blank" className="text-blue-600 hover:underline">Admin Setup Guide</a>
            </li>
          </ul>
        </div>
        
        <div className="text-center text-gray-500">
          <p>BlueMedix System Documentation - For development and reference purposes</p>
        </div>
      </div>
    </div>
  );
};

export default Documentation;