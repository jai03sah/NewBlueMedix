import React from 'react';
import BlueMedixBlockDiagram from '../assets/BlueMedix_Block_Diagram';

const BlockDiagramPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-900">BlueMedix System Architecture</h1>
          <p className="text-gray-600 mt-2">
            A high-level representation of the system components and their interactions
          </p>
        </div>
        
        <BlueMedixBlockDiagram />
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            This block diagram provides a comprehensive overview of the BlueMedix system architecture,
            showing how different components interact to create a complete medical supply management solution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockDiagramPage;