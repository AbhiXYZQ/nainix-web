-- ============================================================
-- Nainix Marketplace — Supabase SQL Schema
-- Run this entire script once in the Supabase SQL Editor
-- Settings → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  role            TEXT NOT NULL CHECK (role IN ('CLIENT', 'FREELANCER')),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  username        TEXT NOT NULL UNIQUE,
  phone           TEXT UNIQUE,
  bio             TEXT,
  country         TEXT,
  state           TEXT,
  city            TEXT,
  avatar_url      TEXT,
  video_intro     TEXT,
  portfolio_url   TEXT,
  skills          JSONB    DEFAULT '[]',
  portfolio       JSONB    DEFAULT '[]',
  social_links    JSONB    DEFAULT '{}',
  role_profile    JSONB    DEFAULT '{}',
  verified_badges JSONB    DEFAULT '[]',
  monetization    JSONB    DEFAULT '{"plan":"FREE","verificationBadgeActive":false,"aiProActive":false,"aiProActivatedAt":null}',
  onboarding      JSONB    DEFAULT '{}',
  contact_verification JSONB DEFAULT '{"emailVerified":false,"phoneVerified":false}',
  password_hash   TEXT,
  password_salt   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_phone    ON users (phone);

-- ── Jobs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id              TEXT PRIMARY KEY,
  client_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  budget_min      NUMERIC DEFAULT 0,
  budget_max      NUMERIC DEFAULT 0,
  is_urgent       BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  featured_until  TIMESTAMPTZ,
  required_skills JSONB DEFAULT '[]',
  status          TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','COMPLETED')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_client_id  ON jobs (client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at DESC);

-- ── Proposals ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS proposals (
  id                TEXT PRIMARY KEY,
  job_id            TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pitch             TEXT,
  estimated_days    INTEGER DEFAULT 0,
  price             NUMERIC DEFAULT 0,
  smart_match_score INTEGER DEFAULT 80,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_job_id        ON proposals (job_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals (freelancer_id);

-- ── Password Reset Tokens ────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_prt_token   ON password_reset_tokens (token);

-- ── Billing Transactions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS billing_transactions (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT,
  feature    TEXT,
  amount_usd NUMERIC DEFAULT 0,
  currency   TEXT DEFAULT 'USD',
  status     TEXT DEFAULT 'PAID_MOCK',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Analytics Events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id         SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  payload    JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
