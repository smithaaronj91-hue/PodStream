import express from 'express';
import pool from '../db/connection.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, slug, color_hex, description FROM categories ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(
            'SELECT id, name, slug, color_hex, description FROM categories WHERE slug = $1',
            [slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// Get podcasts by category
router.get('/:slug/podcasts', async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, limit = 20, sort = 'latest' } = req.query;

        const offset = (page - 1) * limit;

        // Determine sort order
        let orderBy = 'p.created_at DESC';
        if (sort === 'popular') {
            orderBy = 'p.total_listens DESC';
        } else if (sort === 'trending') {
            orderBy = 'p.average_rating DESC, p.total_listens DESC';
        }

        // Get total count
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM podcasts p 
       JOIN categories c ON p.category_id = c.id 
       WHERE c.slug = $1`,
            [slug]
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated results
        const result = await pool.query(
            `SELECT 
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
        u.profile_picture_url as creator_picture
       FROM podcasts p
       JOIN categories c ON p.category_id = c.id
       JOIN users u ON p.creator_id = u.id
       WHERE c.slug = $1
       ORDER BY ${orderBy}
       LIMIT $2 OFFSET $3`,
            [slug, limit, offset]
        );

        res.json({
            data: result.rows,
            pagination: {
                total: totalCount,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching category podcasts:', error);
        res.status(500).json({ error: 'Failed to fetch podcasts' });
    }
});

export default router;
