import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function HomePage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [likedVideos, setLikedVideos] = useState(new Set());
    const [followedCreators, setFollowedCreators] = useState(new Set());
    const [showComments, setShowComments] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [categories, setCategories] = useState([]);

    const containerRef = useRef(null);
    const videoRefs = useRef([]);

    // Fetch categories
    useEffect(() => {
        fetch(`${API_URL}/feed/categories`)
            .then(res => res.json())
            .then(data => setCategories(data.categories || []))
            .catch(console.error);
    }, []);

    // Fetch video feed
    const fetchVideos = useCallback(async (pageNum = 1, reset = false) => {
        try {
            setLoading(true);
            const endpoint = activeCategory === 'all'
                ? `${API_URL}/feed/feed?page=${pageNum}&limit=10`
                : `${API_URL}/feed/category/${activeCategory}?limit=20`;

            const res = await fetch(endpoint);
            const data = await res.json();

            const newVideos = data.videos || [];

            if (reset) {
                setVideos(newVideos);
            } else {
                setVideos(prev => [...prev, ...newVideos]);
            }

            setHasMore(data.hasMore !== false && newVideos.length > 0);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch videos:', err);
            setError('Failed to load videos');
        } finally {
            setLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        setPage(1);
        setCurrentIndex(0);
        fetchVideos(1, true);
    }, [activeCategory]);

    // Intersection observer for auto-play
    useEffect(() => {
        const options = {
            root: containerRef.current,
            rootMargin: '0px',
            threshold: 0.7,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.dataset.index);
                    setCurrentIndex(index);

                    // Load more when near the end
                    if (index >= videos.length - 3 && hasMore && !loading) {
                        setPage(prev => prev + 1);
                        fetchVideos(page + 1);
                    }
                }
            });
        }, options);

        videoRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [videos, hasMore, loading, page, fetchVideos]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown' && currentIndex < videos.length - 1) {
                e.preventDefault();
                scrollToVideo(currentIndex + 1);
            } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                e.preventDefault();
                scrollToVideo(currentIndex - 1);
            } else if (e.key === 'm') {
                setIsMuted(prev => !prev);
            } else if (e.key === 'l') {
                handleLike(videos[currentIndex]?.id);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, videos]);

    const scrollToVideo = (index) => {
        videoRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
    };

    // Preload next videos for smoother playback
    useEffect(() => {
        const preloadCount = 2;
        for (let i = 1; i <= preloadCount; i++) {
            const nextVideo = videos[currentIndex + i];
            if (nextVideo?.videoUrl) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'video';
                link.href = nextVideo.videoUrl;
                // Only add if not already present
                if (!document.querySelector(`link[href="${nextVideo.videoUrl}"]`)) {
                    document.head.appendChild(link);
                }
            }
        }
    }, [currentIndex, videos]);

    const handleLike = (videoId) => {
        setLikedVideos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(videoId)) {
                newSet.delete(videoId);
            } else {
                newSet.add(videoId);
            }
            return newSet;
        });
    };

    const handleFollow = (creatorName) => {
        setFollowedCreators(prev => {
            const newSet = new Set(prev);
            if (newSet.has(creatorName)) {
                newSet.delete(creatorName);
            } else {
                newSet.add(creatorName);
            }
            return newSet;
        });
    };

    const handleShare = async (video) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: video.title,
                    text: `Check out this video by ${video.creator}!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const formatCount = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div className="h-screen bg-black overflow-hidden flex">
            {/* Sidebar - Desktop only */}
            <aside className="hidden md:flex flex-col w-20 lg:w-64 bg-gray-900 border-r border-gray-800 shrink-0">
                {/* Logo */}
                <div className="p-4 border-b border-gray-800">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">▶</span>
                        </div>
                        <span className="hidden lg:block text-white font-bold text-xl">PodStream</span>
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-2 space-y-1">
                    {[
                        { icon: '🏠', label: 'For You', href: '/' },
                        { icon: '🔍', label: 'Discover', href: '/browse' },
                        { icon: '➕', label: 'Upload', href: '/upload' },
                        { icon: '📥', label: 'Following', href: '/following' },
                        { icon: '👤', label: 'Profile', href: '/profile' },
                    ].map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition"
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="hidden lg:block font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Stats */}
                <div className="hidden lg:block p-4 border-t border-gray-800">
                    <div className="text-xs text-gray-500 mb-2">Now Watching</div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-white text-sm font-medium">
                            {formatCount(Math.floor(Math.random() * 50000) + 10000)} viewers
                        </span>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 relative">
                {/* Category tabs - horizontal scroll on mobile */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black via-black/80 to-transparent pt-4 pb-8 px-4">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${activeCategory === cat.id
                                    ? 'bg-white text-black'
                                    : 'bg-gray-800/80 text-white hover:bg-gray-700'
                                    }`}
                            >
                                <span className="mr-1">{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Video feed */}
                <div
                    ref={containerRef}
                    className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                >
                    {loading && videos.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-white">
                            <p className="text-xl mb-4">😔 {error}</p>
                            <button
                                onClick={() => fetchVideos(1, true)}
                                className="px-6 py-2 bg-pink-500 rounded-full hover:bg-pink-600 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        videos.map((video, index) => (
                            <div
                                key={video.id}
                                ref={(el) => (videoRefs.current[index] = el)}
                                data-index={index}
                                className="h-full w-full snap-start snap-always"
                            >
                                <VideoPlayer
                                    video={video}
                                    isActive={index === currentIndex}
                                    isMuted={isMuted}
                                    onToggleMute={() => setIsMuted(prev => !prev)}
                                    onLike={() => handleLike(video.id)}
                                    onComment={() => setShowComments(true)}
                                    onShare={() => handleShare(video)}
                                    onFollow={() => handleFollow(video.creator)}
                                    isLiked={likedVideos.has(video.id)}
                                    isFollowing={followedCreators.has(video.creator)}
                                />
                            </div>
                        ))
                    )}

                    {/* Load more indicator */}
                    {loading && videos.length > 0 && (
                        <div className="h-20 flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Mobile bottom nav */}
                <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-gray-800 safe-area-inset-bottom">
                    <div className="flex justify-around py-2">
                        {[
                            { icon: '🏠', label: 'Home', href: '/', active: true },
                            { icon: '🔍', label: 'Discover', href: '/browse' },
                            { icon: '➕', label: '', href: '/upload', isCreate: true },
                            { icon: '📥', label: 'Inbox', href: '/inbox' },
                            { icon: '👤', label: 'Me', href: '/profile' },
                        ].map((item) =>
                            item.isCreate ? (
                                <Link
                                    key="create"
                                    href={item.href}
                                    className="w-12 h-8 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-lg flex items-center justify-center"
                                >
                                    <span className="text-white text-lg">+</span>
                                </Link>
                            ) : (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex flex-col items-center gap-0.5 px-3 ${item.active ? 'text-white' : 'text-gray-500'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-[10px]">{item.label}</span>
                                </Link>
                            )
                        )}
                    </div>
                </nav>

                {/* Unmute prompt */}
                {isMuted && currentIndex === 0 && (
                    <button
                        onClick={() => setIsMuted(false)}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full text-white font-medium flex items-center gap-2 hover:bg-white/30 transition animate-pulse"
                    >
                        🔊 Tap to unmute
                    </button>
                )}

                {/* Keyboard shortcuts hint */}
                <div className="hidden md:block absolute bottom-4 right-4 z-20 text-gray-500 text-xs space-y-1">
                    <div>↑↓ Navigate</div>
                    <div>M Mute</div>
                    <div>L Like</div>
                </div>
            </main>

            {/* Comments drawer */}
            {showComments && (
                <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowComments(false)}>
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl max-h-[70vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h3 className="text-white font-bold text-lg">
                                {videos[currentIndex]?.comments || 0} Comments
                            </h3>
                            <button
                                onClick={() => setShowComments(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto max-h-[50vh]">
                            {/* Sample comments */}
                            {[
                                { user: 'user123', text: 'This is amazing! 🔥', likes: 234 },
                                { user: 'techfan', text: 'Learned so much from this', likes: 89 },
                                { user: 'viewer99', text: 'Keep making content like this!', likes: 156 },
                            ].map((comment, i) => (
                                <div key={i} className="flex gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                                        {comment.user.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium text-sm">{comment.user}</p>
                                        <p className="text-gray-300 text-sm">{comment.text}</p>
                                        <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs">
                                            <span>2h ago</span>
                                            <button className="hover:text-white">Reply</button>
                                            <button className="hover:text-pink-500 flex items-center gap-1">
                                                ♥ {comment.likes}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Comment input */}
                        <div className="p-4 border-t border-gray-800 flex gap-3">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <button className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600">
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
