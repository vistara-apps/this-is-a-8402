import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCircle, AlertTriangle, Clock, X } from 'lucide-react';

export default function Alerts() {
  const { state, dispatch } = useApp();

  const markAsRead = (alertId) => {
    dispatch({
      type: 'MARK_ALERT_READ',
      payload: alertId
    });
  };

  const markAllAsRead = () => {
    state.alerts.forEach(alert => {
      if (!alert.isRead) {
        dispatch({
          type: 'MARK_ALERT_READ',
          payload: alert.id
        });
      }
    });
  };

  const getAlertIcon = (alert) => {
    const workflow = state.workflows.find(w => w.id === alert.workflowId);
    if (workflow?.actionType === 'send_alert') {
      return AlertTriangle;
    }
    return CheckCircle;
  };

  const getAlertColor = (alert) => {
    const workflow = state.workflows.find(w => w.id === alert.workflowId);
    if (workflow?.actionType === 'send_alert') {
      return {
        icon: 'text-orange-400',
        bg: 'bg-orange-400/10'
      };
    }
    return {
      icon: 'text-green-400',
      bg: 'bg-green-400/10'
    };
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = state.alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Alerts</h1>
          <p className="text-dark-muted mt-1">
            Stay informed about your workflow activities and important events
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Alerts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-400/10 rounded-md">
              <Bell className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-text">{unreadCount}</p>
              <p className="text-sm text-dark-muted">Unread Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-400/10 rounded-md">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-text">{state.alerts.length}</p>
              <p className="text-sm text-dark-muted">Total Alerts</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-400/10 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-dark-text">
                {state.workflows.filter(w => w.isActive).length}
              </p>
              <p className="text-sm text-dark-muted">Active Workflows</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-dark-surface border border-dark-border rounded-lg">
        {state.alerts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-dark-muted" />
            </div>
            <h3 className="text-lg font-semibold text-dark-text mb-2">No alerts yet</h3>
            <p className="text-dark-muted">
              Alerts from your workflows will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {state.alerts.map((alert) => {
              const Icon = getAlertIcon(alert);
              const colors = getAlertColor(alert);
              const workflow = state.workflows.find(w => w.id === alert.workflowId);
              
              return (
                <div
                  key={alert.id}
                  className={`p-6 hover:bg-dark-bg/50 transition-colors ${
                    !alert.isRead ? 'border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${colors.bg} p-2 rounded-md`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            alert.isRead ? 'text-dark-muted' : 'text-dark-text'
                          }`}>
                            {alert.message}
                          </p>
                          
                          {workflow && (
                            <p className="text-xs text-dark-muted mt-1">
                              From workflow: {workflow.name}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-dark-muted">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(alert.timestamp)}</span>
                            </div>
                            <span>{new Date(alert.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="p-1 text-dark-muted hover:text-dark-text hover:bg-dark-border rounded transition-colors"
                            title={alert.isRead ? 'Already read' : 'Mark as read'}
                          >
                            {alert.isRead ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center justify-center space-x-2 text-sm text-dark-muted">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Real-time monitoring active</span>
      </div>
    </div>
  );
}