# PodStream - Premium Podcast Platform

A modern, full-stack podcast discovery and streaming platform with a TikTok-like experience. Browse, discover, and stream podcasts by category with premium features.

## 🎯 Key Features

### Browse & Discover by Category ⭐ (Now Available!)
- **10+ Podcast Categories**: Technology, Business, Comedy, Sports, News, Education, Music, Self-Help, Fiction, History
- **Smart Filtering**: Filter podcasts by category with intuitive category browser
- **Multiple Sort Options**: Latest, Most Popular, Trending
- **Visual Category Cards**: Color-coded categories with emojis for easy navigation
- **Responsive Design**: Works on desktop, tablet, and mobile

### Core Features
- 🔐 **User Authentication**: Register, login, and profile management with JWT
- 🎙️ **Podcast Management**: Create, upload, and manage podcasts
- 📻 **Episode Streaming**: High-quality audio streaming with playback controls
- ⭐ **Premium Subscriptions**: Monthly and annual plans with exclusive content
- 💾 **Offline Downloads**: Download episodes for offline listening (Premium)
- ❤️ **Favorites & Collections**: Save and organize favorite episodes
- 📊 **User Dashboard**: Track listening history and recommendations
- 🎤 **Voice Cloning**: AI-powered voice cloning for text-to-speech synthesis ⭐ NEW!

### Voice Cloning Features ⭐ NEW!
- 🎵 **Voice Sample Upload**: Upload audio samples (WAV, MP3, FLAC) for cloning
- 🤖 **AI Voice Cloning**: Create realistic voice models using Coqui TTS
- 💬 **Text-to-Speech**: Generate speech in cloned voices
- 📚 **Voice Library**: Manage multiple voice models per user
- 🌍 **Multi-language Support**: Synthesize speech in 15+ languages
- 🔒 **Secure Storage**: Voice samples and models stored securely

### Premium Features
- Ad-free listening
- Unlimited downloads
- Offline playback
- Early access to new episodes
- Exclusive premium-only content
- Direct support for creators

## 🚀 Quick Start

### Service Ports
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **TTS Service**: http://localhost:5002
- **PostgreSQL**: localhost:5432

### Running with Docker
```bash
docker-compose up
```

### Voice Cloning Setup
For detailed voice cloning setup instructions, see:
- [Voice Cloning Quick Start Guide](VOICE_CLONING_QUICKSTART.md)
- [Voice Cloning API Documentation](docs/VOICE_CLONING.md)

The TTS service runs on **port 5002** and provides voice cloning capabilities through the Python Coqui TTS engine.
