import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { usePlayerStore } from '@/lib/playerStore';
import ShareModal from '@/components/ShareModal';

export default function EpisodePage() {
    const router = useRouter();
    const { id, podcastId } = router.query;
    const { currentPodcast, fetchPodcast } = useStore();
    const { playEpisode, addToQueue, currentEpisode, isPlaying: playerIsPlaying, setIsPlaying: setPlayerIsPlaying } = usePlayerStore();
    const [loading, setLoading] = useState(true);
    const [episode, setEpisode] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);

    useEffect(() => {
        if (podcastId && id) {
            loadEpisode();
        }
    }, [id, podcastId]);

    const loadEpisode = async () => {
        setLoading(true);
        await fetchPodcast(podcastId);
        setLoading(false);
    };

    useEffect(() => {
        if (currentPodcast?.episodes) {
            const foundEpisode = currentPodcast.episodes.find(
                (ep) => ep.id === parseInt(id)
            );
            setEpisode(foundEpisode);
        }
    }, [currentPodcast, id]);

    const handlePlay = () => {
        if (!episode || !currentPodcast) return;

        const episodeWithPodcast = {
            ...episode,
            podcast_id: currentPodcast.id,
            podcast_title: currentPodcast.title,
            podcast_cover: currentPodcast.cover_image_url,
        };

        if (currentEpisode?.id === episode.id) {
            setPlayerIsPlaying(!playerIsPlaying);
        } else {
            playEpisode(episodeWithPodcast);
        }
    };

    const handleAddToQueue = () => {
        if (!episode || !currentPodcast) return;

        const episodeWithPodcast = {
            ...episode,
            podcast_id: currentPodcast.id,
            podcast_title: currentPodcast.title,
            podcast_cover: currentPodcast.cover_image_url,
        };

        addToQueue(episodeWithPodcast);
    };

    const isCurrentlyPlaying = currentEpisode?.id === episode?.id && playerIsPlaying;

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!currentPodcast || !episode) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Episode not found</p>
                <Link href="/" className="text-blue-600 hover:text-blue-700">
                    Back to Home
                </Link>
            </div>
        );
    }

    const podcast = currentPodcast;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Button */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link
                        href={`/podcast/${podcastId}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                        ← Back to Podcast
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Episode Header */}
                <div className="mb-8">
                    <div className="flex gap-6 mb-6">
                        {/* Podcast Cover */}
                        <div className="flex-shrink-0">
                            <img
                                src={podcast.cover_image_url}
                                alt={podcast.title}
                                className="w-40 h-40 rounded-lg shadow-lg object-cover"
                            />
                        </div>

                        {/* Episode Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-600">
                                    Season {episode.season_number} • Episode {episode.episode_number}
                                </span>
                                {episode.is_premium && (
                                    <span className="bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded-full font-bold">
                                        ⭐ Premium
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                {episode.title}
                            </h1>
                            <p className="text-gray-600 text-lg mb-4">{podcast.title}</p>
                            <div className="flex gap-6 text-sm text-gray-600 mb-6">
                                <span>📅 {formatDate(episode.created_at)}</span>
                                <span>⏱️ {formatDuration(episode.duration_seconds)}</span>
                                <span>👂 {episode.view_count} listens</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                {episode.description}
                            </p>

                            {/* Creator Info */}
                            <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
                                <img
                                    src={podcast.creator_picture}
                                    alt={podcast.creator_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="text-sm text-gray-600">Hosted by</p>
                                    <p className="font-semibold text-gray-900">
                                        {podcast.creator_name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Player */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    {/* Audio Player Section */}
                    <div className="mb-6">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={handlePlay}
                                className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center text-white text-4xl shadow-lg transform hover:scale-110 transition"
                            >
                                {isCurrentlyPlaying ? '⏸' : '▶'}
                            </button>
                            <button
                                onClick={handleAddToQueue}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition"
                                title="Add to queue"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add to Queue
                            </button>
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            {isCurrentlyPlaying ? 'Now playing in the global player below' : 'Click play to listen'}
                        </p>
                    </div>
                </div>

                {/* Episode Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-900 transition">
                            ❤️ Save Episode
                        </button>
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-900 transition"
                        >
                            📤 Share
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-900 transition">
                            ⭐ Rate
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-900 transition">
                            📥 Download
                        </button>
                        <Link
                            href={`/remix/${episode.id}?podcastId=${podcastId}`}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg font-semibold text-white transition"
                        >
                            ✂️ Remix / Create Short
                        </Link>
                    </div>
                </div>

                {/* Description Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">About this Episode</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">{episode.description}</p>

                    {/* Show Notes - Could be expanded */}
                    <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Show Notes</h4>
                        <p className="text-gray-600 text-sm">
                            Show notes and timestamps coming soon...
                        </p>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                episode={episode}
                podcast={podcast}
            />
        </div>
    );
}
