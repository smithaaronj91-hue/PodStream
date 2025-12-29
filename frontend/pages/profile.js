import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('videos');
    const [isEditing, setIsEditing] = useState(false);

    // Mock user data
    const [user, setUser] = useState({
        name: 'Your Name',
        username: 'yourname',
        avatar: '👤',
        bio: 'Welcome to my PodStream profile! 🎬',
        followers: 1234,
        following: 567,
        likes: 45600,
        isVerified: false,
        videos: [],
        likedVideos: [],
        savedVideos: [],
    });

    // Generate mock videos
    useEffect(() => {
        const mockVideos = Array.from({ length: 6 }, (_, i) => ({
            id: `my-video-${i + 1}`,
            title: `My Video ${i + 1}`,
            views: Math.floor(Math.random() * 100000),
            likes: Math.floor(Math.random() * 5000),
            thumbnailUrl: `https://storage.googleapis.com/gtv-videos-bucket/sample/images/${['BigBuckBunny', 'ElephantsDream', 'Sintel', 'TearsOfSteel', 'SubaruOutbackOnStreetAndDirt', 'VolkswagenGTIReview'][i]
                }.jpg`,
        }));
        setUser((prev) => ({ ...prev, videos: mockVideos }));
    }, []);

    const formatCount = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const tabs = [
        { id: 'videos', icon: '📹', label: 'Videos' },
        { id: 'liked', icon: '❤️', label: 'Liked' },
        { id: 'saved', icon: '🔖', label: 'Saved' },
    ];

    return (
        <>
            <Head>
                <title>Profile | PodStream</title>
            </Head>

            <div className="min-h-screen bg-gray-900 text-white pb-20 md:pb-0">
                {/* Header */}
                <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
                    <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                        <Link href="/" className="text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="font-bold text-lg">{user.username}</h1>
                        <button className="text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </header>

                <div className="max-w-2xl mx-auto px-4 py-6">
                    {/* Profile Info */}
                    <div className="flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center text-5xl mb-4 relative">
                            {user.avatar}
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-sm hover:bg-pink-600">
                                ✏️
                            </button>
                        </div>

                        {/* Name */}
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold">{user.name}</h2>
                            {user.isVerified && (
                                <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">✓</span>
                            )}
                        </div>
                        <p className="text-gray-400 mb-4">@{user.username}</p>

                        {/* Stats */}
                        <div className="flex gap-8 mb-4">
                            <div className="text-center">
                                <p className="font-bold">{formatCount(user.following)}</p>
                                <p className="text-gray-400 text-sm">Following</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">{formatCount(user.followers)}</p>
                                <p className="text-gray-400 text-sm">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">{formatCount(user.likes)}</p>
                                <p className="text-gray-400 text-sm">Likes</p>
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="text-gray-300 mb-4 max-w-xs">{user.bio}</p>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition"
                            >
                                Edit Profile
                            </button>
                            <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition">
                                Share Profile
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-800 mt-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-3 text-center font-medium transition flex items-center justify-center gap-2 ${activeTab === tab.id
                                        ? 'text-white border-b-2 border-pink-500'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="mt-4">
                        {activeTab === 'videos' && user.videos.length > 0 && (
                            <div className="grid grid-cols-3 gap-1">
                                {user.videos.map((video) => (
                                    <Link
                                        key={video.id}
                                        href={`/?v=${video.id}`}
                                        className="aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden relative group"
                                    >
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
                                            <span>▶</span>
                                            <span>{formatCount(video.views)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {activeTab === 'videos' && user.videos.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-4xl mb-4">📹</p>
                                <p className="text-gray-500 mb-4">No videos yet</p>
                                <Link
                                    href="/upload"
                                    className="inline-block px-6 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg font-medium transition"
                                >
                                    Upload your first video
                                </Link>
                            </div>
                        )}

                        {activeTab === 'liked' && (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-4xl mb-4">❤️</p>
                                <p>Videos you liked will appear here</p>
                            </div>
                        )}

                        {activeTab === 'saved' && (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-4xl mb-4">🔖</p>
                                <p>Saved videos will appear here</p>
                            </div>
                        )}
                    </div>
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
                        <Link href="/discover" className="flex flex-col items-center gap-1 text-gray-400">
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
                        <Link href="/profile" className="flex flex-col items-center gap-1 text-white">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            <span className="text-xs">Profile</span>
                        </Link>
                    </div>
                </nav>

                {/* Edit Profile Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-2xl w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold">Edit Profile</h3>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={user.name}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={user.username}
                                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Bio</label>
                                    <textarea
                                        value={user.bio}
                                        onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
