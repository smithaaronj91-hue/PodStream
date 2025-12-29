import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const categories = [
    { id: 1, name: 'Technology', icon: '💻', color: 'from-blue-500 to-cyan-500' },
    { id: 2, name: 'True Crime', icon: '🔍', color: 'from-red-500 to-pink-500' },
    { id: 3, name: 'Comedy', icon: '😂', color: 'from-yellow-500 to-orange-500' },
    { id: 4, name: 'Business', icon: '📈', color: 'from-green-500 to-emerald-500' },
    { id: 5, name: 'Science', icon: '🔬', color: 'from-purple-500 to-indigo-500' },
    { id: 6, name: 'News', icon: '📰', color: 'from-gray-500 to-slate-500' },
    { id: 7, name: 'Health', icon: '🏃', color: 'from-pink-500 to-rose-500' },
    { id: 8, name: 'Society', icon: '🌍', color: 'from-teal-500 to-cyan-500' },
];

const trendingPodcasts = [
    {
        id: 1,
        title: 'Tech Talk Daily',
        author: 'Sarah Johnson',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop',
        category: 'Technology',
        subscribers: '1.2M',
    },
    {
        id: 2,
        title: 'Crime Stories',
        author: 'Mike Williams',
        image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=200&h=200&fit=crop',
        category: 'True Crime',
        subscribers: '890K',
    },
    {
        id: 3,
        title: 'The Comedy Hour',
        author: 'Jimmy Chen',
        image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=200&h=200&fit=crop',
        category: 'Comedy',
        subscribers: '2.1M',
    },
    {
        id: 4,
        title: 'Startup Success',
        author: 'Alex Rivera',
        image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=200&h=200&fit=crop',
        category: 'Business',
        subscribers: '560K',
    },
    {
        id: 5,
        title: 'Science Explained',
        author: 'Dr. Emily Park',
        image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200&h=200&fit=crop',
        category: 'Science',
        subscribers: '1.5M',
    },
    {
        id: 6,
        title: 'Morning Motivation',
        author: 'David Brooks',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
        category: 'Self-Help',
        subscribers: '780K',
    },
];

const recentClips = [
    {
        id: 1,
        title: 'Why AI Will Change Everything',
        podcast: 'Tech Talk Daily',
        duration: '0:45',
        plays: '12K',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop',
    },
    {
        id: 2,
        title: 'The Missing Evidence',
        podcast: 'Crime Stories',
        duration: '1:02',
        plays: '8.5K',
        image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=100&h=100&fit=crop',
    },
    {
        id: 3,
        title: 'My Worst First Date',
        podcast: 'The Comedy Hour',
        duration: '0:58',
        plays: '23K',
        image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=100&h=100&fit=crop',
    },
];

export default function Browse() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm px-4 pt-4 pb-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <Link href="/" className="text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-lg font-bold">Discover</h1>
                    <Link href="/stats" className="text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search podcasts, episodes, clips..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/10 rounded-full px-5 py-3 pl-12 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mt-4 overflow-x-auto scrollbar-hide">
                    {['all', 'podcasts', 'clips', 'creators'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab
                                    ? 'bg-white text-black'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-6 space-y-8">
                {/* Categories */}
                <section>
                    <h2 className="text-lg font-bold mb-4">Browse Categories</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className={`bg-gradient-to-br ${category.color} rounded-xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform`}
                            >
                                <span className="text-2xl">{category.icon}</span>
                                <span className="font-semibold">{category.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Trending Podcasts */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Trending Podcasts</h2>
                        <button className="text-pink-500 text-sm font-medium">See all</button>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                        <div className="flex gap-4 pb-2">
                            {trendingPodcasts.map((podcast) => (
                                <Link
                                    key={podcast.id}
                                    href={`/podcast/${podcast.id}`}
                                    className="flex-shrink-0 w-32"
                                >
                                    <div className="relative mb-2">
                                        <img
                                            src={podcast.image}
                                            alt={podcast.title}
                                            className="w-32 h-32 rounded-xl object-cover"
                                        />
                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 text-xs">
                                            {podcast.subscribers}
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-sm truncate">{podcast.title}</h3>
                                    <p className="text-white/50 text-xs truncate">{podcast.author}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Recent Clips */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Hot Clips 🔥</h2>
                        <Link href="/" className="text-pink-500 text-sm font-medium">Watch all</Link>
                    </div>
                    <div className="space-y-3">
                        {recentClips.map((clip, index) => (
                            <Link
                                key={clip.id}
                                href="/"
                                className="flex items-center gap-4 bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-colors"
                            >
                                <span className="text-white/50 font-bold w-4">{index + 1}</span>
                                <div className="relative">
                                    <img
                                        src={clip.image}
                                        alt={clip.title}
                                        className="w-14 h-14 rounded-lg object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate">{clip.title}</h3>
                                    <p className="text-white/50 text-xs">{clip.podcast}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/70 text-xs">{clip.duration}</p>
                                    <p className="text-white/50 text-xs">{clip.plays} plays</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* For You */}
                <section>
                    <h2 className="text-lg font-bold mb-4">Made For You</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl p-4 border border-pink-500/30">
                            <div className="text-3xl mb-2">🎧</div>
                            <h3 className="font-bold mb-1">Your Mix</h3>
                            <p className="text-white/50 text-xs">Based on your listening</p>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
                            <div className="text-3xl mb-2">✨</div>
                            <h3 className="font-bold mb-1">New Releases</h3>
                            <p className="text-white/50 text-xs">Fresh episodes today</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-white/10">
                <div className="flex items-center justify-around py-2 pb-4">
                    <Link href="/" className="flex flex-col items-center text-white/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-[10px] mt-0.5">Home</span>
                    </Link>
                    <Link href="/browse" className="flex flex-col items-center text-white">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                        <span className="text-[10px] mt-0.5">Discover</span>
                    </Link>
                    <Link href="/remix/new" className="flex flex-col items-center -mt-4">
                        <div className="w-14 h-9 bg-gradient-to-r from-cyan-400 via-pink-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                            <div className="w-12 h-7 bg-white rounded-md flex items-center justify-center">
                                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                    <Link href="/subscriptions" className="flex flex-col items-center text-white/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span className="text-[10px] mt-0.5">Inbox</span>
                    </Link>
                    <Link href="/stats" className="flex flex-col items-center text-white/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[10px] mt-0.5">Profile</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
