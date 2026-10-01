const { DatabaseSync } = require('node:sqlite');

const fs = require('fs');
const path = require('path');

const dataDir = path.join(
  __dirname,
  '../data'
);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const db = new DatabaseSync(
  path.join(dataDir, 'movie.db')
);


// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS ratings (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    movie_id INTEGER NOT NULL,

    korean_title TEXT NOT NULL,
    english_title TEXT,

    release_year TEXT,
    director TEXT,
    poster TEXT,

    rating REAL,
    special_rating TEXT,

    review TEXT,
    badge TEXT,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (
      guild_id,
      user_id,
      movie_id
    )
  )
`);


// 평가 저장 / 수정
function saveRating(data) {

  const stmt = db.prepare(`
    INSERT INTO ratings (

      guild_id,
      user_id,

      movie_id,

      korean_title,
      english_title,

      release_year,
      director,
      poster,

      rating,
      special_rating,

      review,
      badge

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT (
      guild_id,
      user_id,
      movie_id
    )

    DO UPDATE SET

      korean_title = excluded.korean_title,
      english_title = excluded.english_title,

      release_year = excluded.release_year,
      director = excluded.director,
      poster = excluded.poster,

      rating = excluded.rating,
      special_rating = excluded.special_rating,

      review = excluded.review,
      badge = excluded.badge,

      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(

    data.guildId,
    data.userId,

    data.movie.id,

    data.movie.koreanTitle,
    data.movie.englishTitle,

    data.movie.releaseYear,
    data.movie.director,
    data.movie.poster,

    data.rating,
    data.specialRating,

    data.review,
    data.badge
  );
}


// 특정 유저 평가
function getUserRatings(
  guildId,
  userId
) {

  return db.prepare(`
    SELECT *

    FROM ratings

    WHERE
      guild_id = ?
      AND user_id = ?

    ORDER BY updated_at DESC

    LIMIT 10
  `).all(
    guildId,
    userId
  );
}


// 영화 평균
function getMovieStats(
  guildId,
  movieId
) {

  return db.prepare(`
    SELECT

      AVG(rating) AS average_rating,

      COUNT(rating) AS rating_count,

      SUM(
        CASE
          WHEN special_rating = 'earth_apology'
          THEN 1
          ELSE 0
        END
      ) AS earth_count,

      COUNT(*) AS total_count

    FROM ratings

    WHERE
      guild_id = ?
      AND movie_id = ?
  `).get(
    guildId,
    movieId
  );
}


// 삭제할 평가 검색
function searchUserRatings(
  guildId,
  userId,
  title
) {

  const keyword = `%${title}%`;

  return db.prepare(`
    SELECT *

    FROM ratings

    WHERE
      guild_id = ?
      AND user_id = ?

      AND (
        korean_title LIKE ?
        OR english_title LIKE ?
      )

    ORDER BY updated_at DESC

    LIMIT 5
  `).all(
    guildId,
    userId,
    keyword,
    keyword
  );
}


// 평가 삭제
function deleteRating(
  guildId,
  userId,
  movieId
) {

  return db.prepare(`
    DELETE FROM ratings

    WHERE
      guild_id = ?
      AND user_id = ?
      AND movie_id = ?
  `).run(
    guildId,
    userId,
    movieId
  );
}


module.exports = {
  saveRating,
  getUserRatings,
  getMovieStats,
  searchUserRatings,
  deleteRating
};