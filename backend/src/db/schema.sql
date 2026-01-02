-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture_url VARCHAR(500),
  bio TEXT,
  is_creator BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, premium, creator
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  color_hex VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(500),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  is_premium BOOLEAN DEFAULT FALSE,
  total_episodes INTEGER DEFAULT 0,
  total_listens BIGINT DEFAULT 0,
  average_rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Episodes table
CREATE TABLE IF NOT EXISTS episodes (
  id SERIAL PRIMARY KEY,
  podcast_id INTEGER NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  audio_url VARCHAR(500) NOT NULL,
  duration_seconds INTEGER,
  episode_number INTEGER,
  season_number INTEGER DEFAULT 1,
  is_premium BOOLEAN DEFAULT FALSE,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  podcast_id INTEGER NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, podcast_id)
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, episode_id)
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, episode_id)
);

-- Listen history table
CREATE TABLE IF NOT EXISTS listen_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  episode_id INTEGER NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  last_position_seconds INTEGER DEFAULT 0,
  finished BOOLEAN DEFAULT FALSE,
  listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, episode_id)
);

-- Premium subscription payments table
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan VARCHAR(50) NOT NULL, -- monthly, annual
  amount_cents INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- Voice samples table
CREATE TABLE IF NOT EXISTS voice_samples (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  duration_seconds DECIMAL(10,2),
  audio_format VARCHAR(10) NOT NULL, -- wav, mp3, flac
  sample_rate INTEGER,
  status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, processing, processed, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice models table
CREATE TABLE IF NOT EXISTS voice_models (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voice_sample_id INTEGER REFERENCES voice_samples(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model_path VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'training', -- training, ready, failed
  language VARCHAR(10) DEFAULT 'en',
  quality_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Voice synthesis history table
CREATE TABLE IF NOT EXISTS voice_synthesis_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voice_model_id INTEGER NOT NULL REFERENCES voice_models(id) ON DELETE CASCADE,
  text_input TEXT NOT NULL,
  audio_output_path VARCHAR(500) NOT NULL,
  duration_seconds DECIMAL(10,2),
  format VARCHAR(10) DEFAULT 'mp3',
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_podcasts_is_premium ON podcasts(is_premium);
CREATE INDEX idx_episodes_is_premium ON episodes(is_premium);
CREATE INDEX idx_episodes_created_at ON episodes(created_at DESC);
CREATE INDEX idx_listen_history_user_id ON listen_history(user_id);
CREATE INDEX idx_listen_history_episode_id ON listen_history(episode_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_voice_samples_user_id ON voice_samples(user_id);
CREATE INDEX idx_voice_samples_status ON voice_samples(status);
CREATE INDEX idx_voice_models_user_id ON voice_models(user_id);
CREATE INDEX idx_voice_models_status ON voice_models(status);
CREATE INDEX idx_voice_synthesis_history_user_id ON voice_synthesis_history(user_id);
CREATE INDEX idx_voice_synthesis_history_model_id ON voice_synthesis_history(voice_model_id);
