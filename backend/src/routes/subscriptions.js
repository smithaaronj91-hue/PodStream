import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Get premium subscription plans
router.get('/plans', async (req, res) => {
    try {
        const plans = [
            {
                id: 'monthly',
                name: 'Premium Monthly',
                price: 9.99,
                currency: 'USD',
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
                name: 'Premium Annual',
                price: 99.99,
                currency: 'USD',
                period: 'year',
                savings: '17%',
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

        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
});

// Create subscription (simplified - would integrate with Stripe)
router.post('/create-subscription', async (req, res) => {
    try {
        const { userId, plan } = req.body;

        if (!userId || !plan) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // In a real app, this would integrate with Stripe
        const endDate = new Date();
        if (plan === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const result = await pool.query(
            `INSERT INTO premium_subscriptions (user_id, plan, amount_cents, status, ends_at)
       VALUES ($1, $2, $3, 'active', $4)
       RETURNING *`,
            [userId, plan, plan === 'monthly' ? 999 : 9999, endDate]
        );

        // Update user subscription tier
        await pool.query(
            'UPDATE users SET subscription_tier = $1 WHERE id = $2',
            ['premium', userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

export default router;
