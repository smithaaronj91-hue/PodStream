/**
 * Video Podcast Feed Service
 * Provides demo video content for TikTok-style video feed
 */

// Sample video clips for the TikTok-style feed
const SAMPLE_VIDEO_CLIPS = [
    {
        id: 'clip-1',
        title: 'The Power of Vulnerability',
        creator: 'TED Talks',
        creatorAvatar: 'https://pi.tedcdn.com/r/pb-assets.tedcdn.com/system/baubles/files/000/009/587/original/TEDTalks_logo_white.png',
        videoUrl: 'https://download.ted.com/talks/BreneBrown_2010X-480p.mp4',
        thumbnailUrl: 'https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/72bda89f-9bbf-4685-910a-2f151c4f3a8a/BreneBrown_2019S-embed.jpg',
        duration: 1212,
        views: 65000000,
        likes: 2100000,
        category: 'Personal Growth',
        isVerified: true,
        followerCount: 25400000,
    },
    {
        id: 'clip-2',
        title: 'How to Speak So People Want to Listen',
        creator: 'TED Talks',
        creatorAvatar: 'https://pi.tedcdn.com/r/pb-assets.tedcdn.com/system/baubles/files/000/009/587/original/TEDTalks_logo_white.png',
        videoUrl: 'https://download.ted.com/talks/JulianTreasure_2013G-480p.mp4',
        thumbnailUrl: 'https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/08b5bb55-6c20-4168-ae3d-e3c7e6e3be76/JulianTreasure_2013G-embed.jpg',
        duration: 598,
        views: 42000000,
        likes: 1800000,
        category: 'Communication',
        isVerified: true,
        followerCount: 25400000,
    },
    {
        id: 'clip-3',
        title: 'The Surprising Science of Happiness',
        creator: 'TED Talks',
        creatorAvatar: 'https://pi.tedcdn.com/r/pb-assets.tedcdn.com/system/baubles/files/000/009/587/original/TEDTalks_logo_white.png',
        videoUrl: 'https://download.ted.com/talks/DanGilbert_2004-480p.mp4',
        thumbnailUrl: 'https://pi.tedcdn.com/r/talkstar-photos.s3.amazonaws.com/uploads/a1fc8e98-fc87-4b2d-8d42-8a3f5e5f6e3e/DanGilbert_2004-embed.jpg',
        duration: 1284,
        views: 23000000,
        likes: 950000,
        category: 'Psychology',
        isVerified: true,
        followerCount: 25400000,
    },
];

// Generate demo video feed with variety
function generateDemoFeed(count = 20) {
    const creators = [
        { name: 'TechVerse', avatar: '🎬', verified: true, followers: 2500000 },
        { name: 'ScienceNow', avatar: '🔬', verified: true, followers: 1800000 },
        { name: 'MindfulMinutes', avatar: '🧘', verified: false, followers: 450000 },
        { name: 'CodeWithMe', avatar: '💻', verified: true, followers: 3200000 },
        { name: 'HistoryBytes', avatar: '📜', verified: false, followers: 890000 },
        { name: 'FitnessFusion', avatar: '💪', verified: true, followers: 4100000 },
        { name: 'ArtDaily', avatar: '🎨', verified: false, followers: 320000 },
        { name: 'SpaceExplorer', avatar: '🚀', verified: true, followers: 5600000 },
        { name: 'CookingMaster', avatar: '👨‍🍳', verified: true, followers: 2900000 },
        { name: 'MusicMakers', avatar: '🎵', verified: false, followers: 1200000 },
    ];

    const titles = [
        'You Won\'t Believe What Happened Next!',
        '5 Things They Don\'t Want You to Know',
        'This Changed My Life Forever',
        'The Truth About [Topic]',
        'Why Everyone is Talking About This',
        'I Tried This for 30 Days - Results',
        'The Secret Behind Success',
        'What No One Tells You About...',
        'How I Made $10K in One Week',
        'This Hack Will Save You Hours',
        'Breaking Down the Latest Tech',
        'The Science of Happiness',
        'Ancient Wisdom for Modern Life',
        'Transform Your Morning Routine',
        'Why Sleep is Your Superpower',
    ];

    const categories = ['Tech', 'Science', 'Lifestyle', 'Education', 'Entertainment', 'Health', 'Business'];

    // Use sample videos from free sources
    const sampleVideos = [
        'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    ];

    const thumbnails = [
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    ];

    const feed = [];

    for (let i = 0; i < count; i++) {
        const creator = creators[i % creators.length];
        const videoIndex = i % sampleVideos.length;

        feed.push({
            id: `video-${i + 1}`,
            title: titles[i % titles.length],
            description: `An amazing video that will blow your mind! Watch till the end for a surprise. #viral #foryou #${categories[i % categories.length].toLowerCase()}`,
            creator: creator.name,
            creatorAvatar: creator.avatar,
            isVerified: creator.verified,
            followerCount: creator.followers,
            videoUrl: sampleVideos[videoIndex],
            thumbnailUrl: thumbnails[videoIndex],
            duration: 30 + Math.floor(Math.random() * 90), // 30-120 seconds
            views: Math.floor(Math.random() * 10000000) + 10000,
            likes: Math.floor(Math.random() * 500000) + 1000,
            comments: Math.floor(Math.random() * 50000) + 100,
            shares: Math.floor(Math.random() * 10000) + 50,
            category: categories[i % categories.length],
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            hashtags: ['foryou', 'viral', categories[i % categories.length].toLowerCase()],
            soundName: `Original Sound - ${creator.name}`,
            isOriginalSound: Math.random() > 0.3,
        });
    }

    return feed;
}

// Fetch video podcasts from RSS
export async function fetchVideoPodcast(source) {
    try {
        const feed = await parser.parseURL(source.feedUrl);

        return feed.items.slice(0, 10).map((item, index) => ({
            id: `${source.id}-${index}`,
            title: item.title,
            description: item.contentSnippet || item.content || '',
            creator: source.author,
            creatorAvatar: source.artwork,
            isVerified: true,
            followerCount: Math.floor(Math.random() * 5000000) + 100000,
            videoUrl: item.enclosure?.url || item.mediaContent?.['$']?.url || null,
            thumbnailUrl: item.itunesImage?.href || item.mediaThumbnail?.['$']?.url || source.artwork,
            duration: parseDuration(item.duration),
            views: Math.floor(Math.random() * 1000000) + 10000,
            likes: Math.floor(Math.random() * 50000) + 1000,
            comments: Math.floor(Math.random() * 5000) + 100,
            shares: Math.floor(Math.random() * 1000) + 50,
            category: source.category,
            createdAt: item.pubDate || new Date().toISOString(),
            podcastId: source.id,
            podcastTitle: source.title,
        }));
    } catch (error) {
        console.error(`Error fetching ${source.title}:`, error.message);
        return [];
    }
}

function parseDuration(duration) {
    if (!duration) return 60;
    if (typeof duration === 'number') return duration;

    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return parseInt(duration) || 60;
}

// Get trending videos
export async function getTrendingVideos(limit = 20) {
    // Return demo feed for now (real implementation would aggregate from sources)
    return generateDemoFeed(limit);
}

// Get video feed for infinite scroll
export async function getVideoFeed(page = 1, limit = 10) {
    const allVideos = generateDemoFeed(100);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
        videos: allVideos.slice(start, end),
        page,
        hasMore: end < allVideos.length,
        total: allVideos.length,
    };
}

// Search videos
export async function searchVideos(query, limit = 20) {
    const allVideos = generateDemoFeed(50);
    const lowerQuery = query.toLowerCase();

    return allVideos.filter(
        (v) =>
            v.title.toLowerCase().includes(lowerQuery) ||
            v.creator.toLowerCase().includes(lowerQuery) ||
            v.category.toLowerCase().includes(lowerQuery) ||
            v.hashtags.some((h) => h.includes(lowerQuery))
    ).slice(0, limit);
}

// Get videos by category
export async function getVideosByCategory(category, limit = 20) {
    const allVideos = generateDemoFeed(50);

    if (category === 'all') return allVideos.slice(0, limit);

    return allVideos
        .filter((v) => v.category.toLowerCase() === category.toLowerCase())
        .slice(0, limit);
}

// Get single video by ID
export async function getVideoById(videoId) {
    const allVideos = generateDemoFeed(100);
    return allVideos.find((v) => v.id === videoId) || null;
}

// Get related videos
export async function getRelatedVideos(videoId, limit = 10) {
    const video = await getVideoById(videoId);
    if (!video) return [];

    const allVideos = generateDemoFeed(50);
    return allVideos
        .filter((v) => v.id !== videoId && v.category === video.category)
        .slice(0, limit);
}

// Get creator's videos
export async function getCreatorVideos(creatorName, limit = 20) {
    const allVideos = generateDemoFeed(100);
    return allVideos.filter((v) => v.creator === creatorName).slice(0, limit);
}

export default {
    getTrendingVideos,
    getVideoFeed,
    searchVideos,
    getVideosByCategory,
    getVideoById,
    getRelatedVideos,
    getCreatorVideos,
};
