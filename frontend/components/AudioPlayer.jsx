import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/lib/playerStore';

export default function AudioPlayer() {
    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const [showQueue, setShowQueue] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showSleepTimer, setShowSleepTimer] = useState(false);
    const [sleepTimeRemaining, setSleepTimeRemaining] = useState(null);

    const {
        currentEpisode,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackSpeed,
        queue,
        sleepTimer,
        setIsPlaying,
        setCurrentTime,
        setDuration,
        setVolume,
        setPlaybackSpeed,
        setSleepTimer,
        playNext,
        playPrevious,
        removeFromQueue,
        clearQueue,
    } = usePlayerStore();

    // Handle audio events
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration);
        const handleEnded = () => {
            playNext();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [setCurrentTime, setDuration, playNext]);

    // Handle play/pause
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentEpisode) return;

        if (isPlaying) {
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }
    }, [isPlaying, currentEpisode]);

    // Handle source change
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentEpisode?.audio_url) return;

        audio.src = currentEpisode.audio_url;
        audio.load();
        if (isPlaying) {
            audio.play().catch(console.error);
        }
    }, [currentEpisode?.id]);

    // Handle playback speed
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    // Handle volume
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;
        }
    }, [volume]);

    // Sleep timer countdown
    useEffect(() => {
        if (!sleepTimer) {
            setSleepTimeRemaining(null);
            return;
        }

        const interval = setInterval(() => {
            const remaining = sleepTimer - Date.now();
            if (remaining <= 0) {
                setIsPlaying(false);
                setSleepTimer(null);
                setSleepTimeRemaining(null);
            } else {
                setSleepTimeRemaining(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [sleepTimer, setIsPlaying, setSleepTimer]);

    const handleSeek = useCallback((e) => {
        const audio = audioRef.current;
        const progress = progressRef.current;
        if (!audio || !progress) return;

        const rect = progress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * duration;
    }, [duration]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatSleepTime = (ms) => {
        if (!ms) return '';
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const setSleepTimerMinutes = (minutes) => {
        if (minutes === null) {
            setSleepTimer(null);
        } else {
            setSleepTimer(Date.now() + minutes * 60 * 1000);
        }
        setShowSleepTimer(false);
    };

    const skipForward = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = Math.min(audio.currentTime + 30, duration);
        }
    };

    const skipBackward = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = Math.max(audio.currentTime - 15, 0);
        }
    };

    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];

    if (!currentEpisode) return null;

    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <>
            {/* Hidden audio element */}
            <audio ref={audioRef} preload="metadata" />

            {/* Main Player Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-2xl z-50">
                {/* Progress Bar */}
                <div
                    ref={progressRef}
                    className="h-1 bg-gray-700 cursor-pointer group"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-blue-500 group-hover:bg-blue-400 transition-colors relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        {/* Episode Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <img
                                src={currentEpisode.podcast_cover || currentEpisode.cover_image_url || '/placeholder-podcast.png'}
                                alt={currentEpisode.title}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                                <Link
                                    href={`/episode/${currentEpisode.id}?podcastId=${currentEpisode.podcast_id}`}
                                    className="font-semibold text-sm truncate block hover:text-blue-400 transition"
                                >
                                    {currentEpisode.title}
                                </Link>
                                <p className="text-xs text-gray-400 truncate">
                                    {currentEpisode.podcast_title}
                                </p>
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex items-center gap-2 mx-4">
                            {/* Skip Back 15s */}
                            <button
                                onClick={skipBackward}
                                className="p-2 hover:bg-gray-700 rounded-full transition"
                                title="Back 15 seconds"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                    <text x="9" y="15" fontSize="7" fontWeight="bold">15</text>
                                </svg>
                            </button>

                            {/* Previous */}
                            <button
                                onClick={playPrevious}
                                className="p-2 hover:bg-gray-700 rounded-full transition"
                                title="Previous"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                </svg>
                            </button>

                            {/* Play/Pause */}
                            <button
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-3 bg-white text-gray-900 rounded-full hover:scale-105 transition"
                            >
                                {isPlaying ? (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Next */}
                            <button
                                onClick={playNext}
                                className="p-2 hover:bg-gray-700 rounded-full transition"
                                title="Next"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                </svg>
                            </button>

                            {/* Skip Forward 30s */}
                            <button
                                onClick={skipForward}
                                className="p-2 hover:bg-gray-700 rounded-full transition"
                                title="Forward 30 seconds"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                                    <text x="9" y="15" fontSize="7" fontWeight="bold">30</text>
                                </svg>
                            </button>
                        </div>

                        {/* Time Display */}
                        <div className="text-xs text-gray-400 mx-4 whitespace-nowrap">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>

                        {/* Secondary Controls */}
                        <div className="flex items-center gap-2">
                            {/* Playback Speed */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowSpeedMenu(!showSpeedMenu);
                                        setShowSleepTimer(false);
                                        setShowQueue(false);
                                    }}
                                    className="px-2 py-1 text-xs font-semibold bg-gray-700 hover:bg-gray-600 rounded transition"
                                    title="Playback speed"
                                >
                                    {playbackSpeed}x
                                </button>
                                {showSpeedMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl py-2 min-w-[100px]">
                                        {speedOptions.map((speed) => (
                                            <button
                                                key={speed}
                                                onClick={() => {
                                                    setPlaybackSpeed(speed);
                                                    setShowSpeedMenu(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition ${playbackSpeed === speed ? 'text-blue-400' : ''
                                                    }`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Sleep Timer */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setShowSleepTimer(!showSleepTimer);
                                        setShowSpeedMenu(false);
                                        setShowQueue(false);
                                    }}
                                    className={`p-2 hover:bg-gray-700 rounded-full transition ${sleepTimer ? 'text-blue-400' : ''
                                        }`}
                                    title="Sleep timer"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                    {sleepTimeRemaining && (
                                        <span className="absolute -top-1 -right-1 text-[10px] bg-blue-500 rounded px-1">
                                            {formatSleepTime(sleepTimeRemaining)}
                                        </span>
                                    )}
                                </button>
                                {showSleepTimer && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-xl py-2 min-w-[140px]">
                                        <button
                                            onClick={() => setSleepTimerMinutes(null)}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition"
                                        >
                                            Off
                                        </button>
                                        {[5, 10, 15, 30, 45, 60, 90, 120].map((mins) => (
                                            <button
                                                key={mins}
                                                onClick={() => setSleepTimerMinutes(mins)}
                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition"
                                            >
                                                {mins} minutes
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                // End of episode - calculate remaining time
                                                const remaining = duration - currentTime;
                                                setSleepTimer(Date.now() + remaining * 1000 / playbackSpeed);
                                                setShowSleepTimer(false);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition border-t border-gray-700"
                                        >
                                            End of episode
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Volume */}
                            <div className="flex items-center gap-2 group">
                                <button
                                    onClick={() => setVolume(volume === 0 ? 1 : 0)}
                                    className="p-2 hover:bg-gray-700 rounded-full transition"
                                >
                                    {volume === 0 ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                        </svg>
                                    ) : volume < 0.5 ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                        </svg>
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>

                            {/* Queue Button */}
                            <button
                                onClick={() => {
                                    setShowQueue(!showQueue);
                                    setShowSpeedMenu(false);
                                    setShowSleepTimer(false);
                                }}
                                className={`p-2 hover:bg-gray-700 rounded-full transition ${showQueue ? 'text-blue-400' : ''
                                    }`}
                                title="Queue"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                {queue.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                        {queue.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Queue Panel */}
            {showQueue && (
                <div className="fixed bottom-20 right-4 w-80 max-h-96 bg-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-white">Up Next</h3>
                        {queue.length > 0 && (
                            <button
                                onClick={clearQueue}
                                className="text-xs text-gray-400 hover:text-white transition"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <div className="overflow-y-auto max-h-72">
                        {queue.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                                <p>Your queue is empty</p>
                                <p className="text-sm mt-1">Add episodes to play next</p>
                            </div>
                        ) : (
                            queue.map((episode, index) => (
                                <div
                                    key={`${episode.id}-${index}`}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-700 transition group"
                                >
                                    <span className="text-gray-500 text-sm w-4">{index + 1}</span>
                                    <img
                                        src={episode.podcast_cover || '/placeholder-podcast.png'}
                                        alt={episode.title}
                                        className="w-10 h-10 rounded object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{episode.title}</p>
                                        <p className="text-xs text-gray-400 truncate">{episode.podcast_title}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromQueue(index)}
                                        className="p-1 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
