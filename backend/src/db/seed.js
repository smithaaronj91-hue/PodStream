import pool from './connection.js';

const seedDatabase = async () => {
    const client = await pool.connect();
    try {
        // Seed categories
        const categories = [
            { name: 'Technology', slug: 'technology', color: '#3498db' },
            { name: 'Business', slug: 'business', color: '#e74c3c' },
            { name: 'Comedy', slug: 'comedy', color: '#f39c12' },
            { name: 'Sports', slug: 'sports', color: '#27ae60' },
            { name: 'News', slug: 'news', color: '#9b59b6' },
            { name: 'Education', slug: 'education', color: '#1abc9c' },
            { name: 'Music', slug: 'music', color: '#e91e63' },
            { name: 'Self-Help', slug: 'self-help', color: '#795548' },
            { name: 'Fiction', slug: 'fiction', color: '#607d8b' },
            { name: 'History', slug: 'history', color: '#d32f2f' },
        ];

        for (const cat of categories) {
            await client.query(
                'INSERT INTO categories (name, slug, color_hex) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                [cat.name, cat.slug, cat.color]
            );
        }

        console.log('✅ Categories seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        client.release();
    }
};

seedDatabase();
