const config = require('../config.json');

const BASE_URL = 'https://api.themoviedb.org/3';

async function request(endpoint, params = {}) {

  const query = new URLSearchParams({
    api_key: config.tmdbApiKey,
    ...params
  });

  const response = await fetch(
    `${BASE_URL}${endpoint}?${query}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API 오류: ${response.status}`);
  }

  return response.json();
}


// 영화 검색
async function searchMovies(title) {

  const data = await request(
    '/search/movie',
    {
      query: title,
      language: 'ko-KR',
      region: 'KR'
    }
  );

  return data.results.slice(0, 5);
}


// 영화 상세정보
async function getMovie(movieId) {

  const [ko, en] = await Promise.all([

    request(
      `/movie/${movieId}`,
      {
        language: 'ko-KR',
        append_to_response: 'credits'
      }
    ),

    request(
      `/movie/${movieId}`,
      {
        language: 'en-US'
      }
    )

  ]);

  const director = ko.credits?.crew?.find(
    person => person.job === 'Director'
  );

  return {

    id: ko.id,

    koreanTitle:
      ko.title || ko.original_title,

    englishTitle:
      en.title || ko.original_title,

    releaseYear:
      ko.release_date
        ? ko.release_date.slice(0, 4)
        : '정보 없음',

    director:
      director?.name || '정보 없음',

    poster:
      ko.poster_path
        ? `https://image.tmdb.org/t/p/w500${ko.poster_path}`
        : null
  };
}

module.exports = {
  searchMovies,
  getMovie
};