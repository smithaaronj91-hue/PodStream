# Setup and Installation Guide

## Prerequisites

Before starting, make sure you have:
- Docker & Docker Compose (recommended)
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)
- Git

## Option 1: Docker Setup (Recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/smithaaronj91-hue/PodStream.git
cd PodStream
```

### Step 2: Start with Docker Compose

```bash
docker-compose up --build
```

This will:
- Create a PostgreSQL database
- Start the backend API on port 5000
- Start the frontend on port 3000
- Initialize the database schema
- Seed default categories

### Step 3: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Database:** localhost:5432

## Option 2: Local Development Setup

### Backend Setup

#### 1. Install Dependencies

```bash
cd backend
npm install
```

#### 2. Configure Environment

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://podstream_user:podstream_password@localhost:5432/podstream
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

#### 3. Set Up Database

```bash
# Create database
createdb podstream

# Run migrations
npm run migrate

# Seed initial data (categories)
npm run seed
```

#### 4. Start Backend Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### Frontend Setup

#### 1. Install Dependencies

```bash
cd frontend
npm install
```

#### 2. Configure Environment

Create `.env.local` from template:

```bash
cp .env.local.example .env.local
```

Content:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### 3. Start Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Database Setup (Local)

### PostgreSQL Installation

#### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

#### Windows
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Create Database User and Database

```bash
createuser -P podstream_user
# Enter password: podstream_password (or your preferred password)

createdb -O podstream_user podstream
```

### Verify Connection

```bash
psql -U podstream_user -d podstream -h localhost
```

## Verify Installation

### Check Backend

```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Check Categories API

```bash
curl http://localhost:5000/api/categories
```

Should return an array of categories.

## Troubleshooting

### Docker Issues

#### Container won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Restart services
docker-compose restart
```

#### Port already in use
```bash
# Find process using port
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # Database

# Kill process
kill -9 <PID>
```

### Database Connection Issues

#### Cannot connect to PostgreSQL

1. Check PostgreSQL is running:
```bash
# macOS
brew services list | grep postgresql

# Linux
sudo service postgresql status
```

2. Check credentials in `.env`
3. Verify database exists:
```bash
psql -U podstream_user -l
```

#### Port 5432 already in use
```bash
# Find process
lsof -i :5432

# Stop PostgreSQL
sudo service postgresql stop  # Linux
brew services stop postgresql@15  # macOS
```

### Frontend Issues

#### Port 3000 in use
```bash
lsof -i :3000
kill -9 <PID>
```

#### Dependencies not installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

#### Migrations not running
```bash
# Check database connection
psql $DATABASE_URL

# Run migrations manually
node src/db/migrations.js
```

#### Port 5000 in use
```bash
lsof -i :5000
kill -9 <PID>
```

## Next Steps

1. **Create Admin Account**: Navigate to `/api/auth/register` to create your first account
2. **Add Podcasts**: Use the creator dashboard to add podcasts
3. **Configure Stripe** (Optional): Add your Stripe keys to enable premium subscriptions
4. **Deploy**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## Development Tips

### Enable Hot Reload

Both frontend and backend support hot reloading:
- **Backend**: Changes to files automatically restart the server
- **Frontend**: Changes to files automatically refresh in browser

### Database Debugging

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Describe table
\d podcasts

# Run query
SELECT * FROM categories;
```

### API Testing

Use [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) to test API endpoints.

### Browser DevTools

- Open Developer Tools: F12
- Check Network tab for API calls
- Check Console for errors
- Use Redux DevTools for state inspection

## Performance Tips

- Use pagination for large datasets
- Implement caching for categories
- Optimize images before upload
- Monitor database query performance

## Security Notes

- Change all default passwords
- Use strong JWT secrets
- Enable HTTPS in production
- Set proper CORS origins
- Use environment variables for secrets

## Need Help?

- Check the [API Documentation](./API.md)
- Review [Database Schema](./DATABASE.md)
- See [Deployment Guide](./DEPLOYMENT.md)
- Check GitHub Issues for similar problems
