# FlowState

**Automate tasks, gain clarity, and stay in control of your workflows.**

FlowState is a comprehensive web application that helps users automate manual tasks and gain better visibility into their processes by centralizing data and providing actionable alerts.

## 🚀 Features

### Core Features
- **Automated Workflow Triggering**: Set up 'if-this-then-that' style rules to automate repetitive tasks
- **Data Aggregation & Centralization**: Connect various data sources into a unified view
- **Real-time Status Dashboards**: Visualize key metrics and workflow progress
- **Actionable Alerting System**: Get notified when critical events occur

### Advanced Features
- **AI-Powered Insights**: Natural language workflow creation and data analysis (Pro/Business)
- **Multiple Trigger Types**: Data thresholds, schedules, webhooks, file uploads, data changes
- **Flexible Actions**: Alerts, emails, webhooks, Slack messages, reports, data exports
- **Subscription Management**: Freemium model with tiered features

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **AI**: OpenAI GPT-3.5 Turbo
- **Payments**: Stripe
- **Charts**: Recharts
- **File Processing**: Papa Parse (CSV)
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key (for AI features)
- Stripe account (for payments)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-8402.git
cd this-is-a-8402
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration (for AI features)
VITE_OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration (for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
VITE_STRIPE_PRO_PRICE_ID=your-stripe-pro-price-id
VITE_STRIPE_BUSINESS_PRICE_ID=your-stripe-business-price-id
```

### 4. Database Setup

Create the following tables in your Supabase database:

```sql
-- Users table (handled by Supabase Auth)
-- Additional user profile data
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  action_type TEXT NOT NULL,
  action_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Sources table
CREATE TABLE data_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  data JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own workflows" ON workflows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own data sources" ON data_sources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/                 # Authentication components
│   ├── Dashboard/            # Dashboard and metrics
│   ├── Workflows/            # Workflow management
│   ├── DataSources/          # Data source management
│   ├── Alerts/              # Alert system
│   ├── Layout/              # Layout components
│   └── Pricing/             # Subscription management
├── context/                 # React context providers
├── lib/                     # External service integrations
│   ├── supabase.js         # Supabase client
│   ├── openai.js           # OpenAI integration
│   └── stripe.js           # Stripe integration
└── styles/                  # Global styles
```

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Run the database setup SQL from above
3. Get your project URL and anon key from Settings > API
4. Add them to your `.env` file

### OpenAI Setup

1. Get an API key from OpenAI
2. Add it to your `.env` file
3. AI features will be available for Pro/Business users

### Stripe Setup

1. Create a Stripe account
2. Set up products and prices for Pro ($15/month) and Business ($45/month) plans
3. Add your publishable key and price IDs to `.env`
4. Configure webhooks for subscription management

## 🎯 Usage

### Creating Workflows

1. Navigate to Workflows section
2. Click "Create Workflow"
3. Choose a trigger type (data threshold, schedule, webhook, etc.)
4. Configure trigger conditions
5. Select an action (alert, email, webhook, etc.)
6. Save and activate

### AI-Powered Features (Pro/Business)

- **Natural Language Workflows**: Describe workflows in plain English
- **AI Suggestions**: Get workflow recommendations based on your data
- **Smart Insights**: AI-generated analysis of your data patterns

### Data Sources

1. Go to Data Sources section
2. Click "Add Data Source"
3. Upload CSV files or connect to APIs
4. Configure column mapping and data types

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication via Supabase
- API keys stored securely in environment variables
- Input validation and sanitization

## 📊 Subscription Tiers

### Free
- Up to 3 workflows
- Basic dashboards
- 1 data source
- 100 alerts/month

### Pro ($15/month)
- Unlimited workflows
- Advanced dashboards
- Unlimited data sources
- AI-powered insights
- 10,000 alerts/month

### Business ($45/month)
- Everything in Pro
- Team collaboration
- Advanced analytics
- Dedicated support
- Unlimited alerts

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@flowstate.com
- 💬 Discord: [Join our community](https://discord.gg/flowstate)
- 📖 Documentation: [docs.flowstate.com](https://docs.flowstate.com)

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] API marketplace integrations
- [ ] Custom webhook builder
- [ ] Advanced AI features

---

Built with ❤️ by the FlowState team
