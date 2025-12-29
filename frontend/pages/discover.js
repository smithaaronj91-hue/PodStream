import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DiscoverPage() {
    const [trendingVideos, setTrendingVideos] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryVideos, setCategoryVideos] = useState([]);

    const trendingHashtags = [
        { tag: 'foryou', count: '2.5B' },
        { tag: 'viral', count: '1.8B' },
        { tag: 'tech', count: '890M' },
        { tag: 'science', count: '650M' },
        { tag: 'education', count: '520M' },
        { tag: 'tips', count: '410M' },
        { tag: 'howto', count: '380M' },
        { tag: 'trending', count: '290M' },
    ];

    const suggestedCreators = [
        { name: 'TechVerse', avatar: '🎬', followers: '2.5M', isVerified: true },
        { name: 'ScienceNow', avatar: '🔬', followers: '1.8M', isVerified: true },
        { name: 'LearnDaily', avatar: '📚', followers: '920K', isVerified: true },
        { name: 'LifeHacks', avatar: '✨', followers: '1.2M', isVerified: false },
        { name: 'FutureTech', avatar: '🚀', followers: '780K', isVerified: true },
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [trendingRes, categoriesRes] = await Promise.all([
                fetch(`${API_URL}/feed/trending?limit=12`),
                fetch(`${API_URL}/feed/categories`),
            ]);

            const trendingData = await trendingRes.json();
            const categoriesData = await categoriesRes.json();

            setTrendingVideos(trendingData.videos || []);
            setCategories(categoriesData.categories || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`${API_URL}/feed/search?q=${encodeURIComponent(query)}&limit=20`);
            const data = await res.json();
            setSearchResults(data.videos || []);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleCategoryClick = async (category) => {
        if (selectedCategory === category.id) {
            setSelectedCategory(null);
            setCategoryVideos([]);
            return;
        }

        setSelectedCategory(category.id);
        try {
            const res = await fetch(`${API_URL}/feed/category/${category.id}?limit=12`);
            const data = await res.json();
            setCategoryVideos(data.videos || []);
        } catch (error) {
            console.error('Category error:', error);
        }
    };

    const formatCount = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <>
            <Head>
                <title>Discover | PodStream</title>
                <meta name="description" content="Discover trending videos and creators on PodStream" />
            </Head>

            <div className="min-h-screen bg-gray-900 text-white pb-20 md:pb-0">
                {/* Header */}
                <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
                    <div className="max-w-6xl mx-auto px-4 py-3">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search videos, creators, hashtags..."
                                    className="w-full px-4 py-2 pl-10 bg-gray-800 rounded-full outline-none focus:ring-2 focus:ring-pink-500"
                                />
                                <svg
                                    className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchQuery && (
                                    <button
                                        onClick={() => handleSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-6xl mx-auto px-4 py-6">
                    {/* Search Results */}
                    {isSearching && (
                        <div className="mb-8">
                            <h2 className="text-lg font-bold mb-4">
                                {searchResults.length > 0
                                    ? `Results for "${searchQuery}"`
                                    : `No results for "${searchQuery}"`}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {searchResults.map((video) => (
                                    <VideoCard key={video.id} video={video} />
                                ))}
                            </div>
                        </div>
                    )}

                    {!isSearching && (
                        <>
                            {/* Categories */}
                            <section className="mb-8">
                                <h2 className="text-lg font-bold mb-4">Browse Categories</h2>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                    {categories.filter(c => c.id !== 'all').map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryClick(category)}
                                            className={`p-4 rounded-xl text-center transition ${selectedCategory === category.id
                                                    ? 'bg-pink-500'
                                                    : 'bg-gray-800 hover:bg-gray-700'
                                                }`}
                                        >
                                            <span className="text-2xl block mb-1">{category.icon}</span>
                                            <span className="text-xs">{category.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Category Videos */}
                                {selectedCategory && categoryVideos.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {categoryVideos.map((video) => (
                                            <VideoCard key={video.id} video={video} />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Trending Hashtags */}
                            <section className="mb-8">
                                <h2 className="text-lg font-bold mb-4">🔥 Trending Hashtags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {trendingHashtags.map(({ tag, count }) => (
                                        <button
                                            key={tag}
                                            onClick={() => handleSearch(`#${tag}`)}
                                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full transition flex items-center gap-2"
                                        >
                                            <span className="text-pink-500">#{tag}</span>
                                            <span className="text-gray-400 text-sm">{count}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Suggested Creators */}
                            <section className="mb-8">
                                <h2 className="text-lg font-bold mb-4">⭐ Suggested Creators</h2>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {suggestedCreators.map((creator) => (
                                        <Link
                                            key={creator.name}
                                            href={`/creator/${encodeURIComponent(creator.name)}`}
                                            className="p-4 bg-gray-800 rounded-xl text-center hover:bg-gray-700 transition"
                                        >
                                            <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center text-3xl mb-3">
                                                {creator.avatar}
                                            </div>
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="font-medium">{creator.name}</span>
                                                {creator.isVerified && (
                                                    <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">✓</span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-sm">{creator.followers} followers</p>
                                            <button className="mt-2 px-4 py-1 bg-pink-500 hover:bg-pink-600 rounded-full text-sm font-medium transition">
                                                Follow
                                            </button>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* Trending Videos */}
                            <section>
                                <h2 className="text-lg font-bold mb-4">📈 Trending Now</h2>
                                {loading ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <div key={i} className="aspect-[9/16] bg-gray-800 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {trendingVideos.map((video) => (
                                            <VideoCard key={video.id} video={video} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>

                {/* Bottom Navigation - Mobile */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2 safe-area-bottom">
                    <div className="flex justify-around">
                        <Link href="/" className="flex flex-col items-center gap-1 text-gray-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
                            <span className="text-xs">Home</span>
                        </Link>
                        <Link href="/discover" className="flex flex-col items-center gap-1 text-white">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                            <span className="text-xs">Discover</span>
                        </Link>
                        <Link href="/notifications" className="flex flex-col items-center gap-1 text-gray-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                            </svg>
                            <span className="text-xs">Inbox</span>
                        </Link>
                        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            <span className="text-xs">Profile</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}

// Video Card Component
function VideoCard({ video }) {
    const formatCount = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <Link
            href={`/?v=${video.id}`}
            className="aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden relative group"
        >
            <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-300">
                    <span>{video.creator}</span>
                    {video.isVerified && <span className="text-blue-400">✓</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>▶ {formatCount(video.views)}</span>
                    <span>❤️ {formatCount(video.likes)}</span>
                </div>
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </div>
        </Link>
    );
}
