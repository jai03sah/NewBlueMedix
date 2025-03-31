import React from 'react';
import BlueMedixERDiagram from '../assets/BlueMedix_ER_Diagram';

const ERDiagramPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-900">BlueMedix Database Structure</h1>
          <p className="text-gray-600 mt-2">
            Entity-Relationship Diagram showing database collections and their interconnections
          </p>
        </div>
        
        <BlueMedixERDiagram />
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            This diagram illustrates the database schema of the BlueMedix application,
            showing how different entities relate to each other in the MongoDB database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ERDiagramPage;