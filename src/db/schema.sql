-- =============================================
-- Sonichigo Portfolio — PostgreSQL Schema
-- Run this against your Neon database
-- =============================================

-- Talks / Events
CREATE TABLE IF NOT EXISTS talks (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  event_name    TEXT NOT NULL,
  event_url     TEXT,
  date          DATE NOT NULL,
  location      TEXT,
  type          TEXT DEFAULT 'speaker' CHECK (type IN ('speaker', 'host', 'panelist', 'workshop')),
  image_url     TEXT,
  video_url     TEXT,
  slides_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts (cached from RSS + external)
CREATE TABLE IF NOT EXISTS posts (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  url           TEXT NOT NULL UNIQUE,
  source        TEXT NOT NULL DEFAULT 'hashnode',
  published_at  DATE,
  excerpt       TEXT,
  tags          TEXT[],
  image_url     TEXT,
  is_featured   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Travels / Places visited
CREATE TABLE IF NOT EXISTS travels (
  id            SERIAL PRIMARY KEY,
  city          TEXT NOT NULL,
  country       TEXT NOT NULL,
  latitude      DECIMAL(10, 7),
  longitude     DECIMAL(10, 7),
  visited_date  DATE,
  purpose       TEXT CHECK (purpose IN ('conference', 'meetup', 'vacation', 'work', 'other')),
  notes         TEXT,
  image_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_talks_date ON talks(date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_source ON posts(source);
CREATE INDEX IF NOT EXISTS idx_travels_country ON travels(country);
