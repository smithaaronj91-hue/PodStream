import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { usePlayerStore } from '@/lib/playerStore';

export default function PodcastPage() {
    const router = useRouter();
    const { id } = router.query;
    const { currentPodcast, fetchPodcast } = useStore();
    const { playEpisode, addToQueue, currentEpisode, isPlaying, setIsPlaying } = usePlayerStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadPodcast();
        }
    }, [id]);

    const loadPodcast = async () => {
        setLoading(true);
        await fetchPodcast(id);
        setLoading(false);
    };

    const handlePlayEpisode = (episode, e) => {
        e?.stopPropagation();
        const episodeWithPodcast = {
            ...episode,
            podcast_id: currentPodcast.id,
            podcast_title: currentPodcast.title,
            podcast_cover: currentPodcast.cover_image_url,
        };

        if (currentEpisode?.id === episode.id) {
            setIsPlaying(!isPlaying);
        } else {
            playEpisode(episodeWithPodcast);
        }
    };

    const handleAddToQueue = (episode, e) => {
        e?.stopPropagation();
        const episodeWithPodcast = {
            ...episode,
            podcast_id: currentPodcast.id,
            podcast_title: currentPodcast.title,
            podcast_cover: currentPodcast.cover_image_url,
        };
        addToQueue(episodeWithPodcast);
    };

    const handlePlayAll = () => {
        if (!currentPodcast?.episodes?.length) return;

        const episodes = currentPodcast.episodes.map(ep => ({
            ...ep,
            podcast_id: currentPodcast.id,
            podcast_title: currentPodcast.title,
            podcast_cover: currentPodcast.cover_image_url,
        }));

        // Play first, queue the rest
        playEpisode(episodes[0]);
        episodes.slice(1).forEach(ep => addToQueue(ep));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!currentPodcast) {
        return <div className="text-center py-12">Podcast not found</div>;
    }

    const podcast = currentPodcast;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Back Link */}
            <div className="bg-gray-900 pt-4">
                <div className="max-w-7xl mx-auto px-4">
                    <Link href="/" className="text-white/70 hover:text-white text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>

            {/* Podcast Header */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 flex gap-8">
                    {/* Cover Image */}
                    <div className="flex-shrink-0">
                        {podcast.cover_image_url && (
                            <img
                                src={podcast.cover_image_url}
                                alt={podcast.title}
                                className="h-40 w-40 rounded-lg shadow-lg"
                            />
                        )}
                    </div>

                    {/* Podcast Info */}
                    <div className="flex-1 flex flex-col justify-center">
                        {podcast.is_premium && (
                            <div className="inline-flex items-center gap-2 mb-2 w-fit bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                                ⭐ Premium
                            </div>
                        )}
                        <h1 className="text-4xl font-bold mb-2">{podcast.title}</h1>
                        <p className="text-lg opacity-90 mb-4">
                            by <span className="font-semibold">{podcast.creator_name}</span>
                        </p>
                        <div className="flex gap-6 text-sm mb-4">
                            <span>{podcast.total_episodes} episodes</span>
                            {podcast.average_rating && (
                                <span>⭐ {podcast.average_rating}</span>
                            )}
                        </div>
                        <p className="text-opacity-80 mb-6">{podcast.description}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={handlePlayAll}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Play All
                            </button>
                            <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-6 rounded-lg transition">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Episodes */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">Episodes</h2>
                    <span className="text-gray-500">{podcast.episodes?.length || 0} episodes</span>
                </div>

                {podcast.episodes && podcast.episodes.length > 0 ? (
                    <div className="space-y-4">
                        {podcast.episodes.map((episode) => {
                            const isCurrentEpisode = currentEpisode?.id === episode.id;
                            const isEpisodePlaying = isCurrentEpisode && isPlaying;

                            return (
                                <Link
                                    key={episode.id}
                                    href={`/episode/${episode.id}?podcastId=${podcast.id}`}
                                    className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-semibold text-gray-600">
                                                    S{episode.season_number} E{episode.episode_number}
                                                </span>
                                                {episode.is_premium && (
                                                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                                        Premium
                                                    </span>
                                                )}
                                                {isCurrentEpisode && (
                                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                                        {isEpisodePlaying ? '▶ Playing' : '⏸ Paused'}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {episode.title}
                                            </h3>
                                            <p className="text-gray-600 mb-2 line-clamp-2">{episode.description}</p>
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                <span>{formatDuration(episode.duration_seconds)}</span>
                                                <span>{episode.view_count} listens</span>
                                                <span>{formatDate(episode.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => handleAddToQueue(episode, e)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                                                title="Add to queue"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={(e) => handlePlayEpisode(episode, e)}
                                                className={`flex-shrink-0 rounded-full p-3 transition ${isEpisodePlaying
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white'
                                                    }`}
                                            >
                                                {isEpisodePlaying ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">No episodes available</p>
                )}
            </div>
        </div>
    );
}

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
