const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');


// =========================
// 영화 정보
// =========================

function movieEmbed(movie) {

  const embed = new EmbedBuilder()

    .setTitle(
      `🎬 ${movie.koreanTitle}`
    )

    .setDescription(
      movie.englishTitle
    )

    .addFields(

      {
        name: '개봉연도',
        value: movie.releaseYear,
        inline: true
      },

      {
        name: '감독',
        value: movie.director,
        inline: true
      }

    );

  if (movie.poster) {
    embed.setThumbnail(movie.poster);
  }

  return embed;
}


// =========================
// 영화 검색 결과 버튼
// =========================

function movieButtons(
  movies,
  userId,
  prefix = 'movie'
) {

  const row =
    new ActionRowBuilder();

  movies.forEach(movie => {

    const year =
      movie.release_date
        ? movie.release_date.slice(0, 4)
        : '?';

    row.addComponents(

      new ButtonBuilder()

        .setCustomId(
          `${prefix}:${userId}:${movie.id}`
        )

        .setLabel(
          `${movie.title} (${year})`
            .slice(0, 80)
        )

        .setStyle(
          ButtonStyle.Secondary
        )
    );
  });

  return [row];
}


// =========================
// 별점 버튼
// =========================

function ratingButtons(
  userId,
  movieId
) {

  const scores = [
    '0.5',
    '1.0',
    '1.5',
    '2.0',
    '2.5',
    '3.0',
    '3.5',
    '4.0',
    '4.5',
    '5.0'
  ];

  const rows = [];


  // 0.5 ~ 2.5
  rows.push(
    new ActionRowBuilder()
      .addComponents(

        ...scores
          .slice(0, 5)
          .map(score =>

            new ButtonBuilder()

              .setCustomId(
                `rate:${userId}:${movieId}:${score}`
              )

              .setLabel(`⭐ ${score}`)

              .setStyle(
                ButtonStyle.Secondary
              )
          )
      )
  );


  // 3.0 ~ 5.0
  rows.push(
    new ActionRowBuilder()
      .addComponents(

        ...scores
          .slice(5)
          .map(score =>

            new ButtonBuilder()

              .setCustomId(
                `rate:${userId}:${movieId}:${score}`
              )

              .setLabel(`⭐ ${score}`)

              .setStyle(
                ButtonStyle.Secondary
              )
          )
      )
  );


  // 특별 평가
  rows.push(
    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()

          .setCustomId(
            `rate:${userId}:${movieId}:earth`
          )

          .setLabel(
            '🌍 지구에게 사죄'
          )

          .setStyle(
            ButtonStyle.Danger
          )
      )
  );

  return rows;
}


// =========================
// 뱃지
// =========================

function badgeButtons(
  userId,
  movieId
) {

  return [

    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()

          .setCustomId(
            `badge:${userId}:${movieId}:god`
          )

          .setLabel(
            '🏆 갓영화'
          )

          .setStyle(
            ButtonStyle.Success
          ),


        new ButtonBuilder()

          .setCustomId(
            `badge:${userId}:${movieId}:shit`
          )

          .setLabel(
            '💩 똥영화'
          )

          .setStyle(
            ButtonStyle.Danger
          ),


        new ButtonBuilder()

          .setCustomId(
            `badge:${userId}:${movieId}:none`
          )

          .setLabel(
            '건너뛰기'
          )

          .setStyle(
            ButtonStyle.Secondary
          )
      )
  ];
}


// =========================
// 최종 평가 카드
// =========================

function finalRatingEmbed(
  movie,
  rating,
  review,
  badge,
  username
) {

  const embed =
    movieEmbed(movie);


  const ratingText =

    rating === 'earth'

      ? '🌍 지구에게 사죄'

      : `⭐ ${rating} / 5`;


  embed.addFields({
    name: '평점',
    value: ratingText
  });


  if (badge === 'god') {

    embed.addFields({
      name: '뱃지',
      value: '🏆 갓영화'
    });

  }

  if (badge === 'shit') {

    embed.addFields({
      name: '뱃지',
      value: '💩 똥영화'
    });

  }


  embed.addFields({
    name: '감상평',
    value:
      review ||
      '감상평 없음'
  });


  embed.setFooter({
    text:
      `${username}님의 평가`
  });

  return embed;
}


// =========================
// 유저 평가 목록
// =========================

function userRatingsEmbed(
  user,
  ratings
) {

  const embed =
    new EmbedBuilder()

      .setTitle(
        `🎬 ${user.username}님의 영화 평가`
      );


  ratings.forEach(item => {

    const score =

      item.special_rating ===
      'earth_apology'

        ? '🌍 지구에게 사죄'

        : `⭐ ${item.rating} / 5`;


    let badge = '';

    if (item.badge === 'god') {
      badge = ' 🏆';
    }

    if (item.badge === 'shit') {
      badge = ' 💩';
    }


    let review =
      item.review ||
      '감상평 없음';


    // Embed 전체 길이 방지
    if (review.length > 350) {

      review =
        review.slice(0, 347)
        + '...';
    }


    embed.addFields({

      name:
        `${item.korean_title} (${item.release_year})${badge}`,

      value:
        `${score}\n${review}`

    });

  });

  return embed;
}


// =========================
// 평가 삭제 버튼
// =========================

function deleteButtons(
  ratings,
  userId
) {

  const row =
    new ActionRowBuilder();


  ratings.forEach(item => {

    row.addComponents(

      new ButtonBuilder()

        .setCustomId(
          `delete:${userId}:${item.movie_id}`
        )

        .setLabel(
          `${item.korean_title} (${item.release_year})`
            .slice(0, 80)
        )

        .setStyle(
          ButtonStyle.Danger
        )
    );

  });

  return [row];
}


module.exports = {

  movieEmbed,

  movieButtons,

  ratingButtons,

  badgeButtons,

  finalRatingEmbed,

  userRatingsEmbed,

  deleteButtons
};