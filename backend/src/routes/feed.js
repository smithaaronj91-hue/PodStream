import express from 'express';
import videoFeed from '../services/videoFeed.js';

const router = express.Router();

// Health check
router.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Video Feed API',
        type: 'video-only',
    });
});

// Get video feed (infinite scroll) - main endpoint
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await videoFeed.getVideoFeed(page, limit);
        res.json(result);
    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ error: 'Failed to fetch video feed' });
    }
});

// Get trending videos
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const videos = await videoFeed.getTrendingVideos(limit);
        res.json({ videos, total: videos.length });
    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({ error: 'Failed to fetch trending videos' });
    }
});

// Search videos
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const limit = parseInt(req.query.limit) || 20;

        if (!query.trim()) {
            return res.json({ videos: [], query: '' });
        }

        const videos = await videoFeed.searchVideos(query, limit);
        res.json({ videos, query, total: videos.length });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search videos' });
    }
});

// Get videos by category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 20;

        const videos = await videoFeed.getVideosByCategory(category, limit);
        res.json({ videos, category, total: videos.length });
    } catch (error) {
        console.error('Category error:', error);
        res.status(500).json({ error: 'Failed to fetch category videos' });
    }
});

// Get single video
router.get('/video/:id', async (req, res) => {
    try {
        const video = await videoFeed.getVideoById(req.params.id);

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json(video);
    } catch (error) {
        console.error('Video error:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

// Get related videos
router.get('/video/:id/related', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const videos = await videoFeed.getRelatedVideos(req.params.id, limit);
        res.json({ videos, total: videos.length });
    } catch (error) {
        console.error('Related error:', error);
        res.status(500).json({ error: 'Failed to fetch related videos' });
    }
});

// Get creator's videos
router.get('/creator/:name', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const videos = await videoFeed.getCreatorVideos(req.params.name, limit);

        // Build creator profile from their videos
        const firstVideo = videos[0];
        const creator = firstVideo ? {
            name: firstVideo.creator,
            avatar: firstVideo.creatorAvatar,
            isVerified: firstVideo.isVerified,
            followerCount: firstVideo.followerCount,
            followingCount: Math.floor(Math.random() * 500) + 50,
            totalLikes: videos.reduce((sum, v) => sum + (v.likes || 0), 0),
            bio: `Creating amazing ${firstVideo?.category || 'video'} content 🎬 Follow for more!`,
            username: req.params.name.toLowerCase().replace(/\s+/g, ''),
        } : null;

        res.json({ videos, creator, total: videos.length });
    } catch (error) {
        console.error('Creator error:', error);
        res.status(500).json({ error: 'Failed to fetch creator videos' });
    }
});

// Get available categories
router.get('/categories', (req, res) => {
    const categories = [
        { id: 'all', name: 'For You', icon: '✨' },
        { id: 'tech', name: 'Tech', icon: '💻' },
        { id: 'science', name: 'Science', icon: '🔬' },
        { id: 'education', name: 'Education', icon: '📚' },
        { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
        { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' },
        { id: 'health', name: 'Health', icon: '💪' },
        { id: 'business', name: 'Business', icon: '💼' },
    ];
    res.json({ categories });
});

// Interaction endpoints (likes, comments, shares)
router.post('/video/:id/like', (req, res) => {
    res.json({ success: true, message: 'Video liked' });
});

router.post('/video/:id/unlike', (req, res) => {
    res.json({ success: true, message: 'Video unliked' });
});

router.post('/video/:id/share', (req, res) => {
    res.json({ success: true, message: 'Share recorded' });
});

router.post('/video/:id/view', (req, res) => {
    res.json({ success: true, message: 'View recorded' });
});

export default router;
