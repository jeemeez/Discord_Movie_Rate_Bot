const {
  MessageFlags
} = require('discord.js');

const {
  searchMovies,
  getMovie
} = require('../services/tmdb');

const {
  getUserRatings,
  getMovieStats,
  getMovieReviews,
  searchUserRatings,
  deleteRating
} = require('../database/db');

const {
  movieButtons,
  userRatingsEmbed,
  paginationButtons,
  movieStatsEmbed,
  deleteButtons
} = require('../utils/ui');

const {
  checkOwner,
  getDisplayName
} = require('../utils/interaction');


const PAGE_SIZE = 5;


// =========================
// 평가 페이지 생성
// =========================

function createRatingPage(
  displayName,
  ratings,
  ownerId,
  targetUserId,
  page = 0
) {
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        ratings.length /
        PAGE_SIZE
      )
    );

  const currentPage =
    Math.min(
      Math.max(page, 0),
      totalPages - 1
    );

  const start =
    currentPage *
    PAGE_SIZE;

  const items =
    ratings.slice(
      start,
      start + PAGE_SIZE
    );

  return {
    embeds: [
      userRatingsEmbed(
        displayName,
        items,
        currentPage,
        totalPages
      )
    ],

    components:
      paginationButtons(
        ownerId,
        targetUserId,
        currentPage,
        totalPages
      )
  };
}


// =========================
// 사용자 평가 조회
// =========================

async function showUserRatings(
  interaction,
  user,
  ephemeral = false
) {
  const ratings =
    getUserRatings(
      interaction.guildId,
      user.id
    );

  if (!ratings.length) {
    await interaction.reply({
      content:
        `🎬 ${user.username}님은 아직 평가한 영화가 없습니다.`,

      flags:
        ephemeral
          ? MessageFlags.Ephemeral
          : undefined
    });

    return;
  }

  const displayName =
    await getDisplayName(
      interaction,
      user.id
    );

  await interaction.reply({
    ...createRatingPage(
      displayName,
      ratings,
      interaction.user.id,
      user.id
    ),

    flags:
      ephemeral
        ? MessageFlags.Ephemeral
        : undefined
  });
}


// =========================
// 영화 검색
// =========================

async function showMovieSearch(
  interaction
) {
  await interaction.deferReply();

  const title =
    interaction.options
      .getString('제목');

  const movies =
    await searchMovies(title);

  if (!movies.length) {
    await interaction.editReply(
      '❌ 검색 결과가 없습니다.'
    );

    return;
  }

  await interaction.editReply({
    content:
      '🎬 확인할 영화를 선택해주세요.',

    components:
      movieButtons(
        movies,
        interaction.user.id,
        'stats'
      )
  });
}


// =========================
// Slash Command
// =========================

async function handleCommand(
  interaction
) {
  switch (
    interaction.commandName
  ) {

    case '내평가':
      return showUserRatings(
        interaction,
        interaction.user,
        true
      );


    case '유저평가':
      return showUserRatings(
        interaction,
        interaction.options
          .getUser('사용자')
      );


    case '영화평점':
      return showMovieSearch(
        interaction
      );


    case '평가삭제': {
      const title =
        interaction.options
          .getString('제목');

      const ratings =
        searchUserRatings(
          interaction.guildId,
          interaction.user.id,
          title
        );

      if (!ratings.length) {
        await interaction.reply({
          content:
            '❌ 해당 평가를 찾을 수 없습니다.',

          flags:
            MessageFlags.Ephemeral
        });

        return;
      }

      await interaction.reply({
        content:
          '🗑️ 삭제할 평가를 선택해주세요.',

        components:
          deleteButtons(
            ratings,
            interaction.user.id
          ),

        flags:
          MessageFlags.Ephemeral
      });

      return;
    }
  }
}


// =========================
// 영화 평점 + 리뷰
// =========================

async function showMovieStats(
  interaction,
  movieId
) {
  await interaction.deferUpdate();

  const movie =
    await getMovie(movieId);

  const stats =
    getMovieStats(
      interaction.guildId,
      movie.id
    );

  const reviews =
    getMovieReviews(
      interaction.guildId,
      movie.id
    );

  // User ID → 서버 닉네임
  const namedReviews =
    await Promise.all(
      reviews.map(
        async review => ({
          ...review,

          displayName:
            await getDisplayName(
              interaction,
              review.user_id
            )
        })
      )
    );

  await interaction.editReply({
    content: '',

    embeds: [
      movieStatsEmbed(
        movie,
        stats,
        namedReviews
      )
    ],

    components: []
  });
}


// =========================
// 평가 페이지 이동
// =========================

async function changePage(
  interaction,
  ownerId,
  targetUserId,
  page
) {
  const ratings =
    getUserRatings(
      interaction.guildId,
      targetUserId
    );

  if (!ratings.length) {
    await interaction.update({
      content:
        '평가 내역이 없습니다.',

      embeds: [],
      components: []
    });

    return;
  }

  const displayName =
    await getDisplayName(
      interaction,
      targetUserId
    );

  await interaction.update(
    createRatingPage(
      displayName,
      ratings,
      ownerId,
      targetUserId,
      Number(page)
    )
  );
}


// =========================
// Button Router
// =========================

async function handleButton(
  interaction
) {
  const [
    type,
    ownerId,
    value,
    page
  ] =
    interaction.customId
      .split(':');

  if (
    !await checkOwner(
      interaction,
      ownerId
    )
  ) {
    return;
  }


  switch (type) {

    case 'stats':
      return showMovieStats(
        interaction,
        value
      );


    case 'ratings':
      return changePage(
        interaction,
        ownerId,
        value,
        page
      );


    case 'delete':

      deleteRating(
        interaction.guildId,
        interaction.user.id,
        value
      );

      await interaction.update({
        content:
          '🗑️ 평가를 삭제했습니다.',

        components: []
      });

      return;
  }
}


module.exports = {
  handleCommand,
  handleButton
};