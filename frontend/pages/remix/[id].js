import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function VideoRemixPage() {
    const router = useRouter();
    const { id } = router.query;

    const videoRef = useRef(null);
    const timelineRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [video, setVideo] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Clip state
    const [clipStart, setClipStart] = useState(0);
    const [clipEnd, setClipEnd] = useState(30);
    const [clipTitle, setClipTitle] = useState('');
    const [clipDescription, setClipDescription] = useState('');
    const [isDragging, setIsDragging] = useState(null);

    // Video effects
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [volume, setVolume] = useState(1);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);

    // Text overlay
    const [showTextOverlay, setShowTextOverlay] = useState(false);
    const [overlayText, setOverlayText] = useState('');
    const [textPosition, setTextPosition] = useState('bottom');
    const [textColor, setTextColor] = useState('#ffffff');
    const [textSize, setTextSize] = useState('medium');

    // Export options
    const [exportFormat, setExportFormat] = useState('mp4');
    const [exportQuality, setExportQuality] = useState('high');
    const [aspectRatio, setAspectRatio] = useState('9:16');

    // Processing state
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [processedFile, setProcessedFile] = useState(null);

    const MAX_CLIP_DURATION = 60;
    const MIN_CLIP_DURATION = 5;

    // Fetch video details
    useEffect(() => {
        if (id) {
            fetchVideo();
        }
    }, [id]);

    const fetchVideo = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/feed/video/${id}`);
            if (res.ok) {
                const data = await res.json();
                setVideo(data);
                setClipTitle(`${data.title} - Clip`);
                setClipEnd(Math.min(30, data.duration || 30));
            }
        } catch (error) {
            console.error('Error fetching video:', error);
        }
        setLoading(false);
    };

    // Video event handlers
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        const handleTimeUpdate = () => {
            setCurrentTime(videoEl.currentTime);
            if (videoEl.currentTime >= clipEnd) {
                videoEl.currentTime = clipStart;
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(videoEl.duration);
            setClipEnd(Math.min(30, videoEl.duration));
        };

        videoEl.addEventListener('timeupdate', handleTimeUpdate);
        videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            videoEl.removeEventListener('timeupdate', handleTimeUpdate);
            videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [clipStart, clipEnd]);

    // Apply video effects
    useEffect(() => {
        const videoEl = videoRef.current;
        if (videoEl) {
            videoEl.playbackRate = playbackSpeed;
            videoEl.volume = volume;
            videoEl.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        }
    }, [playbackSpeed, volume, brightness, contrast, saturation]);

    const handlePlayPause = () => {
        const videoEl = videoRef.current;
        if (!videoEl) return;

        if (isPlaying) {
            videoEl.pause();
        } else {
            videoEl.currentTime = clipStart;
            videoEl.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimelineClick = (e) => {
        const rect = timelineRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * duration;

        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleMarkerDrag = useCallback((e) => {
        if (!isDragging || !timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const time = percent * duration;

        if (isDragging === 'start') {
            const maxStart = clipEnd - MIN_CLIP_DURATION;
            setClipStart(Math.max(0, Math.min(time, maxStart)));
        } else if (isDragging === 'end') {
            const minEnd = clipStart + MIN_CLIP_DURATION;
            const maxEnd = Math.min(duration, clipStart + MAX_CLIP_DURATION);
            setClipEnd(Math.max(minEnd, Math.min(time, maxEnd)));
        }
    }, [isDragging, duration, clipStart, clipEnd]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMarkerDrag);
            window.addEventListener('mouseup', () => setIsDragging(null));
            return () => {
                window.removeEventListener('mousemove', handleMarkerDrag);
                window.removeEventListener('mouseup', () => setIsDragging(null));
            };
        }
    }, [isDragging, handleMarkerDrag]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExport = async () => {
        if (!clipTitle.trim()) {
            alert('Please enter a title for your clip');
            return;
        }

        setIsProcessing(true);
        setProcessingProgress(0);

        try {
            const formData = new FormData();
            formData.append('filePath', video.videoUrl);
            formData.append('startTime', clipStart.toString());
            formData.append('endTime', clipEnd.toString());
            formData.append('speed', playbackSpeed.toString());
            formData.append('format', exportFormat);
            formData.append('quality', exportQuality);

            const [width, height] = aspectRatio === '9:16' ? [720, 1280] :
                aspectRatio === '16:9' ? [1280, 720] : [1080, 1080];
            formData.append('width', width.toString());
            formData.append('height', height.toString());

            const res = await fetch(`${API_URL}/process/clip/video`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to start processing');

            const { jobId } = await res.json();

            // Poll for completion
            let complete = false;
            while (!complete) {
                await new Promise(r => setTimeout(r, 1000));
                const statusRes = await fetch(`${API_URL}/process/jobs/${jobId}`);
                const job = await statusRes.json();

                setProcessingProgress(job.progress || 0);

                if (job.status === 'completed') {
                    setProcessedFile(job.result);
                    complete = true;
                } else if (job.status === 'failed') {
                    throw new Error(job.error || 'Processing failed');
                }
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const clipDuration = clipEnd - clipStart;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
                <p className="text-xl mb-4">Video not found</p>
                <Link href="/" className="text-pink-500 hover:text-pink-400">
                    ← Back to Feed
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-400 hover:text-white">
                            ← Back
                        </Link>
                        <div className="h-6 w-px bg-gray-700" />
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <span className="text-pink-500">✂️</span>
                            PodStream Remix
                        </h1>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isProcessing}
                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg font-bold hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                {processingProgress}%
                            </>
                        ) : (
                            <>🚀 Export Clip</>
                        )}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Preview */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Video container with aspect ratio */}
                        <div className="bg-black rounded-xl overflow-hidden relative"
                            style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
                            <video
                                ref={videoRef}
                                src={video.videoUrl}
                                poster={video.thumbnailUrl}
                                className="w-full h-full object-contain"
                                loop
                                playsInline
                            />

                            {/* Text overlay preview */}
                            {showTextOverlay && overlayText && (
                                <div
                                    className={`absolute left-0 right-0 px-4 py-2 text-center ${textPosition === 'top' ? 'top-4' :
                                        textPosition === 'center' ? 'top-1/2 -translate-y-1/2' : 'bottom-16'
                                        }`}
                                    style={{
                                        color: textColor,
                                        fontSize: textSize === 'small' ? '16px' : textSize === 'medium' ? '24px' : '32px',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                    }}
                                >
                                    {overlayText}
                                </div>
                            )}

                            {/* Play button overlay */}
                            {!isPlaying && (
                                <button
                                    onClick={handlePlayPause}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="bg-gray-800 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">
                                    Clip: {formatTime(clipDuration)} / Max {MAX_CLIP_DURATION}s
                                </span>
                                <div className="flex gap-2">
                                    {[15, 30, 45, 60].map(sec => (
                                        <button
                                            key={sec}
                                            onClick={() => setClipEnd(Math.min(clipStart + sec, duration))}
                                            className={`px-3 py-1 text-xs rounded ${Math.round(clipDuration) === sec
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-700 hover:bg-gray-600'
                                                }`}
                                        >
                                            {sec}s
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Timeline bar */}
                            <div
                                ref={timelineRef}
                                className="relative h-16 bg-gray-700 rounded-lg cursor-pointer overflow-hidden"
                                onClick={handleTimelineClick}
                            >
                                {/* Video thumbnails strip (placeholder) */}
                                <div className="absolute inset-0 flex">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 bg-gray-600 border-r border-gray-700"
                                            style={{
                                                backgroundImage: `url(${video.thumbnailUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: `${i * 10}% center`,
                                                opacity: 0.5,
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Selection area */}
                                <div
                                    className="absolute top-0 bottom-0 bg-pink-500/30 border-2 border-pink-500"
                                    style={{
                                        left: `${(clipStart / duration) * 100}%`,
                                        width: `${((clipEnd - clipStart) / duration) * 100}%`,
                                    }}
                                >
                                    {/* Start handle */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-3 bg-pink-500 cursor-ew-resize"
                                        onMouseDown={() => setIsDragging('start')}
                                    />
                                    {/* End handle */}
                                    <div
                                        className="absolute right-0 top-0 bottom-0 w-3 bg-pink-500 cursor-ew-resize"
                                        onMouseDown={() => setIsDragging('end')}
                                    />
                                </div>

                                {/* Playhead */}
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                                    style={{ left: `${(currentTime / duration) * 100}%` }}
                                />
                            </div>

                            {/* Time labels */}
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span>{formatTime(0)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Playback controls */}
                        <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-center gap-4">
                            <button
                                onClick={() => {
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = Math.max(clipStart, currentTime - 5);
                                    }
                                }}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                ⏪ -5s
                            </button>

                            <button
                                onClick={handlePlayPause}
                                className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-105 transition"
                            >
                                {isPlaying ? '⏸️' : '▶️'}
                            </button>

                            <button
                                onClick={() => {
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = Math.min(clipEnd, currentTime + 5);
                                    }
                                }}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                +5s ⏩
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="space-y-4">
                        {/* Clip Details */}
                        <div className="bg-gray-800 rounded-xl p-4">
                            <h3 className="font-semibold mb-3">Clip Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={clipTitle}
                                        onChange={(e) => setClipTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                                    <textarea
                                        value={clipDescription}
                                        onChange={(e) => setClipDescription(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Speed & Volume */}
                        <div className="bg-gray-800 rounded-xl p-4">
                            <h3 className="font-semibold mb-3">Playback</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Speed: {playbackSpeed}x</label>
                                    <div className="flex gap-2">
                                        {[0.5, 1, 1.5, 2].map(speed => (
                                            <button
                                                key={speed}
                                                onClick={() => setPlaybackSpeed(speed)}
                                                className={`flex-1 py-1 text-sm rounded ${playbackSpeed === speed ? 'bg-pink-500' : 'bg-gray-700 hover:bg-gray-600'
                                                    }`}
                                            >
                                                {speed}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Volume: {Math.round(volume * 100)}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={volume}
                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                        className="w-full accent-pink-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visual Effects */}
                        <div className="bg-gray-800 rounded-xl p-4">
                            <h3 className="font-semibold mb-3">Visual Effects</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-gray-400">Brightness: {brightness}%</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="150"
                                        value={brightness}
                                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                                        className="w-full accent-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Contrast: {contrast}%</label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="150"
                                        value={contrast}
                                        onChange={(e) => setContrast(parseInt(e.target.value))}
                                        className="w-full accent-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Saturation: {saturation}%</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="200"
                                        value={saturation}
                                        onChange={(e) => setSaturation(parseInt(e.target.value))}
                                        className="w-full accent-pink-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Text Overlay */}
                        <div className="bg-gray-800 rounded-xl p-4">
                            <label className="flex items-center justify-between mb-3">
                                <span className="font-semibold">Text Overlay</span>
                                <input
                                    type="checkbox"
                                    checked={showTextOverlay}
                                    onChange={(e) => setShowTextOverlay(e.target.checked)}
                                    className="w-5 h-5 rounded accent-pink-500"
                                />
                            </label>
                            {showTextOverlay && (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={overlayText}
                                        onChange={(e) => setOverlayText(e.target.value)}
                                        placeholder="Enter text..."
                                        className="w-full px-3 py-2 bg-gray-700 rounded-lg outline-none"
                                    />
                                    <div className="flex gap-2">
                                        {['top', 'center', 'bottom'].map(pos => (
                                            <button
                                                key={pos}
                                                onClick={() => setTextPosition(pos)}
                                                className={`flex-1 py-1 text-xs rounded capitalize ${textPosition === pos ? 'bg-pink-500' : 'bg-gray-700'
                                                    }`}
                                            >
                                                {pos}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Export Settings */}
                        <div className="bg-gray-800 rounded-xl p-4">
                            <h3 className="font-semibold mb-3">Export Settings</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Aspect Ratio</label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: '9:16', label: 'TikTok' },
                                            { value: '16:9', label: 'YouTube' },
                                            { value: '1:1', label: 'Square' },
                                        ].map(ar => (
                                            <button
                                                key={ar.value}
                                                onClick={() => setAspectRatio(ar.value)}
                                                className={`flex-1 py-2 text-xs rounded ${aspectRatio === ar.value ? 'bg-pink-500' : 'bg-gray-700 hover:bg-gray-600'
                                                    }`}
                                            >
                                                {ar.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Quality</label>
                                    <div className="flex gap-2">
                                        {['low', 'medium', 'high'].map(q => (
                                            <button
                                                key={q}
                                                onClick={() => setExportQuality(q)}
                                                className={`flex-1 py-2 text-xs rounded capitalize ${exportQuality === q ? 'bg-pink-500' : 'bg-gray-700 hover:bg-gray-600'
                                                    }`}
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Download */}
                        {processedFile && (
                            <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-4">
                                <p className="text-green-400 font-medium mb-2">✅ Export Complete!</p>
                                <a
                                    href={`${API_URL}/process/download/${processedFile.filename}`}
                                    download
                                    className="inline-flex items-center gap-2 text-green-400 hover:text-green-300"
                                >
                                    📥 Download {processedFile.filename}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
