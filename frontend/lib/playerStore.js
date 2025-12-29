import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(
    persist(
        (set, get) => ({
            // Current playback state
            currentEpisode: null,
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: 1,
            playbackSpeed: 1,

            // Queue management
            queue: [],
            history: [],

            // Sleep timer (stores end timestamp)
            sleepTimer: null,

            // Listening stats
            stats: {
                totalListenTime: 0, // in seconds
                episodesCompleted: 0,
                streakDays: 0,
                lastListenDate: null,
                weeklyListenTime: [0, 0, 0, 0, 0, 0, 0], // Sun-Sat
            },

            // Actions
            setIsPlaying: (isPlaying) => set({ isPlaying }),

            setCurrentTime: (currentTime) => {
                const state = get();
                // Update stats every 10 seconds
                if (Math.floor(currentTime) % 10 === 0 && state.isPlaying) {
                    const today = new Date().getDay();
                    const newWeekly = [...state.stats.weeklyListenTime];
                    newWeekly[today] += 10;

                    set({
                        currentTime,
                        stats: {
                            ...state.stats,
                            totalListenTime: state.stats.totalListenTime + 10,
                            weeklyListenTime: newWeekly,
                            lastListenDate: new Date().toISOString(),
                        },
                    });
                } else {
                    set({ currentTime });
                }
            },

            setDuration: (duration) => set({ duration }),

            setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

            setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

            setSleepTimer: (sleepTimer) => set({ sleepTimer }),

            // Play an episode
            playEpisode: (episode) => {
                const state = get();

                // Add current episode to history if exists
                if (state.currentEpisode) {
                    const newHistory = [state.currentEpisode, ...state.history].slice(0, 50);
                    set({
                        currentEpisode: episode,
                        isPlaying: true,
                        currentTime: 0,
                        history: newHistory,
                    });
                } else {
                    set({
                        currentEpisode: episode,
                        isPlaying: true,
                        currentTime: 0,
                    });
                }
            },

            // Add to queue
            addToQueue: (episode) => {
                const state = get();
                // Prevent duplicates
                if (state.queue.some((e) => e.id === episode.id)) return;
                set({ queue: [...state.queue, episode] });
            },

            // Add to queue and play next
            playNext: () => {
                const state = get();
                if (state.queue.length > 0) {
                    const [nextEpisode, ...remainingQueue] = state.queue;
                    const newHistory = state.currentEpisode
                        ? [state.currentEpisode, ...state.history].slice(0, 50)
                        : state.history;

                    // Mark episode as completed
                    set({
                        currentEpisode: nextEpisode,
                        queue: remainingQueue,
                        history: newHistory,
                        currentTime: 0,
                        isPlaying: true,
                        stats: {
                            ...state.stats,
                            episodesCompleted: state.stats.episodesCompleted + 1,
                        },
                    });
                } else {
                    // No more episodes, stop playing
                    set({ isPlaying: false });
                }
            },

            playPrevious: () => {
                const state = get();
                if (state.history.length > 0) {
                    const [previousEpisode, ...remainingHistory] = state.history;
                    const newQueue = state.currentEpisode
                        ? [state.currentEpisode, ...state.queue]
                        : state.queue;

                    set({
                        currentEpisode: previousEpisode,
                        history: remainingHistory,
                        queue: newQueue,
                        currentTime: 0,
                        isPlaying: true,
                    });
                }
            },

            removeFromQueue: (index) => {
                const state = get();
                const newQueue = state.queue.filter((_, i) => i !== index);
                set({ queue: newQueue });
            },

            clearQueue: () => set({ queue: [] }),

            // Reorder queue
            reorderQueue: (fromIndex, toIndex) => {
                const state = get();
                const newQueue = [...state.queue];
                const [removed] = newQueue.splice(fromIndex, 1);
                newQueue.splice(toIndex, 0, removed);
                set({ queue: newQueue });
            },

            // Resume/remember position for episodes
            savedPositions: {},

            savePosition: (episodeId, position) => {
                const state = get();
                set({
                    savedPositions: {
                        ...state.savedPositions,
                        [episodeId]: position,
                    },
                });
            },

            getSavedPosition: (episodeId) => {
                const state = get();
                return state.savedPositions[episodeId] || 0;
            },

            // Clear saved position when episode is completed
            clearSavedPosition: (episodeId) => {
                const state = get();
                const { [episodeId]: _, ...remaining } = state.savedPositions;
                set({ savedPositions: remaining });
            },
        }),
        {
            name: 'podstream-player-storage',
            partialize: (state) => ({
                volume: state.volume,
                playbackSpeed: state.playbackSpeed,
                stats: state.stats,
                savedPositions: state.savedPositions,
                queue: state.queue,
                history: state.history.slice(0, 10),
            }),
        }
    )
);
