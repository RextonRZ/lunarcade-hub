-- One row per player per leaderboard category, holding that player's best run.
CREATE TABLE IF NOT EXISTS scores (
  category    TEXT    NOT NULL,           -- quiz-standard, quiz-extended, racer-thrill-normal-auto, ...
  player_id   TEXT    NOT NULL,           -- lower-cased nickname
  name        TEXT    NOT NULL,
  kind        TEXT    NOT NULL,           -- quiz | racer
  mode        TEXT    NOT NULL,
  score       INTEGER NOT NULL,
  achieved_at INTEGER NOT NULL,           -- ms since epoch
  correct     INTEGER,
  total       INTEGER,
  attempts    INTEGER,
  accuracy    REAL,
  time_ms     REAL,
  slow        INTEGER,
  auto        INTEGER,
  updated_at  INTEGER NOT NULL,
  PRIMARY KEY (category, player_id)
);

-- Reviews on the download page. Shown publicly; set hidden = 1 to take one down:
--   npx wrangler d1 execute lunarcade --remote --command "UPDATE reviews SET hidden = 1 WHERE id = 12"
CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  role        TEXT    NOT NULL,           -- parent | teacher | pupil | other
  hearts      INTEGER NOT NULL,           -- 1 to 5
  body        TEXT    NOT NULL,
  loves       INTEGER NOT NULL DEFAULT 0,
  hidden      INTEGER NOT NULL DEFAULT 0,
  visitor     TEXT    NOT NULL,           -- salted hash of the visitor's address, for rate limits only
  created_at  INTEGER NOT NULL            -- ms since epoch
);
CREATE INDEX IF NOT EXISTS reviews_recent ON reviews (hidden, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_visitor ON reviews (visitor, created_at);

-- One love per visitor per review.
CREATE TABLE IF NOT EXISTS review_loves (
  review_id   INTEGER NOT NULL,
  visitor     TEXT    NOT NULL,
  PRIMARY KEY (review_id, visitor)
);
