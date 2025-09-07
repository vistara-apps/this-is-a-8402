import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, AlertTriangle, CheckCircle, Database } from 'lucide-react';

export default function RecentActivity() {
  const { state } = useApp();

  // Combine different types of activities
  const activities = [
    ...state.alerts.slice(0, 3).map(alert => ({
      id: alert.id,
      type: 'alert',
      title: 'Alert Triggered',
      description: alert.message,
      timestamp: alert.timestamp,
      icon: AlertTriangle,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-400/10'
    })),
    {
      id: 'data-update',
      type: 'data',
      title: 'Data Source Updated',
      description: 'Sales Data received new entries',
      timestamp: new Date().toISOString(),
      icon: Database,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10'
    },
    {
      id: 'workflow-run',
      type: 'workflow',
      title: 'Workflow Executed',
      description: 'Daily Report workflow completed successfully',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      icon: CheckCircle,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-400/10'
    }
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-dark-text">Recent Activity</h3>
        <button className="text-primary hover:text-primary/80 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`${activity.iconBg} p-2 rounded-md`}>
                <Icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-dark-text">{activity.title}</p>
                  <div className="flex items-center space-x-1 text-dark-muted">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{formatTime(activity.timestamp)}</span>
                  </div>
                </div>
                <p className="text-sm text-dark-muted mt-1">{activity.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-dark-border rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-dark-muted" />
          </div>
          <p className="text-dark-muted">No recent activity</p>
        </div>
      )}
    </div>
  );
}