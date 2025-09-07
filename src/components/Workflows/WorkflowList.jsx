import React from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Pause, Edit, Trash2, Calendar, Database, AlertTriangle } from 'lucide-react';

export default function WorkflowList({ onEditWorkflow }) {
  const { state, dispatch } = useApp();

  const toggleWorkflow = (workflow) => {
    dispatch({
      type: 'UPDATE_WORKFLOW',
      payload: { ...workflow, isActive: !workflow.isActive }
    });
  };

  const deleteWorkflow = (workflowId) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      dispatch({
        type: 'DELETE_WORKFLOW',
        payload: workflowId
      });
    }
  };

  const getTriggerIcon = (triggerType) => {
    switch (triggerType) {
      case 'data_threshold':
        return Database;
      case 'schedule':
        return Calendar;
      default:
        return AlertTriangle;
    }
  };

  const getTriggerDescription = (workflow) => {
    if (workflow.triggerType === 'data_threshold') {
      const { field, operator, threshold } = workflow.triggerConfig;
      return `When ${field} ${operator} ${threshold}`;
    }
    if (workflow.triggerType === 'schedule') {
      const { interval, time } = workflow.triggerConfig;
      return `${interval} at ${time}`;
    }
    return 'Custom trigger';
  };

  const getActionDescription = (workflow) => {
    if (workflow.actionType === 'send_alert') {
      return 'Send alert notification';
    }
    if (workflow.actionType === 'generate_report') {
      return 'Generate report';
    }
    return 'Custom action';
  };

  return (
    <div className="space-y-4">
      {state.workflows.length === 0 ? (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-dark-muted" />
          </div>
          <h3 className="text-lg font-semibold text-dark-text mb-2">No workflows yet</h3>
          <p className="text-dark-muted mb-4">
            Create your first workflow to start automating your processes
          </p>
          <button
            onClick={() => onEditWorkflow(null)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Create Workflow
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {state.workflows.map((workflow) => {
            const TriggerIcon = getTriggerIcon(workflow.triggerType);
            
            return (
              <div
                key={workflow.id}
                className="bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${workflow.isActive ? 'bg-green-400/10' : 'bg-gray-400/10'}`}>
                      <TriggerIcon className={`w-6 h-6 ${workflow.isActive ? 'text-green-400' : 'text-gray-400'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-dark-text">{workflow.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          workflow.isActive 
                            ? 'bg-green-400/10 text-green-400' 
                            : 'bg-gray-400/10 text-gray-400'
                        }`}>
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-dark-muted">
                          <span className="font-medium">Trigger:</span> {getTriggerDescription(workflow)}
                        </p>
                        <p className="text-sm text-dark-muted">
                          <span className="font-medium">Action:</span> {getActionDescription(workflow)}
                        </p>
                      </div>
                      
                      <p className="text-xs text-dark-muted mt-2">
                        Created {new Date(workflow.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleWorkflow(workflow)}
                      className={`p-2 rounded-md transition-colors ${
                        workflow.isActive 
                          ? 'text-green-400 hover:bg-green-400/10' 
                          : 'text-gray-400 hover:bg-gray-400/10'
                      }`}
                      title={workflow.isActive ? 'Pause workflow' : 'Start workflow'}
                    >
                      {workflow.isActive ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => onEditWorkflow(workflow)}
                      className="p-2 text-dark-muted hover:text-dark-text hover:bg-dark-border rounded-md transition-colors"
                      title="Edit workflow"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteWorkflow(workflow.id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                      title="Delete workflow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}