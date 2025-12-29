# PodStream Project Structure

## Complete Directory Layout

```
PodStream/
├── 📁 frontend/                           # Next.js React Application
│   ├── 📁 pages/
│   │   ├── 📄 _app.js                    # App wrapper and global setup
│   │   ├── 📄 _document.html             # HTML document template
│   │   ├── 📄 index.js                   # Home page with category browser
│   │   ├── 📁 category/
│   │   │   └── 📄 [slug].js              # Dynamic category page
│   │   ├── 📁 podcast/
│   │   │   └── 📄 [id].js                # Dynamic podcast detail page
│   │   └── 📄 premium.js                 # Premium subscription page
│   ├── 📁 components/
│   │   ├── 📄 CategoryBrowser.jsx        # Category selection component
│   │   └── 📄 PodcastCard.jsx            # Reusable podcast card
│   ├── 📁 lib/
│   │   └── 📄 store.js                   # Zustand state management
│   ├── 📁 styles/
│   │   └── 📄 globals.css                # Global Tailwind styles
│   ├── 📁 public/                        # Static assets
│   ├── 📄 package.json                   # Dependencies
│   ├── 📄 next.config.js                 # Next.js configuration
│   ├── 📄 tailwind.config.js             # Tailwind configuration
│   ├── 📄 Dockerfile                     # Docker build configuration
│   └── 📄 .env.local.example             # Environment template
│
├── 📁 backend/                            # Node.js Express API
│   ├── 📁 src/
│   │   ├── 📄 index.js                   # Express server entry point
│   │   ├── 📁 routes/
│   │   │   ├── 📄 categories.js          # Category API endpoints ⭐
│   │   │   ├── 📄 podcasts.js            # Podcast API endpoints
│   │   │   ├── 📄 auth.js                # Authentication endpoints
│   │   │   ├── 📄 users.js               # User endpoints
│   │   │   └── 📄 subscriptions.js       # Premium subscription endpoints
│   │   ├── 📁 db/
│   │   │   ├── 📄 connection.js          # PostgreSQL connection
│   │   │   ├── 📄 schema.sql             # Database schema
│   │   │   └── 📄 seed.js                # Database seed data
│   │   └── 📁 middleware/                # Custom middleware (future)
│   ├── 📄 package.json                   # Dependencies
│   ├── 📄 Dockerfile                     # Docker build configuration
│   └── 📄 .env.example                   # Environment template
│
├── 📁 docs/                               # Documentation
│   ├── 📄 README.md                      # Feature overview (this file)
│   ├── 📄 SETUP.md                       # Setup and installation guide
│   ├── 📄 API.md                         # API endpoint reference
│   ├── 📄 DATABASE.md                    # Database schema documentation
│   └── 📄 CATEGORY_EXAMPLES.md           # Category browsing examples
│
├── 📁 .git/                              # Git configuration
├── 📄 README.md                          # Main project README
├── 📄 QUICKSTART.md                      # Quick start guide
├── 📄 ROADMAP.md                         # Feature roadmap
├── 📄 CONTRIBUTING.md                    # Contributing guidelines
├── 📄 docker-compose.yml                 # Docker Compose configuration
├── 📄 start.sh                           # Quick start script
└── 📄 .gitignore                         # Git ignore rules
```

## Key Files Explained

### Frontend Files

#### `pages/index.js`
Home page with:
- Category browser with color-coded buttons
- Podcast grid with sorting options
- Premium section call-to-action
- Real-time filtering and pagination

#### `pages/category/[slug].js`
Dynamic category detail page:
- Category-specific podcast listings
- Sort by latest, popular, trending
- Pagination support
- Responsive grid layout

#### `pages/podcast/[id].js`
Podcast detail page:
- Full podcast information
- Episode list with metadata
- Audio player controls
- Creator information

#### `components/PodcastCard.jsx`
Reusable card component:
- Podcast cover image
- Title and creator
- Episode count and rating
- Premium badge (if applicable)

#### `lib/store.js`
Zustand state management:
- API calls (fetchCategories, fetchPodcastsByCategory, etc.)
- User authentication
- Favorites management
- Subscription handling

### Backend Files

#### `src/index.js`
Express server setup:
- CORS configuration
- Middleware setup
- Route registration
- Error handling

#### `src/routes/categories.js` ⭐
Category API endpoints:
- GET /categories - Get all categories
- GET /categories/:slug - Get category details
- GET /categories/:slug/podcasts - Get podcasts with sorting

#### `src/routes/podcasts.js`
Podcast API endpoints:
- GET /podcasts - List all podcasts with filters
- GET /podcasts/:id - Get podcast details with episodes
- GET /podcasts/:podcastId/episodes/:episodeId - Episode details

#### `src/routes/auth.js`
Authentication endpoints:
- POST /auth/register - User registration
- POST /auth/login - User login
- POST /auth/verify - Token verification

#### `src/routes/users.js`
User operations:
- GET /users/profile - User profile
- POST/DELETE /users/subscribe/:podcastId - Manage subscriptions
- POST/GET /users/favorites/:episodeId - Manage favorites

#### `src/routes/subscriptions.js`
Premium features:
- GET /subscriptions/plans - Available plans
- POST /subscriptions/create-subscription - Create subscription

#### `src/db/schema.sql`
Complete database schema:
- 9 tables with relationships
- Indexes for performance
- Constraints for data integrity

#### `src/db/seed.js`
Database initialization:
- 10 default categories
- Sample data setup
- Migration helper

### Configuration Files

#### `docker-compose.yml`
Multi-container setup:
- PostgreSQL database
- Express backend
- Next.js frontend
- Volume management
- Health checks

#### `next.config.js`
Next.js configuration:
- Image optimization
- Environment variables
- API routes

#### `tailwind.config.js`
Tailwind CSS setup:
- Theme customization
- Color scheme
- Custom components

### Documentation Files

#### `SETUP.md`
Complete setup guide for:
- Docker installation
- Local development
- Database setup
- Troubleshooting

#### `API.md`
Full API documentation:
- All endpoints with examples
- Request/response formats
- Authentication
- Error codes

#### `DATABASE.md`
Database schema details:
- Table descriptions
- Relationships
- Indexes
- Useful queries

#### `CATEGORY_EXAMPLES.md`
Category browsing examples:
- Curl examples
- Frontend integration
- Complete implementations

## File Statistics

| Component | Files | Lines of Code |
|-----------|-------|----------------|
| Frontend | 10+ | 1500+ |
| Backend | 7+ | 1000+ |
| Database | 2 | 300+ |
| Documentation | 6 | 2000+ |
| **Total** | **25+** | **4800+** |

## Technology Distribution

- **JavaScript/Node.js**: ~45%
- **React/JSX**: ~35%
- **SQL/PostgreSQL**: ~10%
- **CSS/Tailwind**: ~10%

## Key Features by File

### Category Browsing Feature ⭐
- **Frontend**: `pages/index.js`, `pages/category/[slug].js`, `components/CategoryBrowser.jsx`
- **Backend**: `src/routes/categories.js`
- **Database**: `categories` table in `src/db/schema.sql`
- **Documentation**: `docs/CATEGORY_EXAMPLES.md`

### Authentication
- **Frontend**: `lib/store.js` (auth methods)
- **Backend**: `src/routes/auth.js`
- **Database**: `users` table

### Podcast Discovery
- **Frontend**: `pages/index.js`, `pages/podcast/[id].js`
- **Backend**: `src/routes/podcasts.js`
- **Database**: `podcasts`, `episodes` tables

### User Features
- **Frontend**: `lib/store.js` (user methods)
- **Backend**: `src/routes/users.js`
- **Database**: `subscriptions`, `favorites`, `listen_history` tables

## Development Workflow

1. **Frontend**: Modify `pages/` or `components/`, hot reload on save
2. **Backend**: Modify `src/routes/`, nodemon restarts server
3. **Database**: Update schema in `schema.sql`, run migrations
4. **Tests**: Create test files alongside source files

## Build Artifacts

After building:
```
frontend/.next/          # Next.js build output
backend/node_modules/    # Dependencies
postgres_data/           # Database files (Docker)
uploads/                 # User-uploaded files
```

## Deployment Files

- `Dockerfile` (backend & frontend) - Container definitions
- `docker-compose.yml` - Production-like setup
- `start.sh` - Quick start script

---

**Total Project Size**: ~500KB (excluding node_modules and build outputs)

For more details, see:
- [SETUP.md](docs/SETUP.md) - Installation and setup
- [API.md](docs/API.md) - API reference
- [DATABASE.md](docs/DATABASE.md) - Database design
