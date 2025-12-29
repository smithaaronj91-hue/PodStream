import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CreatorProfilePage() {
    const router = useRouter();
    const { name } = router.query;

    const [creator, setCreator] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('videos');

    useEffect(() => {
        if (name) {
            fetchCreatorData();
        }
    }, [name]);

    const fetchCreatorData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/feed/creator/${encodeURIComponent(name)}`);
            if (res.ok) {
                const data = await res.json();
                setCreator(data.creator);
                setVideos(data.videos || []);
            }
        } catch (error) {
            console.error('Error fetching creator:', error);
        }
        setLoading(false);
    };

    const formatCount = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        // TODO: API call to follow/unfollow
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
            </div>
        );
    }

    if (!creator) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
                <p className="text-xl mb-4">Creator not found</p>
                <Link href="/" className="text-pink-500 hover:text-pink-400">
                    ← Back to Feed
                </Link>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{creator.name} | PodStream</title>
                <meta name="description" content={`Watch videos from ${creator.name} on PodStream`} />
            </Head>

            <div className="min-h-screen bg-gray-900 text-white">
                {/* Header */}
                <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
                        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="font-bold text-lg">{creator.name}</h1>
                        {creator.isVerified && (
                            <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">✓</span>
                        )}
                    </div>
                </header>

                {/* Profile Section */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Cover Image */}
                    <div className="h-32 md:h-48 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl mb-4" />

                    {/* Profile Info */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-20 px-4">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-full border-4 border-gray-900 flex items-center justify-center text-4xl md:text-5xl">
                            {creator.avatar || '👤'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h2 className="text-2xl font-bold">{creator.name}</h2>
                                {creator.isVerified && (
                                    <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs">✓</span>
                                )}
                            </div>
                            <p className="text-gray-400">@{creator.username || creator.name.toLowerCase().replace(/\s+/g, '')}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleFollow}
                                className={`px-6 py-2 rounded-lg font-bold transition ${isFollowing
                                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                                        : 'bg-pink-500 text-white hover:bg-pink-600'
                                    }`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center md:justify-start gap-8 mt-6 px-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{formatCount(creator.followerCount)}</p>
                            <p className="text-gray-400 text-sm">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{formatCount(creator.followingCount || 0)}</p>
                            <p className="text-gray-400 text-sm">Following</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{formatCount(creator.totalLikes || 0)}</p>
                            <p className="text-gray-400 text-sm">Likes</p>
                        </div>
                    </div>

                    {/* Bio */}
                    {creator.bio && (
                        <p className="mt-4 px-4 text-center md:text-left text-gray-300">{creator.bio}</p>
                    )}

                    {/* Tabs */}
                    <div className="flex border-b border-gray-800 mt-6">
                        {['videos', 'liked', 'saved'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-center capitalize font-medium transition ${activeTab === tab
                                        ? 'text-white border-b-2 border-pink-500'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Video Grid */}
                    <div className="grid grid-cols-3 gap-1 mt-4">
                        {videos.map((video) => (
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
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    {formatCount(video.views)}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {videos.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No videos yet</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
