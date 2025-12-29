import React, { useState } from 'react';

export default function ShareModal({ isOpen, onClose, episode, podcast }) {
    const [copied, setCopied] = useState(false);
    const [shareType, setShareType] = useState('episode'); // 'episode' or 'timestamp'
    const [timestamp, setTimestamp] = useState(0);

    if (!isOpen) return null;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const episodeUrl = `${baseUrl}/episode/${episode?.id}?podcastId=${podcast?.id || episode?.podcast_id}`;
    const timestampUrl = `${episodeUrl}&t=${timestamp}`;
    const shareUrl = shareType === 'timestamp' ? timestampUrl : episodeUrl;

    const shareText = `Check out "${episode?.title}" on PodStream! 🎙️`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: episode?.title,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        }
    };

    const socialLinks = [
        {
            name: 'Twitter',
            icon: '𝕏',
            color: 'bg-black',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'Facebook',
            icon: 'f',
            color: 'bg-blue-600',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'LinkedIn',
            icon: 'in',
            color: 'bg-blue-700',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        },
        {
            name: 'WhatsApp',
            icon: '💬',
            color: 'bg-green-500',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
        },
        {
            name: 'Telegram',
            icon: '✈️',
            color: 'bg-blue-500',
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
        },
        {
            name: 'Reddit',
            icon: '🔴',
            color: 'bg-orange-600',
            url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(episode?.title)}`,
        },
    ];

    const formatTimestamp = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Share Episode</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Episode Preview */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
                    <img
                        src={podcast?.cover_image_url || episode?.podcast_cover || '/placeholder-podcast.png'}
                        alt={episode?.title}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{episode?.title}</p>
                        <p className="text-sm text-gray-500 truncate">{podcast?.title || episode?.podcast_title}</p>
                    </div>
                </div>

                {/* Share Type Toggle */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setShareType('episode')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${shareType === 'episode'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Full Episode
                    </button>
                    <button
                        onClick={() => setShareType('timestamp')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${shareType === 'timestamp'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        At Timestamp
                    </button>
                </div>

                {/* Timestamp Input */}
                {shareType === 'timestamp' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start at: {formatTimestamp(timestamp)}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max={episode?.duration_seconds || 3600}
                            value={timestamp}
                            onChange={(e) => setTimestamp(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                )}

                {/* Copy Link */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
                        />
                        <button
                            onClick={handleCopy}
                            className={`px-4 py-2 rounded-lg font-medium transition ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Native Share (Mobile) */}
                {typeof navigator !== 'undefined' && navigator.share && (
                    <button
                        onClick={handleNativeShare}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg mb-6 hover:opacity-90 transition"
                    >
                        📤 Share via...
                    </button>
                )}

                {/* Social Links */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Share on Social</label>
                    <div className="grid grid-cols-3 gap-3">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${social.color} text-white py-3 px-4 rounded-lg text-center font-medium hover:opacity-90 transition`}
                            >
                                <span className="text-lg">{social.icon}</span>
                                <span className="block text-xs mt-1">{social.name}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Embed Code */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={() => {
                            const embedCode = `<iframe src="${baseUrl}/embed/episode/${episode?.id}" width="100%" height="180" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
                            navigator.clipboard.writeText(embedCode);
                            alert('Embed code copied!');
                        }}
                        className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {'</>'} Copy Embed Code
                    </button>
                </div>
            </div>
        </div>
    );
}
