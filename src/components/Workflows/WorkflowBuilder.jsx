import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Save, Play } from 'lucide-react';

export default function WorkflowBuilder({ workflow, onClose }) {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    triggerType: workflow?.triggerType || 'data_threshold',
    triggerConfig: workflow?.triggerConfig || {
      field: 'amount',
      operator: '>',
      threshold: 1000
    },
    actionType: workflow?.actionType || 'send_alert',
    actionConfig: workflow?.actionConfig || {
      message: 'Threshold exceeded'
    },
    isActive: workflow?.isActive ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const workflowData = {
      ...formData,
      createdAt: workflow?.createdAt || new Date().toISOString()
    };

    if (workflow) {
      dispatch({
        type: 'UPDATE_WORKFLOW',
        payload: { ...workflowData, id: workflow.id }
      });
    } else {
      dispatch({
        type: 'ADD_WORKFLOW',
        payload: workflowData
      });
    }

    onClose();
  };

  const updateTriggerConfig = (key, value) => {
    setFormData(prev => ({
      ...prev,
      triggerConfig: {
        ...prev.triggerConfig,
        [key]: value
      }
    }));
  };

  const updateActionConfig = (key, value) => {
    setFormData(prev => ({
      ...prev,
      actionConfig: {
        ...prev.actionConfig,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onClose}
          className="p-2 text-dark-muted hover:text-dark-text hover:bg-dark-border rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-dark-text">
            {workflow ? 'Edit Workflow' : 'Create Workflow'}
          </h1>
          <p className="text-dark-muted mt-1">
            Set up automated triggers and actions for your data
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Settings */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Basic Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter workflow name"
                  required
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-dark-border bg-dark-bg text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="text-sm text-dark-text">Active immediately</span>
                </label>
              </div>
            </div>
          </div>

          {/* Trigger Configuration */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Trigger</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Trigger Type
                </label>
                <select
                  value={formData.triggerType}
                  onChange={(e) => setFormData(prev => ({ ...prev, triggerType: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="data_threshold">Data Threshold</option>
                  <option value="schedule">Schedule</option>
                </select>
              </div>

              {formData.triggerType === 'data_threshold' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Field
                    </label>
                    <select
                      value={formData.triggerConfig.field}
                      onChange={(e) => updateTriggerConfig('field', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="amount">Amount</option>
                      <option value="date">Date</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-dark-text mb-2">
                        Operator
                      </label>
                      <select
                        value={formData.triggerConfig.operator}
                        onChange={(e) => updateTriggerConfig('operator', e.target.value)}
                        className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value=">">Greater than</option>
                        <option value="<">Less than</option>
                        <option value="=">Equals</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-text mb-2">
                        Threshold
                      </label>
                      <input
                        type="number"
                        value={formData.triggerConfig.threshold}
                        onChange={(e) => updateTriggerConfig('threshold', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </>
              )}

              {formData.triggerType === 'schedule' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Interval
                    </label>
                    <select
                      value={formData.triggerConfig.interval || 'daily'}
                      onChange={(e) => updateTriggerConfig('interval', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.triggerConfig.time || '09:00'}
                      onChange={(e) => updateTriggerConfig('time', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Configuration */}
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Action</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Action Type
                </label>
                <select
                  value={formData.actionType}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionType: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="send_alert">Send Alert</option>
                  <option value="generate_report">Generate Report</option>
                  <option value="send_email">Send Email</option>
                </select>
              </div>

              {formData.actionType === 'send_alert' && (
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Alert Message
                  </label>
                  <input
                    type="text"
                    value={formData.actionConfig.message}
                    onChange={(e) => updateActionConfig('message', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter alert message"
                  />
                </div>
              )}

              {formData.actionType === 'generate_report' && (
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Report Type
                  </label>
                  <select
                    value={formData.actionConfig.type || 'summary'}
                    onChange={(e) => updateActionConfig('type', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="summary">Summary</option>
                    <option value="detailed">Detailed</option>
                    <option value="analytics">Analytics</option>
                  </select>
                </div>
              )}

              {formData.actionType === 'send_email' && (
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.actionConfig.email || ''}
                    onChange={(e) => updateActionConfig('email', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-dark-muted hover:text-dark-text transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{workflow ? 'Update' : 'Create'} Workflow</span>
          </button>
        </div>
      </form>
    </div>
  );
}