# Database Schema Documentation

## Overview

PodStream uses PostgreSQL as the primary database. This document describes the complete schema, relationships, and key considerations.

## Tables

### users

User account information and profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique user identifier |
| username | VARCHAR(255) | UNIQUE, NOT NULL | User's display name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| profile_picture_url | VARCHAR(500) | | Avatar/profile picture URL |
| bio | TEXT | | User biography |
| is_creator | BOOLEAN | DEFAULT FALSE | Whether user can create podcasts |
| subscription_tier | VARCHAR(50) | DEFAULT 'free' | User's subscription level |
| created_at | TIMESTAMP | DEFAULT NOW | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update time |

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: username, email
- INDEX: email, subscription_tier

---

### categories

Podcast categories for browsing and discovery.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique category identifier |
| name | VARCHAR(100) | UNIQUE, NOT NULL | Category name |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly slug |
| description | TEXT | | Category description |
| icon_url | VARCHAR(500) | | Category icon image |
| color_hex | VARCHAR(7) | | Hex color for UI |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |

**Sample Data:**
- Technology, Business, Comedy, Sports, News, Education, Music, Self-Help, Fiction, History

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: name, slug

---

### podcasts

Main podcast information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique podcast identifier |
| creator_id | INTEGER | NOT NULL, FK(users) | Podcast creator |
| title | VARCHAR(255) | NOT NULL | Podcast title |
| description | TEXT | | Full description |
| cover_image_url | VARCHAR(500) | | Album art URL |
| category_id | INTEGER | NOT NULL, FK(categories) | Primary category |
| is_premium | BOOLEAN | DEFAULT FALSE | Premium-only flag |
| total_episodes | INTEGER | DEFAULT 0 | Episode count |
| total_listens | BIGINT | DEFAULT 0 | Total plays |
| average_rating | DECIMAL(3,2) | | Avg user rating |
| created_at | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update |

**Relationships:**
- creator_id → users.id (CASCADE DELETE)
- category_id → categories.id

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: creator_id, category_id
- INDEX: category_id, creator_id, is_premium, created_at

---

### episodes

Individual podcast episodes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique episode identifier |
| podcast_id | INTEGER | NOT NULL, FK(podcasts) | Parent podcast |
| title | VARCHAR(255) | NOT NULL | Episode title |
| description | TEXT | | Episode description |
| audio_url | VARCHAR(500) | NOT NULL | Audio file URL |
| duration_seconds | INTEGER | | Episode length in seconds |
| episode_number | INTEGER | | Episode number in series |
| season_number | INTEGER | DEFAULT 1 | Season number |
| is_premium | BOOLEAN | DEFAULT FALSE | Premium-only flag |
| view_count | BIGINT | DEFAULT 0 | Play count |
| created_at | TIMESTAMP | DEFAULT NOW | Release date |
| updated_at | TIMESTAMP | DEFAULT NOW | Last update |

**Relationships:**
- podcast_id → podcasts.id (CASCADE DELETE)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: podcast_id
- INDEX: podcast_id, is_premium, created_at DESC

---

### subscriptions

User subscriptions to podcasts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique subscription ID |
| user_id | INTEGER | NOT NULL, FK(users) | Subscriber |
| podcast_id | INTEGER | NOT NULL, FK(podcasts) | Subscribed podcast |
| subscribed_at | TIMESTAMP | DEFAULT NOW | Subscription date |

**Relationships:**
- user_id → users.id (CASCADE DELETE)
- podcast_id → podcasts.id (CASCADE DELETE)

**Constraints:**
- UNIQUE: (user_id, podcast_id) - One subscription per user per podcast

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: (user_id, podcast_id)
- INDEX: user_id

---

### favorites

User favorite episodes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique favorite ID |
| user_id | INTEGER | NOT NULL, FK(users) | User |
| episode_id | INTEGER | NOT NULL, FK(episodes) | Favorited episode |
| favorited_at | TIMESTAMP | DEFAULT NOW | When favorited |

**Relationships:**
- user_id → users.id (CASCADE DELETE)
- episode_id → episodes.id (CASCADE DELETE)

**Constraints:**
- UNIQUE: (user_id, episode_id) - One favorite per user per episode

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: (user_id, episode_id)
- INDEX: user_id

---

### ratings

User episode ratings and reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique rating ID |
| user_id | INTEGER | NOT NULL, FK(users) | Rating user |
| episode_id | INTEGER | NOT NULL, FK(episodes) | Rated episode |
| rating | INTEGER | CHECK (1-5) | Star rating (1-5) |
| comment | TEXT | | Review text |
| created_at | TIMESTAMP | DEFAULT NOW | Rating timestamp |

**Relationships:**
- user_id → users.id (CASCADE DELETE)
- episode_id → episodes.id (CASCADE DELETE)

**Constraints:**
- UNIQUE: (user_id, episode_id) - One rating per user per episode
- CHECK: rating BETWEEN 1 AND 5

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: (user_id, episode_id)

---

### listen_history

User listening history and progress.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique history ID |
| user_id | INTEGER | NOT NULL, FK(users) | Listener |
| episode_id | INTEGER | NOT NULL, FK(episodes) | Listened episode |
| last_position_seconds | INTEGER | DEFAULT 0 | Resume point |
| finished | BOOLEAN | DEFAULT FALSE | Completed flag |
| listened_at | TIMESTAMP | DEFAULT NOW | Last listen time |

**Relationships:**
- user_id → users.id (CASCADE DELETE)
- episode_id → episodes.id (CASCADE DELETE)

**Constraints:**
- UNIQUE: (user_id, episode_id) - One history per user per episode

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: (user_id, episode_id)
- INDEX: user_id, episode_id

---

### premium_subscriptions

Premium membership records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique subscription ID |
| user_id | INTEGER | NOT NULL, FK(users) | Subscriber |
| stripe_subscription_id | VARCHAR(255) | UNIQUE | Stripe reference |
| plan | VARCHAR(50) | NOT NULL | Plan type (monthly/annual) |
| amount_cents | INTEGER | | Amount in cents |
| currency | VARCHAR(3) | DEFAULT 'USD' | Currency code |
| status | VARCHAR(50) | DEFAULT 'active' | Status (active/cancelled/expired) |
| started_at | TIMESTAMP | DEFAULT NOW | Start date |
| ends_at | TIMESTAMP | | End date |
| cancelled_at | TIMESTAMP | | Cancellation date |

**Relationships:**
- user_id → users.id (CASCADE DELETE)

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: stripe_subscription_id
- INDEX: user_id, status

---

## Relationships Diagram

```
users
├── podcasts (creator_id)
├── subscriptions (user_id)
├── favorites (user_id)
├── ratings (user_id)
├── listen_history (user_id)
└── premium_subscriptions (user_id)

categories
└── podcasts (category_id)

podcasts
├── episodes (podcast_id)
├── subscriptions (podcast_id)
└── favorites (through episodes)

episodes
├── favorites (episode_id)
├── ratings (episode_id)
└── listen_history (episode_id)
```

## Useful Queries

### Get Podcasts by Category

```sql
SELECT p.*, c.name as category_name, u.username as creator_name
FROM podcasts p
JOIN categories c ON p.category_id = c.id
JOIN users u ON p.creator_id = u.id
WHERE c.slug = 'technology'
ORDER BY p.created_at DESC;
```

### Get User's Subscriptions

```sql
SELECT p.*, c.name as category_name
FROM subscriptions s
JOIN podcasts p ON s.podcast_id = p.id
JOIN categories c ON p.category_id = c.id
WHERE s.user_id = 1
ORDER BY s.subscribed_at DESC;
```

### Get Top Podcasts

```sql
SELECT p.id, p.title, p.total_listens, AVG(r.rating) as avg_rating
FROM podcasts p
LEFT JOIN episodes e ON p.id = e.podcast_id
LEFT JOIN ratings r ON e.id = r.episode_id
GROUP BY p.id
ORDER BY p.total_listens DESC
LIMIT 10;
```

### Get User Listening Stats

```sql
SELECT 
  COUNT(DISTINCT lh.episode_id) as episodes_listened,
  SUM(CASE WHEN lh.finished THEN 1 ELSE 0 END) as episodes_completed,
  COUNT(DISTINCT lh.podcast_id) as podcasts_explored
FROM listen_history lh
WHERE lh.user_id = 1;
```

## Performance Considerations

### Indexes
- Heavy queries on categories and podcasts have dedicated indexes
- Foreign key lookups are indexed
- Frequently sorted fields are indexed

### Partitioning (Future)
- Consider partitioning listen_history by user_id
- Consider partitioning ratings by episode_id

### Query Optimization
- Use pagination for list queries
- Cache category data
- Denormalize frequently queried aggregates

## Constraints & Rules

1. **Cascading Deletes**: Deleting a user removes all their related data
2. **Unique Constraints**: Prevent duplicate subscriptions, favorites, and ratings
3. **NOT NULL**: Critical fields are enforced
4. **Check Constraints**: Rating values are validated at database level
5. **Foreign Keys**: Maintain referential integrity

## Backup Strategy

```bash
# Backup database
pg_dump podstream > backup.sql

# Restore database
psql podstream < backup.sql
```

## Migration Management

Migrations are stored in `backend/src/db/migrations/` and run via:

```bash
npm run migrate
```

## Future Enhancements

- Add podcast tags/genres
- Add user social connections (followers)
- Add episode recommendations
- Add listening time statistics
- Add user engagement metrics
