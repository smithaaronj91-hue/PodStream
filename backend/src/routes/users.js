import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, bio, profile_picture_url, is_creator, subscription_tier, created_at FROM users WHERE id = $1',
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get user's subscriptions
router.get('/subscriptions', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.id, p.title, p.cover_image_url, p.description, u.username as creator_name
       FROM subscriptions s
       JOIN podcasts p ON s.podcast_id = p.id
       JOIN users u ON p.creator_id = u.id
       WHERE s.user_id = $1
       ORDER BY s.subscribed_at DESC`,
            [req.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

// Subscribe to podcast
router.post('/subscribe/:podcastId', verifyToken, async (req, res) => {
    try {
        const { podcastId } = req.params;

        // Check if podcast exists
        const podcastCheck = await pool.query(
            'SELECT id FROM podcasts WHERE id = $1',
            [podcastId]
        );

        if (podcastCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Podcast not found' });
        }

        const result = await pool.query(
            'INSERT INTO subscriptions (user_id, podcast_id) VALUES ($1, $2) RETURNING *',
            [req.userId, podcastId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Already subscribed to this podcast' });
        }
        console.error('Error subscribing:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// Unsubscribe from podcast
router.delete('/subscribe/:podcastId', verifyToken, async (req, res) => {
    try {
        const { podcastId } = req.params;

        await pool.query(
            'DELETE FROM subscriptions WHERE user_id = $1 AND podcast_id = $2',
            [req.userId, podcastId]
        );

        res.json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

// Add to favorites
router.post('/favorites/:episodeId', verifyToken, async (req, res) => {
    try {
        const { episodeId } = req.params;

        const result = await pool.query(
            'INSERT INTO favorites (user_id, episode_id) VALUES ($1, $2) RETURNING *',
            [req.userId, episodeId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Already favorited' });
        }
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

// Get user's favorites
router.get('/favorites', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.id, e.title, e.description, e.audio_url, e.duration_seconds, 
              e.episode_number, e.season_number, p.title as podcast_title, 
              p.cover_image_url, f.favorited_at
       FROM favorites f
       JOIN episodes e ON f.episode_id = e.id
       JOIN podcasts p ON e.podcast_id = p.id
       WHERE f.user_id = $1
       ORDER BY f.favorited_at DESC`,
            [req.userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

export default router;
