const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

const {
  searchMovies,
  getMovie
} = require('../services/tmdb');

const {
  saveRating
} = require('../database/db');

const {
  movieEmbed,
  movieButtons,
  ratingButtons,
  badgeButtons,
  finalRatingEmbed
} = require('../utils/ui');

const {
  setSession,
  getSession,
  clearSession
} = require('../utils/session');

const {
  privateError,
  checkOwner,
  getDisplayName
} = require('../utils/interaction');


// =========================
// /영화검색
// =========================

async function handleSearch(
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
      '🎬 평가할 영화를 선택해주세요.',

    components:
      movieButtons(
        movies,
        interaction.user.id
      )
  });
}


// =========================
// 영화 선택
// =========================

async function selectMovie(
  interaction,
  movieId
) {
  await interaction.deferUpdate();

  const movie =
    await getMovie(movieId);

  setSession(
    interaction,
    movie
  );

  await interaction.editReply({
    content:
      '⭐ 별점을 선택해주세요.',

    embeds: [
      movieEmbed(movie)
    ],

    components:
      ratingButtons(
        interaction.user.id,
        movie.id
      )
  });
}


// =========================
// 별점 선택
// =========================

async function selectRating(
  interaction,
  ownerId,
  movieId,
  rating
) {
  const session =
    getSession(
      interaction,
      movieId
    );

  if (!session) {
    return privateError(
      interaction,
      '❌ 평가 세션이 만료되었습니다.'
    );
  }

  session.rating = rating;

  const reviewInput =
    new TextInputBuilder()
      .setCustomId('review')
      .setLabel('감상평')
      .setPlaceholder(
        '영화에 대한 감상평을 작성해주세요.'
      )
      .setStyle(
        TextInputStyle.Paragraph
      )
      .setRequired(false)
      .setMaxLength(1000);

  const modal =
    new ModalBuilder()
      .setCustomId(
        `review:${ownerId}:${movieId}`
      )
      .setTitle('🎬 감상평 작성')
      .addComponents(
        new ActionRowBuilder()
          .addComponents(
            reviewInput
          )
      );

  await interaction.showModal(
    modal
  );
}


// =========================
// 뱃지 선택 및 평가 저장
// =========================

async function selectBadge(
  interaction,
  movieId,
  badge
) {
  const session =
    getSession(
      interaction,
      movieId
    );

  if (!session) {
    return privateError(
      interaction,
      '❌ 평가 세션이 만료되었습니다.'
    );
  }

  const earth =
    session.rating === 'earth';

  saveRating({
    guildId:
      interaction.guildId,

    userId:
      interaction.user.id,

    movie:
      session.movie,

    rating:
      earth
        ? null
        : Number(session.rating),

    specialRating:
      earth
        ? 'earth_apology'
        : null,

    review:
      session.review || null,

    badge:
      badge === 'none'
        ? null
        : badge
  });

  const displayName =
    await getDisplayName(
      interaction,
      interaction.user.id
    );

  await interaction.update({
    content:
      '✅ 평가 완료!',

    embeds: [
      finalRatingEmbed(
        session.movie,
        session.rating,
        session.review,
        badge,
        displayName
      )
    ],

    components: []
  });

  clearSession(
    interaction,
    movieId
  );
}


// =========================
// 평가 취소
// =========================

async function cancelRating(
  interaction,
  movieId
) {
  if (
    !clearSession(
      interaction,
      movieId
    )
  ) {
    return privateError(
      interaction,
      '❌ 평가 세션이 만료되었습니다.'
    );
  }

  await interaction.update({
    content:
      '❌ 영화 평가를 취소했습니다.',

    embeds: [],
    components: []
  });
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
    movieId,
    value
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

    case 'movie':
      return selectMovie(
        interaction,
        movieId
      );

    case 'rate':
      return selectRating(
        interaction,
        ownerId,
        movieId,
        value
      );

    case 'badge':
      return selectBadge(
        interaction,
        movieId,
        value
      );

    case 'cancel':
      return cancelRating(
        interaction,
        movieId
      );
  }
}


// =========================
// 감상평 Modal
// =========================

async function handleModal(
  interaction
) {
  if (
    !interaction.customId
      .startsWith('review:')
  ) {
    return;
  }

  const [
    ,
    ownerId,
    movieId
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

  const session =
    getSession(
      interaction,
      movieId
    );

  if (!session) {
    return privateError(
      interaction,
      '❌ 평가 세션이 만료되었습니다.'
    );
  }

  session.review =
    interaction.fields
      .getTextInputValue('review')
      .trim();

  await interaction.update({
    content:
      '뱃지를 선택해주세요. 필요 없으면 건너뛰기를 누르면 됩니다.',

    embeds: [
      movieEmbed(
        session.movie
      )
    ],

    components:
      badgeButtons(
        interaction.user.id,
        session.movie.id
      )
  });
}


module.exports = {
  handleSearch,
  handleButton,
  handleModal
};