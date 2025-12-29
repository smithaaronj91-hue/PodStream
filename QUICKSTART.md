# PodStream

A premium podcast platform with category browsing, streaming, and premium subscriptions.

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and navigate
git clone https://github.com/smithaaronj91-hue/PodStream.git
cd PodStream

# Make start script executable
chmod +x start.sh

# Start the application
./start.sh
```

Then open your browser:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000/api

### Option 2: Manual Setup

See [docs/SETUP.md](docs/SETUP.md) for detailed local development instructions.

## ✨ Features Implemented

### ✅ Browse & Discover by Category
- **Category Browser**: 10 podcast categories (Technology, Business, Comedy, Sports, News, Education, Music, Self-Help, Fiction, History)
- **Smart Filtering**: Filter podcasts by category with visual category cards
- **Sorting Options**: Latest, Most Popular, Trending
- **Responsive UI**: Works on all devices
- **Color-Coded Categories**: Visual distinction with hex colors and emojis

### Additional Features
- User authentication (JWT)
- Podcast browsing and discovery
- Episode streaming
- User subscriptions to podcasts
- Favorites and collections
- Premium subscription plans
- Listen history tracking

## 📁 Project Structure

```
PodStream/
├── frontend/              # Next.js React application
│   ├── pages/            # Route pages (home, category, podcast, premium)
│   ├── components/       # Reusable components (CategoryBrowser, PodcastCard)
│   ├── lib/              # State management (Zustand store)
│   ├── styles/           # Tailwind CSS styling
│   └── public/           # Static assets
│
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── routes/       # API endpoints for categories, podcasts, auth, users, subscriptions
│   │   ├── db/           # Database connection, schema, seed data
│   │   └── index.js      # Express server
│   └── package.json
│
├── docker-compose.yml    # Docker orchestration
├── docs/                 # Documentation
│   ├── API.md           # API endpoint documentation
│   ├── SETUP.md         # Setup and installation guide
│   └── DATABASE.md      # Database schema documentation
├── start.sh             # Quick start script
└── README.md            # This file
```

## 🌐 API Endpoints

### Categories (NEW!)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category details
- `GET /api/categories/:slug/podcasts` - Get podcasts by category (with sorting)

### Podcasts
- `GET /api/podcasts` - Get all podcasts with filters
- `GET /api/podcasts/:id` - Get podcast details with episodes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `POST /api/users/subscribe/:podcastId` - Subscribe to podcast
- `DELETE /api/users/subscribe/:podcastId` - Unsubscribe from podcast
- `POST /api/users/favorites/:episodeId` - Add episode to favorites
- `GET /api/users/favorites` - Get favorite episodes

### Premium
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions/create-subscription` - Create subscription

**Full API documentation:** [docs/API.md](docs/API.md)

## 🗄️ Database

PostgreSQL database with schema for:
- Users and authentication
- Categories (10 pre-seeded)
- Podcasts and episodes
- User subscriptions
- Favorites and ratings
- Listen history
- Premium subscriptions

**Schema documentation:** [docs/DATABASE.md](docs/DATABASE.md)

## 🎨 Frontend Pages

### Public Pages
- `/` - Home page with category browser and podcast discovery
- `/category/[slug]` - Browse podcasts by category
- `/podcast/[id]` - View podcast details and episodes
- `/premium` - Premium subscription page

### Features
- Category-based podcast browsing
- Sort podcasts by latest, popular, or trending
- View podcast details and episodes
- Responsive design with Tailwind CSS
- Zustand for state management

## 🔧 Tech Stack

**Frontend:**
- Next.js 13+ (React framework)
- Tailwind CSS (styling)
- Zustand (state management)
- Axios (HTTP client)

**Backend:**
- Node.js & Express (API server)
- PostgreSQL (database)
- JWT (authentication)
- Bcryptjs (password hashing)

**DevOps:**
- Docker & Docker Compose
- Environment-based configuration

## 📚 Documentation

- **[Setup & Installation](docs/SETUP.md)** - Detailed setup instructions for local and Docker development
- **[API Reference](docs/API.md)** - Complete API endpoint documentation with examples
- **[Database Schema](docs/DATABASE.md)** - Database design, relationships, and useful queries

## 🔐 Security Features

- JWT authentication
- Hashed passwords (bcryptjs)
- CORS protection
- Environment variable configuration
- SQL injection prevention (parameterized queries)

## 📊 Performance

- Paginated podcast listings
- Database indexes on frequently queried fields
- Optimized category lookups
- Efficient podcast filtering

## 🚢 Deployment

See [docs/SETUP.md](docs/SETUP.md#deployment) for production deployment instructions.

## 🛠️ Development

### Running Tests
```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend already optimized for production
```

## 📝 Environment Variables

### Backend
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/podstream
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### Services won't start
```bash
# Check Docker logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Database connection errors
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `psql $DATABASE_URL`

### Port conflicts
```bash
# Kill process using port
lsof -i :3000   # Frontend
lsof -i :5000   # Backend
lsof -i :5432   # Database
kill -9 <PID>
```

**More troubleshooting:** [docs/SETUP.md](docs/SETUP.md#troubleshooting)

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand State Management](https://github.com/pmndrs/zustand)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with Docker
4. Submit a pull request

## 📄 License

MIT

## 🎙️ Next Features Planned

- User profiles and discovery
- Advanced podcast search
- Community reviews and ratings
- Podcast recommendations
- Creator analytics dashboard
- Multiple language support
- Mobile app (React Native)
- Live podcast streaming
- Podcast episodes with timestamps
- User messaging/community features

---

**Happy Streaming! 🎙️**

For questions or issues, please open a GitHub issue.
