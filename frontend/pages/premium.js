import React from 'react';
import Link from 'next/link';

export default function PremiumPage() {
    const plans = [
        {
            id: 'monthly',
            name: 'Monthly',
            price: 9.99,
            period: 'month',
            features: [
                'Ad-free listening',
                'Unlimited downloads',
                'Offline playback',
                'Early access to new episodes',
                'Exclusive content',
                'Support creators directly',
            ],
        },
        {
            id: 'annual',
            name: 'Annual',
            price: 99.99,
            period: 'year',
            savings: '17%',
            featured: true,
            features: [
                'Ad-free listening',
                'Unlimited downloads',
                'Offline playback',
                'Early access to new episodes',
                'Exclusive content',
                'Support creators directly',
                'Annual savings',
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Go Premium</h1>
                    <p className="text-xl opacity-90">
                        Unlock unlimited listening, downloads, and exclusive content
                    </p>
                </div>
            </div>

            {/* Pricing Plans */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 ${plan.featured
                                    ? 'ring-2 ring-purple-600 md:scale-105'
                                    : 'bg-white'
                                }`}
                        >
                            {plan.featured && (
                                <div className="bg-purple-600 text-white py-2 text-center font-bold">
                                    BEST VALUE
                                </div>
                            )}
                            <div className="bg-white p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {plan.name}
                                </h2>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-purple-600">
                                        ${plan.price}
                                    </span>
                                    <span className="text-gray-600 ml-2">per {plan.period}</span>
                                </div>

                                {plan.savings && (
                                    <p className="text-green-600 font-semibold mb-6">
                                        Save {plan.savings} compared to monthly
                                    </p>
                                )}

                                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg mb-6 transition">
                                    Start Free Trial
                                </button>

                                <div className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="mt-16 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: 'Can I cancel anytime?',
                                a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.',
                            },
                            {
                                q: 'Is there a free trial?',
                                a: 'Yes! New users get a 7-day free trial to explore all premium features.',
                            },
                            {
                                q: 'Can I change plans?',
                                a: 'Absolutely. You can upgrade or downgrade your plan at any time.',
                            },
                            {
                                q: 'Do you offer family plans?',
                                a: 'Family plans are coming soon! Check back later for updates.',
                            },
                        ].map((faq, idx) => (
                            <details key={idx} className="bg-white rounded-lg shadow p-6">
                                <summary className="font-bold text-gray-900 cursor-pointer">
                                    {faq.q}
                                </summary>
                                <p className="text-gray-600 mt-4">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
