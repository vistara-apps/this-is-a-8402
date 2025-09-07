import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import WorkflowList from './WorkflowList';
import WorkflowBuilder from './WorkflowBuilder';
import { Plus } from 'lucide-react';

export default function Workflows() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);

  const handleNewWorkflow = () => {
    setEditingWorkflow(null);
    setShowBuilder(true);
  };

  const handleEditWorkflow = (workflow) => {
    setEditingWorkflow(workflow);
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingWorkflow(null);
  };

  if (showBuilder) {
    return (
      <WorkflowBuilder 
        workflow={editingWorkflow}
        onClose={handleCloseBuilder}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Workflows</h1>
          <p className="text-dark-muted mt-1">
            Automate your processes with custom triggers and actions
          </p>
        </div>
        
        <button
          onClick={handleNewWorkflow}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Workflow List */}
      <WorkflowList onEditWorkflow={handleEditWorkflow} />
    </div>
  );
}