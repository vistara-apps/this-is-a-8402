import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema helper functions
export const createTables = async () => {
  // Users table is automatically created by Supabase Auth
  
  // Create workflows table
  const { error: workflowsError } = await supabase.rpc('create_workflows_table');
  if (workflowsError) console.error('Error creating workflows table:', workflowsError);
  
  // Create data_sources table
  const { error: dataSourcesError } = await supabase.rpc('create_data_sources_table');
  if (dataSourcesError) console.error('Error creating data_sources table:', dataSourcesError);
  
  // Create alerts table
  const { error: alertsError } = await supabase.rpc('create_alerts_table');
  if (alertsError) console.error('Error creating alerts table:', alertsError);
};

// Auth helpers
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database operations
export const getWorkflows = async (userId) => {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createWorkflow = async (workflow) => {
  const { data, error } = await supabase
    .from('workflows')
    .insert([workflow])
    .select();
  
  return { data, error };
};

export const updateWorkflow = async (id, updates) => {
  const { data, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', id)
    .select();
  
  return { data, error };
};

export const deleteWorkflow = async (id) => {
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id);
  
  return { error };
};

export const getDataSources = async (userId) => {
  const { data, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createDataSource = async (dataSource) => {
  const { data, error } = await supabase
    .from('data_sources')
    .insert([dataSource])
    .select();
  
  return { data, error };
};

export const getAlerts = async (userId) => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  return { data, error };
};

export const createAlert = async (alert) => {
  const { data, error } = await supabase
    .from('alerts')
    .insert([alert])
    .select();
  
  return { data, error };
};

export const markAlertAsRead = async (id) => {
  const { data, error } = await supabase
    .from('alerts')
    .update({ is_read: true })
    .eq('id', id)
    .select();
  
  return { data, error };
};
