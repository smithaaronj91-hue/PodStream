import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function CreatorProfilePage() {
    const router = useRouter();
    const { username } = router.query;

    const [creator, setCreator] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('videos');
    const [isFollowing, setIsFollowing] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    useEffect(() => {
        if (username) {
            fetchCreatorProfile();
        }
    }, [username]);

    const fetchCreatorProfile = async () => {
        setLoading(true);
        try {
            // Fetch creator's videos
            const res = await fetch(`${API_URL}/feed/creator/${username}`);
            const data = await res.json();

            if (data.videos && data.videos.length > 0) {
                const firstVideo = data.videos[0];
                setCreator({
                    username: firstVideo.creator,
                    avatar: firstVideo.creatorAvatar,
                    isVerified: firstVideo.isVerified,
                    followerCount: firstVideo.followerCount,
                    followingCount: Math.floor(Math.random() * 500) + 50,
                    likesCount: data.videos.reduce((sum, v) => sum + v.likes, 0),
                    bio: `🎬 Content Creator | ${firstVideo.category} enthusiast\n✨ Creating amazing videos daily\n📧 collab@${firstVideo.creator.toLowerCase().replace(/\s/g, '')}.com`,
                    joinedDate: '2024',
                    website: `https://${firstVideo.creator.toLowerCase().replace(/\s/g, '')}.com`,
                });
                setVideos(data.videos);
            }
        } catch (error) {
            console.error('Error fetching creator:', error);
        }
        setLoading(false);
    };

    const formatCount = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num?.toString() || '0';
    };

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        if (creator) {
            setCreator(prev => ({
                ...prev,
                followerCount: isFollowing ? prev.followerCount - 1 : prev.followerCount + 1
            }));
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${creator?.username} on PodStream`,
                    text: `Check out ${creator?.username}'s videos on PodStream!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            setShowShareMenu(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white">
                <div className="animate-pulse">
                    <div className="h-32 bg-gradient-to-r from-pink-500/20 to-purple-600/20" />
                    <div className="max-w-4xl mx-auto px-4 -mt-16">
                        <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-900" />
                        <div className="mt-4 space-y-3">
                            <div className="h-6 w-48 bg-gray-700 rounded" />
                            <div className="h-4 w-32 bg-gray-700 rounded" />
                        </div>
                    </div>
                </div>
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
                <title>{creator.username} | PodStream</title>
                <meta name="description" content={creator.bio} />
            </Head>

            <div className="min-h-screen bg-gray-900 text-white">
                {/* Header Banner */}
                <div className="h-32 md:h-48 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 relative">
                    <div className="absolute inset-0 bg-black/20" />
                    <Link
                        href="/"
                        className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur rounded-full hover:bg-black/50 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <button
                        onClick={handleShare}
                        className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur rounded-full hover:bg-black/50 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>
                </div>

                {/* Profile Info */}
                <div className="max-w-4xl mx-auto px-4">
                    <div className="relative -mt-16 md:-mt-20 mb-4">
                        {/* Avatar */}
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-1">
                            <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-5xl md:text-6xl border-4 border-gray-900">
                                {creator.avatar}
                            </div>
                        </div>
                    </div>

                    {/* Name & Verification */}
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold">{creator.username}</h1>
                        {creator.isVerified && (
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Handle */}
                    <p className="text-gray-400 mb-4">@{creator.username.toLowerCase().replace(/\s/g, '')}</p>

                    {/* Stats */}
                    <div className="flex gap-6 mb-4">
                        <div className="text-center">
                            <p className="text-xl font-bold">{formatCount(creator.followingCount)}</p>
                            <p className="text-sm text-gray-400">Following</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">{formatCount(creator.followerCount)}</p>
                            <p className="text-sm text-gray-400">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">{formatCount(creator.likesCount)}</p>
                            <p className="text-sm text-gray-400">Likes</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={handleFollow}
                            className={`flex-1 py-3 rounded-lg font-semibold transition ${isFollowing
                                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                                    : 'bg-pink-500 text-white hover:bg-pink-600'
                                }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button className="px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition">
                            Message
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </button>
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <p className="whitespace-pre-line">{creator.bio}</p>
                        {creator.website && (
                            <a
                                href={creator.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline mt-2 inline-block"
                            >
                                🔗 {creator.website}
                            </a>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-700 mb-4">
                        <div className="flex">
                            {[
                                { id: 'videos', icon: '🎬', label: 'Videos' },
                                { id: 'liked', icon: '❤️', label: 'Liked' },
                                { id: 'saved', icon: '🔖', label: 'Saved' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 text-center border-b-2 transition ${activeTab === tab.id
                                            ? 'border-pink-500 text-white'
                                            : 'border-transparent text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Video Grid */}
                    <div className="grid grid-cols-3 gap-1 md:gap-2 pb-8">
                        {videos.map((video, index) => (
                            <Link
                                key={video.id}
                                href={`/?video=${video.id}`}
                                className="aspect-[9/16] relative group overflow-hidden rounded-lg"
                            >
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                    <p className="text-xs text-white line-clamp-2">{video.title}</p>
                                </div>
                                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    {formatCount(video.views)}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {videos.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-4xl mb-4">🎬</p>
                            <p>No videos yet</p>
                        </div>
                    )}
                </div>

                {/* Share Menu Modal */}
                {showShareMenu && (
                    <div
                        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
                        onClick={() => setShowShareMenu(false)}
                    >
                        <div
                            className="bg-gray-800 rounded-t-3xl w-full max-w-lg p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-4">Share Profile</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { icon: '📋', label: 'Copy Link', action: () => navigator.clipboard.writeText(window.location.href) },
                                    { icon: '💬', label: 'Message', action: () => { } },
                                    { icon: '📧', label: 'Email', action: () => window.open(`mailto:?subject=Check out ${creator.username}&body=${window.location.href}`) },
                                    { icon: '🐦', label: 'Twitter', action: () => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`) },
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { item.action(); setShowShareMenu(false); }}
                                        className="flex flex-col items-center gap-2 p-3 hover:bg-gray-700 rounded-lg transition"
                                    >
                                        <span className="text-2xl">{item.icon}</span>
                                        <span className="text-xs">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowShareMenu(false)}
                                className="w-full mt-4 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
