CREATE TABLE IF NOT EXISTS todo (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  done        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_todo_created_at ON todo (created_at);
