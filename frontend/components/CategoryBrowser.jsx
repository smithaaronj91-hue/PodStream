import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';

export default function CategoryBrowser() {
    const { categories, fetchPodcastsByCategory } = useStore();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [sortBy, setSortBy] = useState('latest');

    const handleCategorySelect = (categorySlug) => {
        setSelectedCategory(categorySlug);
        fetchPodcastsByCategory(categorySlug, { sort: sortBy });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Category Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Browse by Category
                    </h1>

                    {/* Category Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategorySelect(category.slug)}
                                className={`p-4 rounded-lg text-center transition transform hover:scale-105 ${selectedCategory === category.slug
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}
                                style={{
                                    backgroundColor:
                                        selectedCategory === category.slug
                                            ? category.color_hex
                                            : 'rgb(243, 244, 246)',
                                }}
                            >
                                <div className="text-2xl mb-2">
                                    {getEmojiForCategory(category.name)}
                                </div>
                                <div className="font-semibold text-sm">{category.name}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {selectedCategory && (
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Sort Options */}
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Podcasts</h2>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value);
                                fetchPodcastsByCategory(selectedCategory, { sort: e.target.value });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="latest">Latest</option>
                            <option value="popular">Most Popular</option>
                            <option value="trending">Trending</option>
                        </select>
                    </div>

                    {/* Podcasts Grid - Will be populated by parent */}
                    <div id="podcasts-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* Podcasts will be rendered here */}
                    </div>
                </div>
            )}
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
