import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Workflow, Database, AlertTriangle } from 'lucide-react';

export default function MetricsOverview() {
  const { state } = useApp();
  
  const activeWorkflows = state.workflows.filter(w => w.isActive).length;
  const totalDataSources = state.dataSources.length;
  const unreadAlerts = state.alerts.filter(a => !a.isRead).length;
  
  // Calculate total value from data sources
  const totalValue = state.dataSources.reduce((total, ds) => {
    if (ds.data) {
      return total + ds.data.reduce((sum, row) => sum + (row.amount || 0), 0);
    }
    return total;
  }, 0);

  const metrics = [
    {
      title: 'Total Value',
      value: `$${totalValue.toLocaleString()}`,
      change: '+12.5%',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-400/10'
    },
    {
      title: 'Active Workflows',
      value: activeWorkflows.toString(),
      change: '+2',
      icon: Workflow,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: 'Data Sources',
      value: totalDataSources.toString(),
      change: '+1',
      icon: Database,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      title: 'Unread Alerts',
      value: unreadAlerts.toString(),
      change: `${unreadAlerts > 0 ? '+' : ''}${unreadAlerts}`,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <div
            key={index}
            className="bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-dark-muted text-sm font-medium">{metric.title}</p>
                <p className="text-2xl font-bold text-dark-text mt-1">{metric.value}</p>
                <p className={`text-sm mt-1 ${metric.color}`}>{metric.change}</p>
              </div>
              <div className={`${metric.bg} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}