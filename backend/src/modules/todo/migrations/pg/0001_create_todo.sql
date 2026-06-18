CREATE TABLE IF NOT EXISTS todo (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  done        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todo_created_at ON todo (created_at);
