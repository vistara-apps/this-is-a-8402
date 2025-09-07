import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Upload, Database, Calendar, BarChart3 } from 'lucide-react';

export default function DataSources() {
  const { state, dispatch } = useApp();
  const [showUpload, setShowUpload] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      // Simulate CSV parsing
      const newDataSource = {
        name: file.name.replace('.csv', ''),
        type: 'csv',
        config: { columns: ['date', 'amount', 'customer'] },
        data: [
          { date: '2024-01-06', amount: 1300, customer: 'Customer F' },
          { date: '2024-01-07', amount: 900, customer: 'Customer G' },
          { date: '2024-01-08', amount: 1800, customer: 'Customer H' }
        ],
        createdAt: new Date().toISOString()
      };

      dispatch({
        type: 'ADD_DATA_SOURCE',
        payload: newDataSource
      });
      setShowUpload(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text">Data Sources</h1>
          <p className="text-dark-muted mt-1">
            Connect and manage your data sources for automation
          </p>
        </div>
        
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Data Source</span>
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-dark-text mb-4">Upload Data Source</h3>
            
            <div className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-dark-muted mx-auto mb-4" />
              <p className="text-dark-text mb-2">Upload a CSV file</p>
              <p className="text-sm text-dark-muted mb-4">Supports CSV files up to 10MB</p>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 text-dark-muted hover:text-dark-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Sources List */}
      <div className="grid gap-6">
        {state.dataSources.length === 0 ? (
          <div className="bg-dark-surface border border-dark-border rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-dark-border rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-dark-muted" />
            </div>
            <h3 className="text-lg font-semibold text-dark-text mb-2">No data sources</h3>
            <p className="text-dark-muted mb-4">
              Connect your first data source to start automating workflows
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Add Data Source
            </button>
          </div>
        ) : (
          state.dataSources.map((dataSource) => (
            <div
              key={dataSource.id}
              className="bg-dark-surface border border-dark-border rounded-lg p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-400/10 rounded-lg">
                    <Database className="w-6 h-6 text-blue-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-1">
                      {dataSource.name}
                    </h3>
                    <p className="text-dark-muted text-sm mb-2">
                      {dataSource.type.toUpperCase()} • {dataSource.data?.length || 0} records
                    </p>
                    
                    {dataSource.config.columns && (
                      <div className="flex flex-wrap gap-1">
                        {dataSource.config.columns.map((column) => (
                          <span
                            key={column}
                            className="px-2 py-1 bg-dark-bg text-dark-muted text-xs rounded-md"
                          >
                            {column}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-dark-muted hover:text-dark-text hover:bg-dark-border rounded-md transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sample Data Preview */}
              {dataSource.data && dataSource.data.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-dark-text mb-3">Sample Data</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-dark-border">
                          {dataSource.config.columns.map((column) => (
                            <th
                              key={column}
                              className="text-left py-2 px-3 text-dark-muted font-medium"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dataSource.data.slice(0, 3).map((row, index) => (
                          <tr key={index} className="border-b border-dark-border/50">
                            {dataSource.config.columns.map((column) => (
                              <td key={column} className="py-2 px-3 text-dark-text">
                                {column === 'amount' && typeof row[column] === 'number'
                                  ? `$${row[column].toLocaleString()}`
                                  : row[column]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {dataSource.data.length > 3 && (
                    <p className="text-xs text-dark-muted mt-2">
                      +{dataSource.data.length - 3} more records
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-dark-border flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-dark-muted">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Added {new Date(dataSource.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}