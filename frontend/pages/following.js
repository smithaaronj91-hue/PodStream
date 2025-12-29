import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function FollowingPage() {
    const [activeTab, setActiveTab] = useState('videos');
    const [followingVideos, setFollowingVideos] = useState([]);
    const [followingCreators, setFollowingCreators] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFollowingContent();
    }, []);

    const fetchFollowingContent = async () => {
        setLoading(true);
        // Simulated data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));

        setFollowingVideos([
            {
                id: 1,
                title: 'Building a React App from Scratch',
                thumbnail: 'https://picsum.photos/seed/v1/400/600',
                creator: { name: 'TechWithTim', avatar: 'https://i.pravatar.cc/100?u=tim', verified: true },
                views: '125K',
                timestamp: '2 hours ago',
                duration: '12:45'
            },
            {
                id: 2,
                title: 'Morning Routine for Productivity',
                thumbnail: 'https://picsum.photos/seed/v2/400/600',
                creator: { name: 'LifeHacker', avatar: 'https://i.pravatar.cc/100?u=life', verified: true },
                views: '89K',
                timestamp: '5 hours ago',
                duration: '8:30'
            },
            {
                id: 3,
                title: 'The Future of AI in 2025',
                thumbnail: 'https://picsum.photos/seed/v3/400/600',
                creator: { name: 'AIExplained', avatar: 'https://i.pravatar.cc/100?u=ai', verified: true },
                views: '234K',
                timestamp: '1 day ago',
                duration: '15:20'
            },
            {
                id: 4,
                title: 'Quick Healthy Meal Prep',
                thumbnail: 'https://picsum.photos/seed/v4/400/600',
                creator: { name: 'ChefMike', avatar: 'https://i.pravatar.cc/100?u=mike', verified: false },
                views: '45K',
                timestamp: '2 days ago',
                duration: '6:15'
            },
            {
                id: 5,
                title: 'JavaScript Tips You Need to Know',
                thumbnail: 'https://picsum.photos/seed/v5/400/600',
                creator: { name: 'CodeAcademy', avatar: 'https://i.pravatar.cc/100?u=code', verified: true },
                views: '178K',
                timestamp: '3 days ago',
                duration: '10:00'
            },
            {
                id: 6,
                title: 'Travel Vlog: Tokyo Adventures',
                thumbnail: 'https://picsum.photos/seed/v6/400/600',
                creator: { name: 'Wanderlust', avatar: 'https://i.pravatar.cc/100?u=travel', verified: false },
                views: '67K',
                timestamp: '4 days ago',
                duration: '18:45'
            },
        ]);

        setFollowingCreators([
            { id: 1, name: 'TechWithTim', avatar: 'https://i.pravatar.cc/100?u=tim', followers: '1.2M', verified: true, isLive: true },
            { id: 2, name: 'LifeHacker', avatar: 'https://i.pravatar.cc/100?u=life', followers: '890K', verified: true, isLive: false },
            { id: 3, name: 'AIExplained', avatar: 'https://i.pravatar.cc/100?u=ai', followers: '2.1M', verified: true, isLive: false },
            { id: 4, name: 'ChefMike', avatar: 'https://i.pravatar.cc/100?u=mike', followers: '456K', verified: false, isLive: true },
            { id: 5, name: 'CodeAcademy', avatar: 'https://i.pravatar.cc/100?u=code', followers: '3.4M', verified: true, isLive: false },
            { id: 6, name: 'Wanderlust', avatar: 'https://i.pravatar.cc/100?u=travel', followers: '678K', verified: false, isLive: false },
            { id: 7, name: 'FitnessGuru', avatar: 'https://i.pravatar.cc/100?u=fit', followers: '1.5M', verified: true, isLive: false },
            { id: 8, name: 'MusicMaster', avatar: 'https://i.pravatar.cc/100?u=music', followers: '2.3M', verified: true, isLive: true },
        ]);

        setLoading(false);
    };

    const VideoCard = ({ video }) => (
        <Link href={`/episode/${video.id}`} className="group">
            <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-800">
                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Duration badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs font-medium">
                    {video.duration}
                </div>

                {/* Video info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <img
                            src={video.creator.avatar}
                            alt={video.creator.name}
                            className="w-8 h-8 rounded-full border-2 border-white/20"
                        />
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{video.creator.name}</span>
                            {video.creator.verified && (
                                <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">✓</span>
                            )}
                        </div>
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2 mb-1">{video.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{video.views} views</span>
                        <span>•</span>
                        <span>{video.timestamp}</span>
                    </div>
                </div>
            </div>
        </Link>
    );

    const CreatorCard = ({ creator }) => (
        <Link href={`/creator/${creator.name}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/50 transition">
            <div className="relative">
                <img
                    src={creator.avatar}
                    alt={creator.name}
                    className={`w-14 h-14 rounded-full ${creator.isLive ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900' : ''}`}
                />
                {creator.isLive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-pink-500 rounded text-[10px] font-bold uppercase">
                        Live
                    </span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                    <span className="font-semibold truncate">{creator.name}</span>
                    {creator.verified && (
                        <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px] shrink-0">✓</span>
                    )}
                </div>
                <p className="text-sm text-gray-400">{creator.followers} followers</p>
            </div>
            <button className="px-4 py-1.5 border border-gray-600 rounded-full text-sm font-medium hover:bg-gray-700 transition">
                View
            </button>
        </Link>
    );

    return (
        <>
            <Head>
                <title>Following | PodStream</title>
            </Head>

            <div className="min-h-screen bg-gray-900 text-white">
                {/* Header */}
                <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
                    <div className="max-w-4xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between mb-4">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm">▶</span>
                                </div>
                                <span className="font-bold text-lg">Following</span>
                            </Link>
                            <Link href="/discover" className="p-2 hover:bg-gray-800 rounded-full transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </Link>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab('videos')}
                                className={`flex-1 py-2 rounded-lg font-medium transition ${activeTab === 'videos' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                New Videos
                            </button>
                            <button
                                onClick={() => setActiveTab('creators')}
                                className={`flex-1 py-2 rounded-lg font-medium transition ${activeTab === 'creators' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Creators ({followingCreators.length})
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-4xl mx-auto px-4 py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'videos' && (
                                <>
                                    {followingVideos.length === 0 ? (
                                        <div className="text-center py-20">
                                            <div className="text-6xl mb-4">📺</div>
                                            <h2 className="text-xl font-bold mb-2">No new videos</h2>
                                            <p className="text-gray-400 mb-6">Follow creators to see their latest videos here</p>
                                            <Link href="/discover" className="inline-flex px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-full font-bold transition">
                                                Discover Creators
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {followingVideos.map(video => (
                                                <VideoCard key={video.id} video={video} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'creators' && (
                                <>
                                    {followingCreators.length === 0 ? (
                                        <div className="text-center py-20">
                                            <div className="text-6xl mb-4">👥</div>
                                            <h2 className="text-xl font-bold mb-2">Not following anyone yet</h2>
                                            <p className="text-gray-400 mb-6">Find creators to follow and their content will show up here</p>
                                            <Link href="/discover" className="inline-flex px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-full font-bold transition">
                                                Discover Creators
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {/* Live Now Section */}
                                            {followingCreators.some(c => c.isLive) && (
                                                <div className="mb-6">
                                                    <h3 className="text-sm font-semibold text-pink-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                                                        Live Now
                                                    </h3>
                                                    <div className="space-y-1">
                                                        {followingCreators.filter(c => c.isLive).map(creator => (
                                                            <CreatorCard key={creator.id} creator={creator} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* All Creators */}
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                All Creators
                                            </h3>
                                            <div className="space-y-1">
                                                {followingCreators.filter(c => !c.isLive).map(creator => (
                                                    <CreatorCard key={creator.id} creator={creator} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </main>

                {/* Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-gray-800 safe-area-bottom">
                    <div className="flex justify-around py-2">
                        <Link href="/" className="flex flex-col items-center gap-0.5 px-3 text-gray-500">
                            <span className="text-lg">🏠</span>
                            <span className="text-[10px]">Home</span>
                        </Link>
                        <Link href="/discover" className="flex flex-col items-center gap-0.5 px-3 text-gray-500">
                            <span className="text-lg">🔍</span>
                            <span className="text-[10px]">Discover</span>
                        </Link>
                        <Link href="/upload" className="w-12 h-8 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">+</span>
                        </Link>
                        <Link href="/following" className="flex flex-col items-center gap-0.5 px-3 text-white">
                            <span className="text-lg">📥</span>
                            <span className="text-[10px]">Following</span>
                        </Link>
                        <Link href="/profile" className="flex flex-col items-center gap-0.5 px-3 text-gray-500">
                            <span className="text-lg">👤</span>
                            <span className="text-[10px]">Me</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}
