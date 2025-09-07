import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Search, Plus } from 'lucide-react';

export default function Header() {
  const { state } = useApp();
  const unreadAlerts = state.alerts.filter(alert => !alert.isRead).length;

  return (
    <header className="bg-dark-surface border-b border-dark-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-dark-text">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-md text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-dark-muted hover:text-dark-text transition-colors">
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Quick Actions */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Workflow</span>
          </button>
        </div>
      </div>
    </header>
  );
}