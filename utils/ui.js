const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} = require('discord.js');


const BADGES = {
  god: {
    label: '🏆 갓영화',
    icon: '🏆'
  },
  maybe: {
    label: '😐 애매하긴해',
    icon: '😐'
  },
  shit: {
    label: '💩 똥영화',
    icon: '💩'
  }
};


function truncate(text, maxLength = 350) {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}


// =========================
// 영화 정보
// =========================

function movieEmbed(movie) {
  const embed = new EmbedBuilder()
    .setTitle(`🎬 ${movie.koreanTitle}`)
    .setDescription(movie.englishTitle)
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
  const row = new ActionRowBuilder();

  movies.slice(0, 5).forEach(movie => {
    const year = movie.release_date
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
        .setStyle(ButtonStyle.Secondary)
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

  const createScoreRow = scores =>
    new ActionRowBuilder().addComponents(
      ...scores.map(score =>
        new ButtonBuilder()
          .setCustomId(
            `rate:${userId}:${movieId}:${score}`
          )
          .setLabel(`⭐ ${score}`)
          .setStyle(ButtonStyle.Secondary)
      )
    );

  return [
    createScoreRow(scores.slice(0, 5)),
    createScoreRow(scores.slice(5)),

    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          `rate:${userId}:${movieId}:earth`
        )
        .setLabel('🌍 지구에게 사죄')
        .setStyle(ButtonStyle.Danger)
    )
  ];
}


// =========================
// 뱃지 버튼
// =========================

function badgeButtons(
  userId,
  movieId
) {
  return [
    new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId(
          `badge:${userId}:${movieId}:god`
        )
        .setLabel('갓영화')
        .setEmoji('🏆')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(
          `badge:${userId}:${movieId}:maybe`
        )
        .setLabel('애매하긴해')
        .setEmoji('😐')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(
          `badge:${userId}:${movieId}:shit`
        )
        .setLabel('똥영화')
        .setEmoji('💩')
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(
          `badge:${userId}:${movieId}:none`
        )
        .setLabel('건너뛰기')
        .setStyle(ButtonStyle.Secondary)
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
  const embed = movieEmbed(movie);

  const ratingText =
    rating === 'earth'
      ? '🌍 지구에게 사죄'
      : `⭐ ${rating} / 5`;

  embed.addFields({
    name: '평점',
    value: ratingText
  });

  const badgeText =
    BADGES[badge]?.label;

  if (badgeText) {
    embed.addFields({
      name: '뱃지',
      value: badgeText
    });
  }

  embed.addFields({
    name: '감상평',
    value: review || '감상평 없음'
  });

  embed.setFooter({
    text: `${username}님의 평가`
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
  const embed = new EmbedBuilder()
    .setTitle(
      `🎬 ${user.username}님의 영화 평가`
    );

  ratings.forEach(item => {
    const score =
      item.special_rating === 'earth_apology'
        ? '🌍 지구에게 사죄'
        : `⭐ ${item.rating} / 5`;

    const badge =
      BADGES[item.badge]?.icon
        ? ` ${BADGES[item.badge].icon}`
        : '';

    const review = truncate(
      item.review || '감상평 없음'
    );

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
// 영화별 사용자 리뷰
// =========================

function movieReviewsEmbed(
  movie,
  reviews
) {
  const embed = movieEmbed(movie);

  embed.addFields({
    name: '총 평가',
    value: `${reviews.length}명`
  });

  if (!reviews.length) {
    embed.addFields({
      name: '평가',
      value:
        '아직 이 영화를 평가한 사용자가 없습니다.'
    });

    return embed;
  }

  reviews
    .slice(0, 10)
    .forEach(item => {
      const score =
        item.special_rating ===
        'earth_apology'
          ? '🌍 지구에게 사죄'
          : `⭐ ${item.rating} / 5`;

      const badge =
        BADGES[item.badge]?.label;

      const review = truncate(
        item.review ||
        '감상평 없음'
      );

      const contents = [
        score,
        badge,
        `💬 ${review}`
      ].filter(Boolean);

      embed.addFields({
        name:
          `<@${item.user_id}>`,
        value:
          contents.join('\n')
      });
    });

  if (reviews.length > 10) {
    embed.setFooter({
      text:
        `외 ${reviews.length - 10}개의 평가가 더 있습니다.`
    });
  }

  return embed;
}


// =========================
// 평가 삭제 버튼
// =========================

function deleteButtons(
  ratings,
  userId
) {
  const row = new ActionRowBuilder();

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
        .setStyle(ButtonStyle.Danger)
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
  movieReviewsEmbed,
  deleteButtons
};