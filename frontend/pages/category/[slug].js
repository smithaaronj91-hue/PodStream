import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from '@/lib/store';
import PodcastCard from '@/components/PodcastCard';

export default function CategoryPage() {
    const router = useRouter();
    const { slug } = router.query;
    const { podcasts, fetchPodcastsByCategory, categories } = useStore();
    const [sortBy, setSortBy] = useState('latest');
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);

    useEffect(() => {
        if (slug) {
            const cat = categories.find((c) => c.slug === slug);
            setCategory(cat);
            loadPodcasts();
        }
    }, [slug]);

    const loadPodcasts = async () => {
        setLoading(true);
        await fetchPodcastsByCategory(slug, { sort: sortBy });
        setLoading(false);
    };

    const handleSortChange = async (newSort) => {
        setSortBy(newSort);
        setLoading(true);
        await fetchPodcastsByCategory(slug, { sort: newSort });
        setLoading(false);
    };

    if (!slug) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div
                className="text-white py-12"
                style={{
                    backgroundColor: category?.color_hex || '#3b82f6',
                }}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-4xl mb-2">{getEmojiForCategory(category?.name)}</div>
                    <h1 className="text-4xl font-bold">{category?.name}</h1>
                    {category?.description && (
                        <p className="mt-4 text-lg opacity-90">{category.description}</p>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Podcasts in {category?.name}
                    </h2>
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="latest">Latest</option>
                        <option value="popular">Most Popular</option>
                        <option value="trending">Trending</option>
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div>
                        {podcasts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {podcasts.map((podcast) => (
                                    <PodcastCard key={podcast.id} podcast={podcast} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">
                                    No podcasts found in this category yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function getEmojiForCategory(categoryName) {
    const emojiMap = {
        Technology: '💻',
        Business: '💼',
        Comedy: '😂',
        Sports: '⚽',
        News: '📰',
        Education: '🎓',
        Music: '🎵',
        'Self-Help': '🧘',
        Fiction: '📚',
        History: '📖',
    };
    return emojiMap[categoryName] || '🎙️';
}
