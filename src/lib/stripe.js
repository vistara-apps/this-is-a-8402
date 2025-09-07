import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Up to 3 workflows',
      'Basic dashboards',
      '1 data source',
      'Email support'
    ],
    limits: {
      workflows: 3,
      dataSources: 1,
      alertsPerMonth: 100,
      apiCalls: 1000
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 15,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro',
    features: [
      'Unlimited workflows',
      'Advanced dashboards',
      'Unlimited data sources',
      'AI-powered insights',
      'Priority support',
      'Custom integrations'
    ],
    limits: {
      workflows: -1, // unlimited
      dataSources: -1,
      alertsPerMonth: 10000,
      apiCalls: 50000
    }
  },
  BUSINESS: {
    id: 'business',
    name: 'Business',
    price: 45,
    priceId: import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID || 'price_business',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ],
    limits: {
      workflows: -1,
      dataSources: -1,
      alertsPerMonth: -1,
      apiCalls: -1,
      teamMembers: 10
    }
  }
};

// Create checkout session
export const createCheckoutSession = async (priceId, customerId = null) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create customer portal session
export const createPortalSession = async (customerId) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/dashboard`,
      }),
    });

    const session = await response.json();
    
    if (session.error) {
      throw new Error(session.error);
    }

    window.location.href = session.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

// Check subscription limits
export const checkSubscriptionLimits = (userTier, resource, currentCount) => {
  const tier = SUBSCRIPTION_TIERS[userTier.toUpperCase()];
  if (!tier) return { allowed: false, limit: 0 };

  const limit = tier.limits[resource];
  if (limit === -1) return { allowed: true, limit: -1 }; // unlimited
  
  return {
    allowed: currentCount < limit,
    limit,
    remaining: Math.max(0, limit - currentCount)
  };
};

// Get tier features
export const getTierFeatures = (tierName) => {
  const tier = SUBSCRIPTION_TIERS[tierName.toUpperCase()];
  return tier ? tier.features : [];
};

// Check if feature is available for tier
export const isFeatureAvailable = (userTier, feature) => {
  const tier = SUBSCRIPTION_TIERS[userTier.toUpperCase()];
  if (!tier) return false;

  const featureMap = {
    'ai_insights': ['PRO', 'BUSINESS'],
    'custom_integrations': ['PRO', 'BUSINESS'],
    'team_collaboration': ['BUSINESS'],
    'advanced_analytics': ['BUSINESS'],
    'priority_support': ['PRO', 'BUSINESS'],
    'dedicated_support': ['BUSINESS']
  };

  return featureMap[feature]?.includes(userTier.toUpperCase()) || false;
};

// Format price for display
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
};

// Webhook handler for subscription updates (to be used in backend)
export const handleStripeWebhook = async (event) => {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Update user subscription in database
      const subscription = event.data.object;
      console.log('Subscription updated:', subscription);
      break;
    
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      const canceledSubscription = event.data.object;
      console.log('Subscription canceled:', canceledSubscription);
      break;
    
    case 'invoice.payment_succeeded':
      // Handle successful payment
      const invoice = event.data.object;
      console.log('Payment succeeded:', invoice);
      break;
    
    case 'invoice.payment_failed':
      // Handle failed payment
      const failedInvoice = event.data.object;
      console.log('Payment failed:', failedInvoice);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};
