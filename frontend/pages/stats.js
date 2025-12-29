import React from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/lib/playerStore';

export default function StatsPage() {
    const { stats, history, queue } = usePlayerStore();

    const formatListenTime = (seconds) => {
        if (!seconds) return '0 min';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} min`;
    };

    const getDayName = (index) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[index];
    };

    const maxWeeklyTime = Math.max(...stats.weeklyListenTime, 1);

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <Link href="/" className="text-white/80 hover:text-white mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Your Listening Stats</h1>
                    <p className="text-white/80">Track your podcast journey</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                            {formatListenTime(stats.totalListenTime)}
                        </div>
                        <div className="text-sm text-gray-600">Total Listen Time</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                            {stats.episodesCompleted}
                        </div>
                        <div className="text-sm text-gray-600">Episodes Completed</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                            {stats.streakDays}
                        </div>
                        <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                            {queue.length}
                        </div>
                        <div className="text-sm text-gray-600">In Queue</div>
                    </div>
                </div>

                {/* Weekly Activity */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">This Week's Activity</h2>
                    <div className="flex items-end justify-between gap-2 h-40">
                        {stats.weeklyListenTime.map((time, index) => {
                            const today = new Date().getDay();
                            const height = (time / maxWeeklyTime) * 100;
                            const isToday = index === today;

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div
                                        className={`w-full rounded-t-lg transition-all ${isToday
                                                ? 'bg-gradient-to-t from-purple-500 to-purple-400'
                                                : 'bg-gradient-to-t from-gray-300 to-gray-200'
                                            }`}
                                        style={{ height: `${Math.max(height, 4)}%` }}
                                        title={formatListenTime(time)}
                                    />
                                    <div className={`text-xs mt-2 ${isToday ? 'font-bold text-purple-600' : 'text-gray-500'}`}>
                                        {getDayName(index)}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {formatListenTime(time)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent History */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recently Played</h2>
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <p>No listening history yet</p>
                            <p className="text-sm mt-1">Start playing podcasts to see your history</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.slice(0, 10).map((episode, index) => (
                                <Link
                                    key={`${episode.id}-${index}`}
                                    href={`/episode/${episode.id}?podcastId=${episode.podcast_id}`}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition group"
                                >
                                    <img
                                        src={episode.podcast_cover || '/placeholder-podcast.png'}
                                        alt={episode.title}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate group-hover:text-purple-600 transition">
                                            {episode.title}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {episode.podcast_title}
                                        </p>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Queue Preview */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your Queue</h2>
                        {queue.length > 0 && (
                            <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                                {queue.length} episodes
                            </span>
                        )}
                    </div>
                    {queue.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            <p>Your queue is empty</p>
                            <p className="text-sm mt-1">Add episodes to play them next</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {queue.slice(0, 5).map((episode, index) => (
                                <div
                                    key={`${episode.id}-${index}`}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
                                >
                                    <span className="text-gray-400 font-medium w-6 text-center">
                                        {index + 1}
                                    </span>
                                    <img
                                        src={episode.podcast_cover || '/placeholder-podcast.png'}
                                        alt={episode.title}
                                        className="w-10 h-10 rounded object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate text-sm">
                                            {episode.title}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {episode.podcast_title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {queue.length > 5 && (
                                <p className="text-center text-sm text-gray-500 pt-2">
                                    +{queue.length - 5} more episodes
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Achievements Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className={`p-4 rounded-xl text-center ${stats.totalListenTime >= 3600 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                            <div className="text-3xl mb-2">{stats.totalListenTime >= 3600 ? '🏆' : '🔒'}</div>
                            <div className="font-semibold text-sm">First Hour</div>
                            <div className="text-xs text-gray-500">Listen for 1 hour</div>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${stats.episodesCompleted >= 10 ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <div className="text-3xl mb-2">{stats.episodesCompleted >= 10 ? '🎧' : '🔒'}</div>
                            <div className="font-semibold text-sm">Listener</div>
                            <div className="text-xs text-gray-500">Complete 10 episodes</div>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${stats.streakDays >= 7 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                            <div className="text-3xl mb-2">{stats.streakDays >= 7 ? '🔥' : '🔒'}</div>
                            <div className="font-semibold text-sm">Week Warrior</div>
                            <div className="text-xs text-gray-500">7 day streak</div>
                        </div>
                        <div className={`p-4 rounded-xl text-center ${stats.totalListenTime >= 36000 ? 'bg-purple-100' : 'bg-gray-100'}`}>
                            <div className="text-3xl mb-2">{stats.totalListenTime >= 36000 ? '👑' : '🔒'}</div>
                            <div className="font-semibold text-sm">Podcast Pro</div>
                            <div className="text-xs text-gray-500">Listen for 10 hours</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
