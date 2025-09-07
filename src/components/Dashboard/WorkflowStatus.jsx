import React from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Pause, AlertCircle, CheckCircle } from 'lucide-react';

export default function WorkflowStatus() {
  const { state, dispatch } = useApp();

  const toggleWorkflow = (workflowId) => {
    const workflow = state.workflows.find(w => w.id === workflowId);
    dispatch({
      type: 'UPDATE_WORKFLOW',
      payload: { ...workflow, isActive: !workflow.isActive }
    });
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-text">Workflow Status</h3>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-xs text-dark-muted">Real-time</span>
        </div>
      </div>

      <div className="space-y-3">
        {state.workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="flex items-center justify-between p-3 bg-dark-bg rounded-md border border-dark-border"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-md ${workflow.isActive ? 'bg-green-400/10' : 'bg-gray-400/10'}`}>
                {workflow.isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-dark-text">{workflow.name}</p>
                <p className="text-xs text-dark-muted">
                  {workflow.triggerType === 'data_threshold' ? 'Data Trigger' : 'Scheduled'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => toggleWorkflow(workflow.id)}
              className={`p-1 rounded-md transition-colors ${
                workflow.isActive 
                  ? 'text-green-400 hover:bg-green-400/10' 
                  : 'text-gray-400 hover:bg-gray-400/10'
              }`}
            >
              {workflow.isActive ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-dark-border">
        <div className="flex justify-between text-sm">
          <span className="text-dark-muted">Active Workflows</span>
          <span className="text-dark-text font-medium">
            {state.workflows.filter(w => w.isActive).length} / {state.workflows.length}
          </span>
        </div>
      </div>
    </div>
  );
}