import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-openai-api-key',
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
});

// Generate workflow suggestions based on user input
export const generateWorkflowSuggestions = async (description) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a workflow automation expert. Given a user's description, suggest specific workflow configurations with triggers and actions. 
          
          Respond with a JSON array of workflow suggestions. Each suggestion should have:
          - name: string (descriptive name)
          - description: string (what it does)
          - triggerType: string (data_threshold, schedule, webhook, file_upload)
          - triggerConfig: object (configuration for the trigger)
          - actionType: string (send_alert, send_email, webhook, generate_report)
          - actionConfig: object (configuration for the action)
          
          Keep suggestions practical and implementable.`
        },
        {
          role: "user",
          content: description
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating workflow suggestions:', error);
    return [];
  }
};

// Generate insights from data
export const generateDataInsights = async (data, context = '') => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a data analyst. Analyze the provided data and generate actionable insights. 
          Focus on trends, anomalies, and recommendations. Keep insights concise and business-focused.
          
          Respond with a JSON object containing:
          - summary: string (brief overview)
          - trends: array of strings (key trends identified)
          - anomalies: array of strings (unusual patterns)
          - recommendations: array of strings (actionable suggestions)`
        },
        {
          role: "user",
          content: `Context: ${context}\n\nData: ${JSON.stringify(data, null, 2)}`
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating data insights:', error);
    return {
      summary: 'Unable to generate insights at this time.',
      trends: [],
      anomalies: [],
      recommendations: []
    };
  }
};

// Generate alert message based on trigger data
export const generateAlertMessage = async (triggerData, workflowName) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an alert system. Generate a clear, actionable alert message based on the trigger data.
          Keep it concise but informative. Include relevant data points and suggested actions if appropriate.`
        },
        {
          role: "user",
          content: `Workflow: ${workflowName}\nTrigger Data: ${JSON.stringify(triggerData, null, 2)}`
        }
      ],
      max_tokens: 200,
      temperature: 0.5
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating alert message:', error);
    return `Alert triggered for workflow: ${workflowName}`;
  }
};

// Natural language workflow creation
export const parseNaturalLanguageWorkflow = async (description) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a workflow parser. Convert natural language descriptions into structured workflow configurations.
          
          Respond with a JSON object containing:
          - name: string (workflow name)
          - triggerType: string (data_threshold, schedule, webhook, file_upload)
          - triggerConfig: object (specific configuration)
          - actionType: string (send_alert, send_email, webhook, generate_report)
          - actionConfig: object (specific configuration)
          - confidence: number (0-1, how confident you are in the parsing)
          
          If you can't parse it clearly, set confidence to 0.`
        },
        {
          role: "user",
          content: description
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing natural language workflow:', error);
    return {
      name: 'Custom Workflow',
      triggerType: 'data_threshold',
      triggerConfig: {},
      actionType: 'send_alert',
      actionConfig: {},
      confidence: 0
    };
  }
};
