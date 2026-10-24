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
