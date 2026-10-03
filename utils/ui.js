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

// ==============================
// 영화 검색 결과 버튼 (리뷰조회용)
// ==============================

function movieReviewButtons(movies, userId) {
  return new ActionRowBuilder().addComponents(
    movies.slice(0, 5).map(movie => {
      const year = movie.release_date
        ? movie.release_date.slice(0, 4)
        : '연도 미상';

      const label = `${movie.title} (${year})`.slice(0, 80);

      return new ButtonBuilder()
        .setCustomId(`reviews:${userId}:${movie.id}`)
        .setLabel(label)
        .setStyle(ButtonStyle.Primary);
    })
  );
}


// =========================
// 영화별 리뷰 출력 임베드
// =========================

function movieReviewsEmbed(movie, reviews) {
  const embed = new EmbedBuilder()
    .setTitle(`🎬 ${movie.koreanTitle}`)
    .setDescription(
      `**${movie.englishTitle}**\n` +
      `${movie.releaseYear} · 감독 ${movie.director}\n\n` +
      `총 **${reviews.length}명**이 평가했습니다.`
    );

  if (movie.poster) {
    embed.setThumbnail(movie.poster);
  }

  if (reviews.length === 0) {
    embed.addFields({
      name: '평가',
      value: '아직 이 영화를 평가한 사용자가 없습니다.'
    });

    return embed;
  }

  const visibleReviews = reviews.slice(0, 10);

  for (const item of visibleReviews) {
    let ratingText;

    if (item.special_rating === 'earth_apology') {
      ratingText = '🌍 지구에게 사죄';
    } else {
      ratingText = `⭐ ${item.rating} / 5`;
    }

    const badgeText = {
      god: '🏆 갓영화',
      maybe: '😐 애매하긴해',
      shit: '💩 똥영화'
    }[item.badge];

    const lines = [ratingText];

    if (badgeText) {
      lines.push(badgeText);
    }

    lines.push(
      `💬 ${item.review || '작성된 리뷰 없음'}`
    );

    embed.addFields({
      name: `<@${item.user_id}>`,
      value: lines.join('\n'),
      inline: false
    });
  }

  if (reviews.length > 10) {
    embed.setFooter({
      text: `외 ${reviews.length - 10}개의 평가가 더 있습니다.`
    });
  }

  return embed;
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
            `badge:${userId}:${movieId}:maybe`
          )
          .setLabel(
            '애매하긴해'
          )
          .setEmoji(
            '😐'
          )
          .setStyle(
            ButtonStyle.Secondary
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


  const badgeText = {

    god: '🏆 갓영화',

    maybe: '😐 애매하긴해',

    shit: '💩 똥영화'

  }[badge];


  if (badgeText) {

    embed.addFields({
      name: '뱃지',
      value: badgeText
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


    const badge = {

      god: ' 🏆',

      maybe: ' 😐',

      shit: ' 💩'

    }[item.badge] || '';


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

  movieReviewButtons,

  movieReviewsEmbed
};