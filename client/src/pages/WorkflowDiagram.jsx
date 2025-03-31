import React from 'react';
import BlueMedixWorkflowDiagram from '../assets/BlueMedix_Workflow_Diagram';

const WorkflowDiagramPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-900">BlueMedix System Workflow</h1>
          <p className="text-gray-600 mt-2">
            A comprehensive visualization of the system flow from user interaction to backend processing
          </p>
        </div>
        
        <BlueMedixWorkflowDiagram />
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            This diagram illustrates the complete workflow of the BlueMedix application, 
            showing how user interactions flow through the system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDiagramPage;