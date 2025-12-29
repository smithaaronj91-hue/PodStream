import React, { useRef, useState, useEffect, useCallback } from 'react';

export default function VideoPlayer({
    video,
    isActive,
    isMuted,
    onToggleMute,
    onLike,
    onComment,
    onShare,
    onFollow,
    isLiked = false,
    isFollowing = false,
}) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);

    // Handle play/pause based on active state
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        if (isActive) {
            videoEl.play().catch(() => { });
            setIsPlaying(true);
        } else {
            videoEl.pause();
            videoEl.currentTime = 0;
            setIsPlaying(false);
        }
    }, [isActive]);

    // Handle mute state
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Update progress
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        const handleTimeUpdate = () => {
            setProgress((videoEl.currentTime / videoEl.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(videoEl.duration);
            setIsBuffering(false);
        };

        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleEnded = () => {
            videoEl.currentTime = 0;
            videoEl.play().catch(() => { });
        };

        videoEl.addEventListener('timeupdate', handleTimeUpdate);
        videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoEl.addEventListener('waiting', handleWaiting);
        videoEl.addEventListener('playing', handlePlaying);
        videoEl.addEventListener('ended', handleEnded);

        return () => {
            videoEl.removeEventListener('timeupdate', handleTimeUpdate);
            videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
            videoEl.removeEventListener('waiting', handleWaiting);
            videoEl.removeEventListener('playing', handlePlaying);
            videoEl.removeEventListener('ended', handleEnded);
        };
    }, []);

    const handleVideoClick = useCallback(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        if (videoEl.paused) {
            videoEl.play().catch(() => { });
            setIsPlaying(true);
        } else {
            videoEl.pause();
            setIsPlaying(false);
        }
    }, []);

    const formatCount = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatDuration = (secs) => {
        const mins = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${mins}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative w-full h-full bg-black">
            {/* Video */}
            <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                playsInline
                muted={isMuted}
                onClick={handleVideoClick}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
            />

            {/* Buffering indicator */}
            {isBuffering && isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            )}

            {/* Play/Pause indicator (shows briefly on tap) */}
            {!isPlaying && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-20 h-1 bg-white/30">
                <div
                    className="h-full bg-white transition-all duration-100"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

            {/* Right side actions */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
                {/* Creator avatar */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5">
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-2xl overflow-hidden">
                            {video.creatorAvatar?.startsWith('http') ? (
                                <img src={video.creatorAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                video.creatorAvatar || video.creator?.charAt(0)
                            )}
                        </div>
                    </div>
                    {!isFollowing && (
                        <button
                            onClick={onFollow}
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg hover:bg-pink-600 transition"
                        >
                            +
                        </button>
                    )}
                </div>

                {/* Like */}
                <button onClick={onLike} className="flex flex-col items-center gap-1">
                    <div className={`w-12 h-12 rounded-full ${isLiked ? 'bg-pink-500' : 'bg-black/40'} flex items-center justify-center transition-colors`}>
                        <svg className={`w-7 h-7 ${isLiked ? 'text-white' : 'text-white'}`} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <span className="text-white text-xs font-semibold">{formatCount(video.likes)}</span>
                </button>

                {/* Comment */}
                <button onClick={onComment} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <span className="text-white text-xs font-semibold">{formatCount(video.comments)}</span>
                </button>

                {/* Share */}
                <button onClick={onShare} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </div>
                    <span className="text-white text-xs font-semibold">{formatCount(video.shares)}</span>
                </button>

                {/* Mute toggle */}
                <button onClick={onToggleMute} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center">
                        {isMuted ? (
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        ) : (
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        )}
                    </div>
                </button>

                {/* Spinning disc (sound) */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
                    <div className="w-4 h-4 rounded-full bg-gray-600" />
                </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-4 left-4 right-20">
                {/* Creator name */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-bold text-base">@{video.creator}</span>
                    {video.isVerified && (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>

                {/* Title */}
                <p className="text-white text-sm mb-2 line-clamp-2">{video.title}</p>

                {/* Description with hashtags */}
                <p className="text-white/80 text-xs line-clamp-1">
                    {video.description?.slice(0, 80)}...
                </p>

                {/* Sound */}
                <div className="flex items-center gap-2 mt-2">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                    </svg>
                    <span className="text-white text-xs">
                        {video.soundName || `Original Sound - ${video.creator}`}
                    </span>
                    {video.isOriginalSound && (
                        <span className="px-1.5 py-0.5 bg-pink-500/30 text-pink-300 text-xs rounded">Original</span>
                    )}
                </div>
            </div>

            {/* Duration badge */}
            {showControls && duration > 0 && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 rounded text-white text-xs">
                    {formatDuration(duration)}
                </div>
            )}

            {/* Category badge */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded-full text-white text-xs font-medium">
                {video.category}
            </div>
        </div>
    );
}
