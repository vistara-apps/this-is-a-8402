import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Save, Play, Sparkles, MessageSquare } from 'lucide-react';
import { generateWorkflowSuggestions, parseNaturalLanguageWorkflow } from '../../lib/openai';
import { isFeatureAvailable } from '../../lib/stripe';
import toast from 'react-hot-toast';

export default function WorkflowBuilder({ workflow, onClose }) {
  const { dispatch, state } = useApp();
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

  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);

  const userTier = state.user?.subscriptionTier || 'free';
  const hasAIFeatures = isFeatureAvailable(userTier, 'ai_insights');

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

  const handleNaturalLanguageParse = async () => {
    if (!naturalLanguageInput.trim()) {
      toast.error('Please enter a workflow description');
      return;
    }

    if (!hasAIFeatures) {
      toast.error('AI features are available in Pro and Business plans');
      return;
    }

    setLoadingAI(true);
    try {
      const parsed = await parseNaturalLanguageWorkflow(naturalLanguageInput);
      
      if (parsed.confidence > 0.7) {
        setFormData(prev => ({
          ...prev,
          name: parsed.name,
          triggerType: parsed.triggerType,
          triggerConfig: parsed.triggerConfig,
          actionType: parsed.actionType,
          actionConfig: parsed.actionConfig
        }));
        toast.success('Workflow parsed successfully!');
        setShowAIHelper(false);
      } else {
        toast.error('Could not parse workflow description. Please be more specific.');
      }
    } catch (error) {
      toast.error('Failed to parse workflow description');
    } finally {
      setLoadingAI(false);
    }
  };

  const generateAISuggestions = async () => {
    if (!hasAIFeatures) {
      toast.error('AI features are available in Pro and Business plans');
      return;
    }

    setLoadingAI(true);
    try {
      const suggestions = await generateWorkflowSuggestions(
        `Current data sources: ${state.dataSources.map(ds => ds.name).join(', ')}`
      );
      setAiSuggestions(suggestions);
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setLoadingAI(false);
    }
  };

  const applySuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      triggerType: suggestion.triggerType,
      triggerConfig: suggestion.triggerConfig,
      actionType: suggestion.actionType,
      actionConfig: suggestion.actionConfig
    }));
    setAiSuggestions([]);
    toast.success('Suggestion applied!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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

        {/* AI Helper Toggle */}
        <div className="flex items-center space-x-2">
          {hasAIFeatures && (
            <button
              onClick={() => setShowAIHelper(!showAIHelper)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Helper</span>
            </button>
          )}
          
          <button
            onClick={generateAISuggestions}
            disabled={loadingAI || !hasAIFeatures}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Get Suggestions</span>
          </button>
        </div>
      </div>

      {/* AI Helper Panel */}
      {showAIHelper && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-dark-text mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            Natural Language Workflow Builder
          </h3>
          <p className="text-dark-muted mb-4">
            Describe your workflow in plain English, and AI will configure it for you.
          </p>
          
          <div className="flex space-x-4">
            <input
              type="text"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              placeholder="e.g., 'Send me an email when sales exceed $5000'"
              className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleNaturalLanguageParse}
              disabled={loadingAI}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingAI ? 'Parsing...' : 'Parse'}
            </button>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-dark-text mb-4">AI Suggestions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="bg-dark-surface border border-dark-border rounded-lg p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
                onClick={() => applySuggestion(suggestion)}
              >
                <h4 className="font-medium text-dark-text mb-2">{suggestion.name}</h4>
                <p className="text-sm text-dark-muted mb-3">{suggestion.description}</p>
                <div className="text-xs text-blue-400">
                  {suggestion.triggerType} → {suggestion.actionType}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <option value="webhook">Webhook</option>
                  <option value="file_upload">File Upload</option>
                  <option value="data_change">Data Change</option>
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

              {formData.triggerType === 'webhook' && (
                <div>
                  <label className="block text-sm font-medium text-dark-text mb-2">
                    Webhook URL
                  </label>
                  <div className="bg-dark-bg border border-dark-border rounded-md p-3">
                    <code className="text-sm text-green-400">
                      https://api.flowstate.com/webhooks/{workflow?.id || 'new-workflow'}
                    </code>
                  </div>
                  <p className="text-xs text-dark-muted mt-2">
                    Use this URL to trigger the workflow from external services
                  </p>
                </div>
              )}

              {formData.triggerType === 'file_upload' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      File Type
                    </label>
                    <select
                      value={formData.triggerConfig.fileType || 'csv'}
                      onChange={(e) => updateTriggerConfig('fileType', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                      <option value="xlsx">Excel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Minimum File Size (KB)
                    </label>
                    <input
                      type="number"
                      value={formData.triggerConfig.minSize || 1}
                      onChange={(e) => updateTriggerConfig('minSize', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {formData.triggerType === 'data_change' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Data Source
                    </label>
                    <select
                      value={formData.triggerConfig.dataSourceId || ''}
                      onChange={(e) => updateTriggerConfig('dataSourceId', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select data source</option>
                      {state.dataSources.map(ds => (
                        <option key={ds.id} value={ds.id}>{ds.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Change Type
                    </label>
                    <select
                      value={formData.triggerConfig.changeType || 'any'}
                      onChange={(e) => updateTriggerConfig('changeType', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="any">Any Change</option>
                      <option value="insert">New Records</option>
                      <option value="update">Updated Records</option>
                      <option value="delete">Deleted Records</option>
                    </select>
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
                  <option value="webhook">Call Webhook</option>
                  <option value="slack_message">Send Slack Message</option>
                  <option value="export_data">Export Data</option>
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
                <>
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
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.actionConfig.subject || ''}
                      onChange={(e) => updateActionConfig('subject', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Email subject"
                    />
                  </div>
                </>
              )}

              {formData.actionType === 'webhook' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={formData.actionConfig.url || ''}
                      onChange={(e) => updateActionConfig('url', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://api.example.com/webhook"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      HTTP Method
                    </label>
                    <select
                      value={formData.actionConfig.method || 'POST'}
                      onChange={(e) => updateActionConfig('method', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                </>
              )}

              {formData.actionType === 'slack_message' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Slack Channel
                    </label>
                    <input
                      type="text"
                      value={formData.actionConfig.channel || ''}
                      onChange={(e) => updateActionConfig('channel', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="#general"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Message
                    </label>
                    <textarea
                      value={formData.actionConfig.message || ''}
                      onChange={(e) => updateActionConfig('message', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Slack message content"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {formData.actionType === 'export_data' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Export Format
                    </label>
                    <select
                      value={formData.actionConfig.format || 'csv'}
                      onChange={(e) => updateActionConfig('format', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                      <option value="xlsx">Excel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-text mb-2">
                      Include Headers
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.actionConfig.includeHeaders ?? true}
                        onChange={(e) => updateActionConfig('includeHeaders', e.target.checked)}
                        className="rounded border-dark-border bg-dark-bg text-primary focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="text-sm text-dark-text">Include column headers</span>
                    </label>
                  </div>
                </>
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
