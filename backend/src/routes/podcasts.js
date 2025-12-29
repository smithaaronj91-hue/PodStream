import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Get all podcasts with filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, category, sort = 'latest', search } = req.query;
        const offset = (page - 1) * limit;

        let query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.cover_image_url,
        p.category_id,
        p.is_premium,
        p.total_episodes,
        p.total_listens,
        p.average_rating,
        p.created_at,
        u.username as creator_name,
        u.profile_picture_url as creator_picture,
        c.name as category_name
       FROM podcasts p
       JOIN categories c ON p.category_id = c.id
       JOIN users u ON p.creator_id = u.id
       WHERE 1=1
    `;

        const params = [];

        if (category) {
            query += ' AND c.slug = $' + (params.length + 1);
            params.push(category);
        }

        if (search) {
            query += ' AND (p.title ILIKE $' + (params.length + 1) + ' OR p.description ILIKE $' + (params.length + 2) + ')';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Determine sort order
        let orderBy = 'p.created_at DESC';
        if (sort === 'popular') {
            orderBy = 'p.total_listens DESC';
        } else if (sort === 'trending') {
            orderBy = 'p.average_rating DESC, p.total_listens DESC';
        } else if (sort === 'new') {
            orderBy = 'p.created_at DESC';
        }

        query += ` ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching podcasts:', error);
        res.status(500).json({ error: 'Failed to fetch podcasts' });
    }
});

// Get podcast details by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
        p.id,
        p.title,
        p.description,
        p.cover_image_url,
        p.is_premium,
        p.total_episodes,
        p.total_listens,
        p.average_rating,
        p.created_at,
        u.id as creator_id,
        u.username as creator_name,
        u.profile_picture_url as creator_picture,
        u.bio as creator_bio,
        c.name as category_name
       FROM podcasts p
       JOIN categories c ON p.category_id = c.id
       JOIN users u ON p.creator_id = u.id
       WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Podcast not found' });
        }

        const podcast = result.rows[0];

        // Get episodes
        const episodesResult = await pool.query(
            `SELECT 
        id,
        title,
        description,
        audio_url,
        duration_seconds,
        episode_number,
        season_number,
        is_premium,
        view_count,
        created_at
       FROM episodes
       WHERE podcast_id = $1
       ORDER BY season_number DESC, episode_number DESC`,
            [id]
        );

        podcast.episodes = episodesResult.rows;
        res.json(podcast);
    } catch (error) {
        console.error('Error fetching podcast:', error);
        res.status(500).json({ error: 'Failed to fetch podcast' });
    }
});

// Get episode details
router.get('/:podcastId/episodes/:episodeId', async (req, res) => {
    try {
        const { podcastId, episodeId } = req.params;

        const result = await pool.query(
            `SELECT 
        e.id,
        e.podcast_id,
        e.title,
        e.description,
        e.audio_url,
        e.duration_seconds,
        e.episode_number,
        e.season_number,
        e.is_premium,
        e.view_count,
        e.created_at,
        p.title as podcast_title,
        p.cover_image_url as podcast_cover
       FROM episodes e
       JOIN podcasts p ON e.podcast_id = p.id
       WHERE e.id = $1 AND e.podcast_id = $2`,
            [episodeId, podcastId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Episode not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching episode:', error);
        res.status(500).json({ error: 'Failed to fetch episode' });
    }
});

export default router;
