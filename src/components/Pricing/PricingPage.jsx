import React, { useState } from 'react';
import { Check, Zap, Crown, Building } from 'lucide-react';
import { SUBSCRIPTION_TIERS, formatPrice, createCheckoutSession } from '../../lib/stripe';
import { useAuth } from '../Auth/AuthProvider';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const [loading, setLoading] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { user } = useAuth();

  const handleSubscribe = async (tier) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    if (tier.id === 'free') {
      toast.info('You are already on the free plan');
      return;
    }

    setLoading(tier.id);

    try {
      await createCheckoutSession(tier.priceId);
    } catch (error) {
      toast.error('Failed to start checkout process');
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  const tiers = [
    {
      ...SUBSCRIPTION_TIERS.FREE,
      icon: Zap,
      color: 'text-gray-400',
      bgColor: 'bg-gray-400/10',
      popular: false
    },
    {
      ...SUBSCRIPTION_TIERS.PRO,
      icon: Crown,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      popular: true
    },
    {
      ...SUBSCRIPTION_TIERS.BUSINESS,
      icon: Building,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-dark-bg py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-text mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-dark-muted max-w-2xl mx-auto">
            Start with our free plan and upgrade as your automation needs grow
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-white'
                  : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-white'
                  : 'text-dark-muted hover:text-dark-text'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const yearlyPrice = Math.round(tier.price * 12 * 0.8); // 20% discount
            const displayPrice = billingCycle === 'yearly' ? yearlyPrice / 12 : tier.price;
            
            return (
              <div
                key={tier.id}
                className={`relative bg-dark-surface border rounded-xl p-8 ${
                  tier.popular
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-dark-border'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div className={`inline-flex p-3 rounded-lg ${tier.bgColor} mb-4`}>
                    <Icon className={`w-6 h-6 ${tier.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-dark-text mb-2">
                    {tier.name}
                  </h3>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-dark-text">
                      {formatPrice(displayPrice)}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-dark-muted">
                        /{billingCycle === 'yearly' ? 'mo' : 'month'}
                      </span>
                    )}
                    {billingCycle === 'yearly' && tier.price > 0 && (
                      <div className="text-sm text-dark-muted mt-1">
                        Billed {formatPrice(yearlyPrice)} yearly
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={loading === tier.id}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-6 ${
                      tier.popular
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-dark-border text-dark-text hover:bg-dark-border/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === tier.id ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : tier.id === 'free' ? (
                      'Get Started'
                    ) : (
                      'Subscribe'
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-dark-muted text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits Display */}
                <div className="mt-6 pt-6 border-t border-dark-border">
                  <h4 className="text-sm font-medium text-dark-text mb-3">Usage Limits</h4>
                  <div className="space-y-2 text-xs text-dark-muted">
                    <div className="flex justify-between">
                      <span>Workflows:</span>
                      <span>{tier.limits.workflows === -1 ? 'Unlimited' : tier.limits.workflows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Sources:</span>
                      <span>{tier.limits.dataSources === -1 ? 'Unlimited' : tier.limits.dataSources}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alerts/Month:</span>
                      <span>{tier.limits.alertsPerMonth === -1 ? 'Unlimited' : tier.limits.alertsPerMonth.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-dark-text text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-dark-text mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-dark-muted">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any billing adjustments.
              </p>
            </div>
            
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-dark-text mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-dark-muted">
                We'll notify you when you're approaching your limits. If you exceed them, 
                we'll suggest upgrading to a higher plan to continue using all features.
              </p>
            </div>
            
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-dark-text mb-2">
                Is there a free trial?
              </h3>
              <p className="text-dark-muted">
                Our free plan gives you access to core features with no time limit. 
                You can upgrade to paid plans anytime to unlock advanced features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
