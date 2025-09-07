import React from 'react';
import { useApp } from '../../context/AppContext';
import MetricsOverview from './MetricsOverview';
import RecentActivity from './RecentActivity';
import WorkflowStatus from './WorkflowStatus';
import DataChart from './DataChart';

export default function Dashboard() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text">Dashboard</h1>
        <p className="text-dark-muted mt-1">
          Monitor your workflows and data in real-time
        </p>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <DataChart />
        </div>

        {/* Workflow Status - Takes 1 column */}
        <div>
          <WorkflowStatus />
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}