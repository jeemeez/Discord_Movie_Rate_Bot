const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags
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


// 평가 진행 중인 정보
const sessions = new Map();


function sessionKey(interaction) {

  return (
    `${interaction.guildId}:` +
    `${interaction.user.id}`
  );
}


function getSession(
  interaction,
  movieId
) {

  const session =
    sessions.get(
      sessionKey(interaction)
    );


  if (
    !session ||
    String(session.movie.id)
      !== String(movieId)
  ) {

    return null;
  }

  return session;
}


async function privateError(
  interaction,
  message
) {

  await interaction.reply({
    content: message,
    flags: MessageFlags.Ephemeral
  });
}


// =========================
// /영화검색
// =========================

async function handleSearch(interaction) {

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
// Button 처리
// =========================

async function handleButton(interaction) {

  const parts =
    interaction.customId
      .split(':');


  const type =
    parts[0];

  const ownerId =
    parts[1];


  // 다른 사람 버튼 사용 방지
  if (
    interaction.user.id !== ownerId
  ) {

    await privateError(
      interaction,
      '❌ 다른 사용자의 버튼입니다.'
    );

    return;
  }


  // =====================
  // 영화 선택
  // =====================

  if (type === 'movie') {

    const movieId =
      parts[2];


    await interaction.deferUpdate();


    const movie =
      await getMovie(movieId);


    sessions.set(
      sessionKey(interaction),
      {
        movie,
        rating: null,
        review: null
      }
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

    return;
  }


  // =====================
  // 별점 선택
  // =====================

  if (type === 'rate') {

    const movieId =
      parts[2];

    const rating =
      parts[3];


    const session =
      getSession(
        interaction,
        movieId
      );


    if (!session) {

      await privateError(
        interaction,
        '❌ 평가 세션이 만료되었습니다.'
      );

      return;
    }


    session.rating =
      rating;


    const modal =
      new ModalBuilder()

        .setCustomId(
          `review:${ownerId}:${movieId}`
        )

        .setTitle(
          '🎬 감상평 작성'
        );


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


    modal.addComponents(

      new ActionRowBuilder()
        .addComponents(
          reviewInput
        )
    );


    await interaction.showModal(
      modal
    );

    return;
  }


  // =====================
  // 뱃지 선택
  // =====================

  if (type === 'badge') {

    const movieId =
      parts[2];

    const badge =
      parts[3];


    const session =
      getSession(
        interaction,
        movieId
      );


    if (!session) {

      await privateError(
        interaction,
        '❌ 평가 세션이 만료되었습니다.'
      );

      return;
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
          : Number(
              session.rating
            ),

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


    const embed =
      finalRatingEmbed(

        session.movie,

        session.rating,

        session.review,

        badge,

        interaction.user.username
      );


    await interaction.update({

      content:
        '✅ 평가 완료!',

      embeds: [embed],

      components: []
    });


    sessions.delete(
      sessionKey(interaction)
    );

    return;
  }
}


// =========================
// 감상평 Modal
// =========================

async function handleModal(interaction) {

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
    interaction.user.id !== ownerId
  ) {
    return;
  }


  const session =
    getSession(
      interaction,
      movieId
    );


  if (!session) {

    await privateError(
      interaction,
      '❌ 평가 세션이 만료되었습니다.'
    );

    return;
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