import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState([]);

    // Generate mock notifications
    useEffect(() => {
        const mockNotifications = [
            {
                id: 1,
                type: 'like',
                user: { name: 'TechVerse', avatar: '🎬', isVerified: true },
                content: 'liked your video',
                videoTitle: 'Amazing Tech Tips',
                videoThumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
                time: '2m ago',
                read: false,
            },
            {
                id: 2,
                type: 'follow',
                user: { name: 'ScienceNow', avatar: '🔬', isVerified: true },
                content: 'started following you',
                time: '15m ago',
                read: false,
            },
            {
                id: 3,
                type: 'comment',
                user: { name: 'LearnDaily', avatar: '📚', isVerified: false },
                content: 'commented: "This is amazing! 🔥"',
                videoTitle: 'How to Learn Fast',
                videoThumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
                time: '1h ago',
                read: false,
            },
            {
                id: 4,
                type: 'mention',
                user: { name: 'FutureTech', avatar: '🚀', isVerified: true },
                content: 'mentioned you in a comment',
                videoTitle: 'Future of AI',
                videoThumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
                time: '2h ago',
                read: true,
            },
            {
                id: 5,
                type: 'like',
                user: { name: 'LifeHacks', avatar: '✨', isVerified: false },
                content: 'and 42 others liked your video',
                videoTitle: 'Productivity Tips',
                videoThumb: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
                time: '3h ago',
                read: true,
            },
            {
                id: 6,
                type: 'system',
                content: 'Your video "Tech Review" is trending! 📈',
                time: '5h ago',
                read: true,
            },
            {
                id: 7,
                type: 'follow',
                user: { name: 'CodeMaster', avatar: '💻', isVerified: true },
                content: 'started following you',
                time: '1d ago',
                read: true,
            },
            {
                id: 8,
                type: 'milestone',
                content: 'Congratulations! You reached 10K followers! 🎉',
                time: '2d ago',
                read: true,
            },
        ];
        setNotifications(mockNotifications);
    }, []);

    const filteredNotifications = notifications.filter((n) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'likes') return n.type === 'like';
        if (activeTab === 'comments') return n.type === 'comment' || n.type === 'mention';
        if (activeTab === 'follows') return n.type === 'follow';
        return true;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'like': return '❤️';
            case 'follow': return '👤';
            case 'comment': return '💬';
            case 'mention': return '@';
            case 'system': return '📢';
            case 'milestone': return '🏆';
            default: return '🔔';
        }
    };

    const markAllRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };

    return (
        <>
            <Head>
                <title>Notifications | PodStream</title>
            </Head>

            <div className="min-h-screen bg-gray-900 text-white pb-20 md:pb-0">
                {/* Header */}
                <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
                    <div className="max-w-2xl mx-auto px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/" className="text-gray-400 hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <h1 className="text-xl font-bold">
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </h1>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-pink-500 hover:text-pink-400 text-sm font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
                            {['all', 'likes', 'comments', 'follows'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${activeTab === tab
                                            ? 'bg-pink-500 text-white'
                                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Notifications List */}
                <div className="max-w-2xl mx-auto">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-4xl mb-4">🔔</p>
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-4 flex gap-3 hover:bg-gray-800/50 transition ${!notification.read ? 'bg-pink-500/5' : ''
                                        }`}
                                >
                                    {/* Icon or Avatar */}
                                    <div className="shrink-0">
                                        {notification.user ? (
                                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl relative">
                                                {notification.user.avatar}
                                                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center text-xs">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            {notification.user && (
                                                <Link
                                                    href={`/creator/${notification.user.name}`}
                                                    className="font-semibold hover:underline"
                                                >
                                                    {notification.user.name}
                                                    {notification.user.isVerified && (
                                                        <span className="ml-1 text-blue-400">✓</span>
                                                    )}
                                                </Link>
                                            )}{' '}
                                            <span className="text-gray-400">{notification.content}</span>
                                        </p>
                                        {notification.videoTitle && (
                                            <p className="text-gray-500 text-sm mt-1 truncate">
                                                {notification.videoTitle}
                                            </p>
                                        )}
                                        <p className="text-gray-600 text-xs mt-1">{notification.time}</p>
                                    </div>

                                    {/* Video Thumbnail */}
                                    {notification.videoThumb && (
                                        <div className="shrink-0">
                                            <img
                                                src={notification.videoThumb}
                                                alt=""
                                                className="w-12 h-16 object-cover rounded"
                                            />
                                        </div>
                                    )}

                                    {/* Unread indicator */}
                                    {!notification.read && (
                                        <div className="shrink-0 self-center">
                                            <div className="w-2 h-2 bg-pink-500 rounded-full" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Navigation - Mobile */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2 safe-area-bottom">
                    <div className="flex justify-around">
                        <Link href="/" className="flex flex-col items-center gap-1 text-gray-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
                            <span className="text-xs">Home</span>
                        </Link>
                        <Link href="/discover" className="flex flex-col items-center gap-1 text-gray-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                            </svg>
                            <span className="text-xs">Discover</span>
                        </Link>
                        <Link href="/notifications" className="flex flex-col items-center gap-1 text-white relative">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 right-0 w-4 h-4 bg-pink-500 rounded-full text-[10px] flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                            <span className="text-xs">Inbox</span>
                        </Link>
                        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            <span className="text-xs">Profile</span>
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}
