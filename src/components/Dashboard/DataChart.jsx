import React from 'react';
import { useApp } from '../../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DataChart() {
  const { state } = useApp();
  
  // Prepare chart data from data sources
  const chartData = state.dataSources[0]?.data?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: item.amount,
    customer: item.customer
  })) || [];

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-dark-text">Revenue Trend</h3>
          <p className="text-dark-muted text-sm">Daily sales performance</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-primary text-white rounded-md">7D</button>
          <button className="px-3 py-1 text-xs text-dark-muted hover:text-dark-text rounded-md">30D</button>
          <button className="px-3 py-1 text-xs text-dark-muted hover:text-dark-text rounded-md">90D</button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value, name) => [`$${value}`, 'Amount']}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-dark-text">
            ${chartData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
          </p>
          <p className="text-dark-muted text-sm">Total Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-dark-text">
            ${chartData.length > 0 ? Math.round(chartData.reduce((sum, item) => sum + item.amount, 0) / chartData.length).toLocaleString() : 0}
          </p>
          <p className="text-dark-muted text-sm">Average Daily</p>
        </div>
      </div>
    </div>
  );
}