const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  escapeMarkdown
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


// =========================
// 공통 출력 함수
// =========================

function truncate(
  text,
  maxLength = 350
) {
  if (
    !text ||
    text.length <= maxLength
  ) {
    return text;
  }

  return (
    `${text.slice(
      0,
      maxLength - 3
    )}...`
  );
}


function ratingText(item) {

  return (
    item.special_rating ===
    'earth_apology'

      ? '🌍 지구에게 사죄'

      : `⭐ ${item.rating} / 5`
  );
}


function badgeText(
  badge
) {

  return (
    BADGES[badge]?.label ||
    '없음'
  );
}


function reviewText(
  review
) {

  const text =
    truncate(
      review ||
      '감상평 없음'
    );

  return (
    `**${escapeMarkdown(text)}**`
  );
}


function ratingDetails(
  item
) {

  return (
    `**별점:** ${ratingText(item)}\n`
    +
    `**배지:** ${badgeText(item.badge)}\n`
    +
    `**리뷰:** ${reviewText(item.review)}`
  );
}


// =========================
// 영화 기본 정보
// =========================

function movieEmbed(
  movie
) {

  const embed =
    new EmbedBuilder()

      .setTitle(
        `🎬 ${movie.koreanTitle}`
      )

      .setDescription(
        movie.englishTitle
      )

      .addFields(

        {
          name:
            '개봉연도',

          value:
            movie.releaseYear,

          inline:
            true
        },

        {
          name:
            '감독',

          value:
            movie.director,

          inline:
            true
        }
      );


  if (
    movie.poster
  ) {

    embed.setThumbnail(
      movie.poster
    );
  }


  return embed;
}


// =========================
// 영화 검색 결과
// =========================

function movieButtons(
  movies,
  userId,
  prefix = 'movie'
) {

  const row =
    new ActionRowBuilder();


  movies
    .slice(0, 5)
    .forEach(movie => {

      const year =

        movie.release_date

          ? movie.release_date
              .slice(0, 4)

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
// 평가 취소
// =========================

function cancelButton(
  userId,
  movieId
) {

  return (
    new ButtonBuilder()

      .setCustomId(
        `cancel:${userId}:${movieId}`
      )

      .setLabel(
        '평가 취소'
      )

      .setStyle(
        ButtonStyle.Danger
      )
  );
}


// =========================
// 별점 선택
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


  const createRow =
    values =>

      new ActionRowBuilder()
        .addComponents(

          ...values.map(
            score =>

              new ButtonBuilder()

                .setCustomId(
                  `rate:${userId}:${movieId}:${score}`
                )

                .setLabel(
                  `⭐ ${score}`
                )

                .setStyle(
                  ButtonStyle.Secondary
                )
          )
        );


  return [

    createRow(
      scores.slice(0, 5)
    ),

    createRow(
      scores.slice(5)
    ),

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
          ),

        cancelButton(
          userId,
          movieId
        )
      )
  ];
}


// =========================
// 뱃지 선택
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
            '갓영화'
          )

          .setEmoji(
            '🏆'
          )

          .setStyle(
            ButtonStyle.Success
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
            `badge:${userId}:${movieId}:shit`
          )

          .setLabel(
            '똥영화'
          )

          .setEmoji(
            '💩'
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
          ),


        cancelButton(
          userId,
          movieId
        )
      )
  ];
}


// =========================
// 평가 완료
// =========================

function finalRatingEmbed(
  movie,
  rating,
  review,
  badge,
  displayName
) {

  const embed =
    movieEmbed(
      movie
    );


  const score =

    rating === 'earth'

      ? '🌍 지구에게 사죄'

      : `⭐ ${rating} / 5`;


  embed.addFields({

    name:
      '평점',

    value:
      score
  });


  if (
    BADGES[badge]
  ) {

    embed.addFields({

      name:
        '뱃지',

      value:
        BADGES[badge].label
    });
  }


  embed.addFields({

    name:
      '감상평',

    value:
      reviewText(
        review
      )
  });


  embed.setFooter({

    text:
      `${displayName}님의 평가`
  });


  return embed;
}


// =========================
// 사용자 평가 페이지
// =========================

function userRatingsEmbed(
  displayName,
  ratings,
  page,
  totalPages
) {

  const embed =
    new EmbedBuilder()

      .setTitle(
        `🎬 ${displayName}님의 영화 평가`
      )

      .setFooter({

        text:
          `${page + 1} / ${totalPages} 페이지`
      });


  ratings.forEach(
    item => {

      embed.addFields({

        name:
          `${item.korean_title} (${item.release_year})`,

        value:
          ratingDetails(
            item
          )
      });

    }
  );


  return embed;
}


// =========================
// 페이지 이동
// =========================

function paginationButtons(
  ownerId,
  targetUserId,
  page,
  totalPages
) {

  if (
    totalPages <= 1
  ) {
    return [];
  }


  return [

    new ActionRowBuilder()
      .addComponents(

        new ButtonBuilder()

          .setCustomId(
            `ratings:${ownerId}:${targetUserId}:${page - 1}`
          )

          .setLabel(
            '◀ 이전'
          )

          .setStyle(
            ButtonStyle.Secondary
          )

          .setDisabled(
            page === 0
          ),


        new ButtonBuilder()

          .setCustomId(
            `ratings:${ownerId}:${targetUserId}:${page + 1}`
          )

          .setLabel(
            '다음 ▶'
          )

          .setStyle(
            ButtonStyle.Secondary
          )

          .setDisabled(
            page ===
            totalPages - 1
          )
      )
  ];
}


// =========================
// 영화 평점 + 리뷰
// =========================

function movieStatsEmbed(
  movie,
  stats,
  reviews
) {

  const embed =
    movieEmbed(
      movie
    );


  const total =
    Number(
      stats?.total_count || 0
    );


  const ratingCount =
    Number(
      stats?.rating_count || 0
    );


  const earthCount =
    Number(
      stats?.earth_count || 0
    );


  if (
    ratingCount
  ) {

    embed.addFields({

      name:
        '서버 평균',

      value:
        `⭐ ${Number(
          stats.average_rating
        ).toFixed(1)} / 5 (${ratingCount}명)`
    });
  }


  if (
    earthCount
  ) {

    embed.addFields({

      name:
        '특별 평가',

      value:
        `🌍 지구에게 사죄 ${earthCount}명`
    });
  }


  embed.addFields({

    name:
      '총 평가',

    value:
      `${total}명`
  });


  if (
    !total
  ) {

    embed.addFields({

      name:
        '리뷰',

      value:
        '아직 등록된 평가가 없습니다.'
    });


    return embed;
  }


  reviews.forEach(
    item => {

      embed.addFields({

        name:
          `👤 ${item.displayName}`,

        value:
          ratingDetails(
            item
          )
      });

    }
  );


  if (
    total >
    reviews.length
  ) {

    embed.setFooter({

      text:
        `최근 ${reviews.length}개 평가 표시 · 총 ${total}개`
    });
  }


  return embed;
}


// =========================
// 평가 삭제
// =========================

function deleteButtons(
  ratings,
  userId
) {

  const row =
    new ActionRowBuilder();


  ratings.forEach(
    item => {

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

    }
  );


  return [row];
}


module.exports = {

  movieEmbed,

  movieButtons,

  ratingButtons,

  badgeButtons,

  finalRatingEmbed,

  userRatingsEmbed,

  paginationButtons,

  movieStatsEmbed,

  deleteButtons
};