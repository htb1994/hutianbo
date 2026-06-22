CREATE TABLE IF NOT EXISTS summer_sop (
  id                   TEXT PRIMARY KEY,
  stage                TEXT NOT NULL,
  grade                TEXT NOT NULL,
  goal                 TEXT NOT NULL,
  tone                 TEXT NOT NULL,
  topic                TEXT NOT NULL,
  community_notice     TEXT NOT NULL,
  group_script         TEXT NOT NULL,
  moments_copy         TEXT NOT NULL,
  private_chat_script  TEXT NOT NULL,
  execution_checklist  TEXT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_summer_sop_created_at ON summer_sop (created_at);
CREATE INDEX IF NOT EXISTS idx_summer_sop_stage ON summer_sop (stage);
