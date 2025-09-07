import React from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  Database, 
  Bell, 
  Settings, 
  User,
  Zap
} from 'lucide-react';

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'workflows', name: 'Workflows', icon: Workflow },
  { id: 'data-sources', name: 'Data Sources', icon: Database },
  { id: 'alerts', name: 'Alerts', icon: Bell },
];

export default function Sidebar({ currentView, onViewChange }) {
  return (
    <div className="w-64 bg-dark-surface border-r border-dark-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-md flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-dark-text">FlowState</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-dark-muted hover:text-dark-text hover:bg-dark-border'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-dark-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-dark-border rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-dark-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-text truncate">John Doe</p>
            <p className="text-xs text-dark-muted truncate">Free Plan</p>
          </div>
          <Settings className="w-4 h-4 text-dark-muted hover:text-dark-text cursor-pointer" />
        </div>
      </div>
    </div>
  );
}