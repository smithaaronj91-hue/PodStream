import React, { useState } from 'react';
import Link from 'next/link';

export default function EpisodeClip({ episode, podcast }) {
    const [isPlaying, setIsPlaying] = useState(false);

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center relative snap-center overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black opacity-50"></div>

            {/* Podcast Cover Background */}
            <div
                className="absolute inset-0 opacity-20 blur-lg"
                style={{
                    backgroundImage: `url(${podcast.cover_image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            ></div>

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-300">
                            {podcast.creator_name}
                        </h2>
                        <h1 className="text-2xl font-bold text-white mt-1 max-w-xs">
                            {podcast.title}
                        </h1>
                    </div>
                    {episode.is_premium && (
                        <div className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                            ⭐ Premium
                        </div>
                    )}
                </div>

                {/* Center - Play Button and Podcast Image */}
                <div className="flex flex-col items-center justify-center gap-6">
                    {/* Podcast Cover */}
                    <div className="relative">
                        <img
                            src={podcast.cover_image_url}
                            alt={podcast.title}
                            className="w-48 h-48 rounded-xl shadow-2xl object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl"></div>
                    </div>

                    {/* Episode Info */}
                    <div className="text-center max-w-sm">
                        <div className="text-gray-400 text-sm mb-2">
                            Season {episode.season_number} • Episode {episode.episode_number}
                        </div>
                        <h3 className="text-3xl font-bold mb-3 line-clamp-3">
                            {episode.title}
                        </h3>
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                            {episode.description}
                        </p>
                        <div className="flex justify-center gap-6 text-sm text-gray-400">
                            <span>{formatDuration(episode.duration_seconds)}</span>
                            <span>{episode.view_count} listens</span>
                        </div>
                    </div>

                    {/* Play Button */}
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center text-white shadow-2xl transform hover:scale-110 transition"
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                </div>

                {/* Footer - Actions */}
                <div className="flex items-center justify-between">
                    {/* Left Actions */}
                    <div className="flex gap-4">
                        <button className="flex flex-col items-center gap-1 hover:scale-110 transition">
                            <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl">
                                ❤️
                            </div>
                            <span className="text-xs opacity-70">Like</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:scale-110 transition">
                            <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl">
                                💬
                            </div>
                            <span className="text-xs opacity-70">Comment</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:scale-110 transition">
                            <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl">
                                ↗️
                            </div>
                            <span className="text-xs opacity-70">Share</span>
                        </button>
                    </div>

                    {/* Right Action - Full Episode Button */}
                    <Link href={`/episode/${episode.id}?podcastId=${podcast.id}`}>
                        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 px-6 py-3 rounded-full font-semibold text-white shadow-lg transform hover:scale-105 transition whitespace-nowrap">
                            <span>Full Episode</span>
                            <span>→</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Hover Indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition text-gray-400 text-xs pointer-events-none">
                Scroll
            </div>
        </div>
    );
}
