-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  avatar_color TEXT NOT NULL,
  status TEXT NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  duration TEXT NOT NULL,
  benefits TEXT[] NOT NULL,
  active BOOLEAN NOT NULL,
  subscribers INTEGER NOT NULL
);

-- Newsletters Table
CREATE TABLE IF NOT EXISTS newsletters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  template TEXT NOT NULL,
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  cover_image TEXT DEFAULT '',
  reading_time INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL,
  visibility TEXT NOT NULL,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  publish_date TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  stats JSONB NOT NULL DEFAULT '{"opens": 0, "clicks": 0, "openRate": 0, "clickRate": 0, "reads": 0}'::jsonb
);

-- Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  renewal_date TIMESTAMP WITH TIME ZONE,
  lifetime_spend NUMERIC NOT NULL DEFAULT 0,
  joined_date TIMESTAMP WITH TIME ZONE NOT NULL,
  avatar_color TEXT NOT NULL,
  location TEXT NOT NULL,
  payments JSONB NOT NULL DEFAULT '[]'::jsonb,
  activity JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT ''
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL
);
