CREATE TABLE IF NOT EXISTS channel (
  id                TEXT PRIMARY KEY,
  agent_name        TEXT NOT NULL,
  agent_owner       TEXT NOT NULL,
  city              TEXT NOT NULL,
  school_name       TEXT NOT NULL,
  stage             TEXT NOT NULL DEFAULT 'to_contact',
  lead_count        INTEGER NOT NULL DEFAULT 0,
  trial_count       INTEGER NOT NULL DEFAULT 0,
  paid_count        INTEGER NOT NULL DEFAULT 0,
  next_follow_up_at TEXT,
  note              TEXT NOT NULL DEFAULT '',
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_channel_stage ON channel (stage);
CREATE INDEX IF NOT EXISTS idx_channel_next_follow_up_at ON channel (next_follow_up_at);
