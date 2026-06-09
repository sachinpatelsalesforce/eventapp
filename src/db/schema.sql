-- Commerce Connect — Full Schema
-- Run: psql $DATABASE_URL -f src/db/schema.sql

-- App Settings (feature flags)
CREATE TABLE IF NOT EXISTS app_settings (
  key   VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL DEFAULT 'true',
  label VARCHAR(200),
  description TEXT
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id                SERIAL PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  date              DATE NOT NULL,
  venue             VARCHAR(255) NOT NULL,
  short_description TEXT,
  welcome_message   TEXT
);

-- Speakers
CREATE TABLE IF NOT EXISTS speakers (
  id           SERIAL PRIMARY KEY,
  event_id     INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  job_title    VARCHAR(255),
  company      VARCHAR(255),
  bio          TEXT,
  photo_url    VARCHAR(500),
  linkedin_url VARCHAR(500)
);

-- Agenda Items
CREATE TABLE IF NOT EXISTS agenda_items (
  id            SERIAL PRIMARY KEY,
  event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  session_title VARCHAR(255) NOT NULL,
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ NOT NULL,
  speaker_id    INTEGER REFERENCES speakers(id) ON DELETE SET NULL,
  room          VARCHAR(100),
  description   TEXT,
  sort_order    INTEGER DEFAULT 0,
  resource_url  TEXT
);

-- Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id         SERIAL PRIMARY KEY,
  event_id   INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name  VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  company    VARCHAR(255),
  job_title  VARCHAR(255),
  consent    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_event_idx ON contacts(email, event_id);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id            SERIAL PRIMARY KEY,
  contact_id    INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  session_id    INTEGER NOT NULL REFERENCES agenda_items(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  topic         VARCHAR(30) CHECK (topic IN (
    'product_roadmap','commercials','delivery','enablement',
    'gtm','competitive_objections','agentforce'
  ))
);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id            SERIAL PRIMARY KEY,
  contact_id    INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  event_id      INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  enjoyed       TEXT,
  improve       TEXT,
  future_topics TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

-- Session Interests
CREATE TABLE IF NOT EXISTS session_interests (
  id             SERIAL PRIMARY KEY,
  contact_id     INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  agenda_item_id INTEGER NOT NULL REFERENCES agenda_items(id) ON DELETE CASCADE,
  UNIQUE(contact_id, agenda_item_id)
);

-- Partner Profiles
CREATE TABLE IF NOT EXISTS partner_profiles (
  id                   SERIAL PRIMARY KEY,
  contact_id           INTEGER NOT NULL UNIQUE REFERENCES contacts(id) ON DELETE CASCADE,
  si_name              VARCHAR(200) NOT NULL,
  partner_tier         VARCHAR(20) NOT NULL CHECK (partner_tier IN ('summit','platinum','gold','silver')),
  commerce_specialisms TEXT[],
  industries_covered   TEXT[],
  certifications       TEXT[],
  key_customers        TEXT[],
  sf_ae_name           VARCHAR(200),
  sf_se_name           VARCHAR(200),
  marketplace_url      TEXT,
  app_exchange_url     TEXT,
  regions_covered      TEXT[],
  capabilities         TEXT[] NOT NULL DEFAULT '{}',
  bio                  TEXT,
  logo_url             TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pp_tier         ON partner_profiles(partner_tier);
CREATE INDEX IF NOT EXISTS idx_pp_capabilities ON partner_profiles USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_pp_industries   ON partner_profiles USING GIN(industries_covered);
CREATE INDEX IF NOT EXISTS idx_pp_regions      ON partner_profiles USING GIN(regions_covered);

-- Deals
CREATE TABLE IF NOT EXISTS deals (
  id                      SERIAL PRIMARY KEY,
  contact_id              INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  target_account          VARCHAR(200) NOT NULL,
  opportunity_description TEXT NOT NULL,
  blockers                TEXT,
  sf_support_needed       TEXT,
  next_steps              TEXT,
  status                  VARCHAR(10) NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','stalled','won','lost')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);

-- Session Partner Tags
CREATE TABLE IF NOT EXISTS session_partner_tags (
  id             SERIAL PRIMARY KEY,
  agenda_item_id INTEGER NOT NULL REFERENCES agenda_items(id) ON DELETE CASCADE,
  partner_type   VARCHAR(30) NOT NULL CHECK (partner_type IN (
    'b2c_delivery','b2b_delivery','oms_partner','data_cloud_partner',
    'loyalty_partner','isv_app_partner','agentforce_partner','composable_mach'
  )),
  UNIQUE (agenda_item_id, partner_type)
);
CREATE INDEX IF NOT EXISTS idx_spt_agenda ON session_partner_tags(agenda_item_id);
CREATE INDEX IF NOT EXISTS idx_spt_type   ON session_partner_tags(partner_type);

-- Polls
CREATE TABLE IF NOT EXISTS polls (
  id         SERIAL PRIMARY KEY,
  question   TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id         SERIAL PRIMARY KEY,
  poll_id    INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll ON poll_options(poll_id);

CREATE TABLE IF NOT EXISTS poll_votes (
  id         SERIAL PRIMARY KEY,
  poll_id    INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id  INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  voted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (poll_id, contact_id)
);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll    ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_contact ON poll_votes(contact_id);

-- Passport Stamps
CREATE TABLE IF NOT EXISTS passport_stamps (
  id         SERIAL PRIMARY KEY,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  stamp_type VARCHAR(30) NOT NULL CHECK (stamp_type IN (
    'roadmap_session','demo_booth','agentforce_session','isv_sponsor_booth','feedback_form'
  )),
  awarded_by VARCHAR(10) NOT NULL DEFAULT 'self' CHECK (awarded_by IN ('self','admin','system')),
  admin_id   INTEGER REFERENCES admin_users(id),
  stamped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (contact_id, stamp_type)
);
CREATE INDEX IF NOT EXISTS idx_passport_contact ON passport_stamps(contact_id);

-- GTM Ideas
CREATE TABLE IF NOT EXISTS gtm_ideas (
  id          SERIAL PRIMARY KEY,
  contact_id  INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  category    VARCHAR(30) NOT NULL CHECK (category IN (
    'joint_pipeline','co_sell','enablement','product_feedback','marketing',
    'isv_integration','services_play','customer_success','competitive','custom'
  )),
  description TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gtm_idea_votes (
  id         SERIAL PRIMARY KEY,
  idea_id    INTEGER NOT NULL REFERENCES gtm_ideas(id) ON DELETE CASCADE,
  contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  voted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (idea_id, contact_id)
);
CREATE INDEX IF NOT EXISTS idx_gtm_votes_idea    ON gtm_idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_gtm_votes_contact ON gtm_idea_votes(contact_id);

-- GTM Play Templates (seed reference)
CREATE TABLE IF NOT EXISTS gtm_play_templates (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  category    VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0
);

-- Action Plans
CREATE TABLE IF NOT EXISTS action_plans (
  id               SERIAL PRIMARY KEY,
  contact_id       INTEGER NOT NULL UNIQUE REFERENCES contacts(id) ON DELETE CASCADE,
  target_account_1 VARCHAR(200) NOT NULL,
  target_account_2 VARCHAR(200),
  target_account_3 VARCHAR(200),
  joint_play_1     TEXT NOT NULL,
  joint_play_2     TEXT,
  enablement_need  TEXT NOT NULL,
  sf_owner_name    VARCHAR(200) NOT NULL,
  follow_up_date   DATE NOT NULL,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_action_plans_contact ON action_plans(contact_id);
