import { useEffect, useCallback } from 'react';
import { usePlayerStore } from './playerStore';

export function useKeyboardShortcuts() {
    const {
        currentEpisode,
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        playbackSpeed,
        setPlaybackSpeed,
        playNext,
        playPrevious,
    } = usePlayerStore();

    const handleKeyDown = useCallback((e) => {
        // Don't trigger shortcuts when typing in inputs
        if (
            e.target.tagName === 'INPUT' ||
            e.target.tagName === 'TEXTAREA' ||
            e.target.isContentEditable
        ) {
            return;
        }

        // Only handle shortcuts when there's an episode loaded
        if (!currentEpisode) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                setIsPlaying(!isPlaying);
                break;

            case 'ArrowLeft':
                e.preventDefault();
                if (e.shiftKey) {
                    // Shift + Left = Previous track
                    playPrevious();
                } else {
                    // Left = Seek backward 15s (handled by audio element)
                    const audio = document.querySelector('audio');
                    if (audio) {
                        audio.currentTime = Math.max(0, audio.currentTime - 15);
                    }
                }
                break;

            case 'ArrowRight':
                e.preventDefault();
                if (e.shiftKey) {
                    // Shift + Right = Next track
                    playNext();
                } else {
                    // Right = Seek forward 30s
                    const audio = document.querySelector('audio');
                    if (audio) {
                        audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
                    }
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                setVolume(Math.min(1, volume + 0.1));
                break;

            case 'ArrowDown':
                e.preventDefault();
                setVolume(Math.max(0, volume - 0.1));
                break;

            case 'KeyM':
                e.preventDefault();
                setVolume(volume === 0 ? 1 : 0);
                break;

            case 'Period':
                // > key (with shift) = increase speed
                if (e.shiftKey) {
                    e.preventDefault();
                    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
                    const currentIndex = speeds.indexOf(playbackSpeed);
                    if (currentIndex < speeds.length - 1) {
                        setPlaybackSpeed(speeds[currentIndex + 1]);
                    }
                }
                break;

            case 'Comma':
                // < key (with shift) = decrease speed
                if (e.shiftKey) {
                    e.preventDefault();
                    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
                    const currentIndex = speeds.indexOf(playbackSpeed);
                    if (currentIndex > 0) {
                        setPlaybackSpeed(speeds[currentIndex - 1]);
                    }
                }
                break;

            case 'Digit0':
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
            case 'Digit6':
            case 'Digit7':
            case 'Digit8':
            case 'Digit9':
                // Number keys to seek to percentage of episode
                e.preventDefault();
                const audio = document.querySelector('audio');
                if (audio && audio.duration) {
                    const percent = parseInt(e.code.replace('Digit', '')) * 10;
                    audio.currentTime = (percent / 100) * audio.duration;
                }
                break;

            default:
                break;
        }
    }, [currentEpisode, isPlaying, setIsPlaying, volume, setVolume, playbackSpeed, setPlaybackSpeed, playNext, playPrevious]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

// Component to show keyboard shortcuts help
export function KeyboardShortcutsHelp({ isOpen, onClose }) {
    if (!isOpen) return null;

    const shortcuts = [
        { key: 'Space', action: 'Play / Pause' },
        { key: '←', action: 'Seek backward 15s' },
        { key: '→', action: 'Seek forward 30s' },
        { key: 'Shift + ←', action: 'Previous episode' },
        { key: 'Shift + →', action: 'Next episode' },
        { key: '↑', action: 'Volume up' },
        { key: '↓', action: 'Volume down' },
        { key: 'M', action: 'Mute / Unmute' },
        { key: 'Shift + >', action: 'Increase speed' },
        { key: 'Shift + <', action: 'Decrease speed' },
        { key: '0-9', action: 'Seek to 0-90%' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Keyboard Shortcuts</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-3">
                    {shortcuts.map(({ key, action }) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-gray-600">{action}</span>
                            <kbd className="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">
                                {key}
                            </kbd>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
