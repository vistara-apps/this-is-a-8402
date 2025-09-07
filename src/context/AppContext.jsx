import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

// Initial state
const initialState = {
  user: {
    id: '1',
    email: 'user@example.com',
    subscriptionTier: 'free'
  },
  workflows: [
    {
      id: '1',
      name: 'High Value Alert',
      triggerType: 'data_threshold',
      triggerConfig: { field: 'value', operator: '>', threshold: 1000 },
      actionType: 'send_alert',
      actionConfig: { message: 'High value detected!' },
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Daily Report',
      triggerType: 'schedule',
      triggerConfig: { interval: 'daily', time: '09:00' },
      actionType: 'generate_report',
      actionConfig: { type: 'summary' },
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  dataSources: [
    {
      id: '1',
      name: 'Sales Data',
      type: 'csv',
      config: { columns: ['date', 'amount', 'customer'] },
      data: [
        { date: '2024-01-01', amount: 1200, customer: 'Customer A' },
        { date: '2024-01-02', amount: 800, customer: 'Customer B' },
        { date: '2024-01-03', amount: 1500, customer: 'Customer C' },
        { date: '2024-01-04', amount: 950, customer: 'Customer D' },
        { date: '2024-01-05', amount: 2100, customer: 'Customer E' }
      ],
      createdAt: new Date().toISOString()
    }
  ],
  alerts: [
    {
      id: '1',
      workflowId: '1',
      message: 'High value detected: $2100 from Customer E',
      timestamp: new Date().toISOString(),
      isRead: false
    },
    {
      id: '2',
      workflowId: '2',
      message: 'Daily report generated successfully',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      isRead: true
    }
  ]
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_WORKFLOW':
      return {
        ...state,
        workflows: [...state.workflows, { ...action.payload, id: Date.now().toString() }]
      };
    
    case 'UPDATE_WORKFLOW':
      return {
        ...state,
        workflows: state.workflows.map(w => 
          w.id === action.payload.id ? { ...w, ...action.payload } : w
        )
      };
    
    case 'DELETE_WORKFLOW':
      return {
        ...state,
        workflows: state.workflows.filter(w => w.id !== action.payload)
      };
    
    case 'ADD_DATA_SOURCE':
      return {
        ...state,
        dataSources: [...state.dataSources, { ...action.payload, id: Date.now().toString() }]
      };
    
    case 'UPDATE_DATA_SOURCE':
      return {
        ...state,
        dataSources: state.dataSources.map(ds => 
          ds.id === action.payload.id ? { ...ds, ...action.payload } : ds
        )
      };
    
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [{ ...action.payload, id: Date.now().toString() }, ...state.alerts]
      };
    
    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert => 
          alert.id === action.payload ? { ...alert, isRead: true } : alert
        )
      };
    
    case 'PROCESS_WORKFLOWS':
      // Simulate workflow processing
      const { dataSources, workflows } = state;
      const newAlerts = [];
      
      workflows.forEach(workflow => {
        if (!workflow.isActive) return;
        
        if (workflow.triggerType === 'data_threshold') {
          dataSources.forEach(dataSource => {
            if (dataSource.data) {
              dataSource.data.forEach(row => {
                const fieldValue = row[workflow.triggerConfig.field];
                const threshold = workflow.triggerConfig.threshold;
                const operator = workflow.triggerConfig.operator;
                
                let conditionMet = false;
                if (operator === '>' && fieldValue > threshold) conditionMet = true;
                if (operator === '<' && fieldValue < threshold) conditionMet = true;
                if (operator === '=' && fieldValue === threshold) conditionMet = true;
                
                if (conditionMet) {
                  newAlerts.push({
                    id: Date.now().toString() + Math.random(),
                    workflowId: workflow.id,
                    message: `${workflow.name}: ${workflow.triggerConfig.field} = ${fieldValue}`,
                    timestamp: new Date().toISOString(),
                    isRead: false
                  });
                }
              });
            }
          });
        }
      });
      
      return {
        ...state,
        alerts: [...newAlerts, ...state.alerts]
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Simulate real-time workflow processing
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'PROCESS_WORKFLOWS' });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}