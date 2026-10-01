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
  searchUserRatings,
  deleteRating
} = require('../database/db');


const {
  movieButtons,
  userRatingsEmbed,
  deleteButtons,
  movieEmbed
} = require('../utils/ui');


// =========================
// Slash Command
// =========================

async function handleCommand(
  interaction
) {

  switch (
    interaction.commandName
  ) {


    // =====================
    // 내평가
    // =====================

    case '내평가': {

      const ratings =
        getUserRatings(
          interaction.guildId,
          interaction.user.id
        );


      if (!ratings.length) {

        await interaction.reply({

          content:
            '아직 평가한 영화가 없습니다.',

          flags:
            MessageFlags.Ephemeral
        });

        return;
      }


      await interaction.reply({

        embeds: [
          userRatingsEmbed(
            interaction.user,
            ratings
          )
        ],

        flags:
          MessageFlags.Ephemeral
      });

      return;
    }


    // =====================
    // 유저평가
    // =====================

    case '유저평가': {

      const user =
        interaction.options
          .getUser('사용자');


      const ratings =
        getUserRatings(
          interaction.guildId,
          user.id
        );


      if (!ratings.length) {

        await interaction.reply(
          `🎬 ${user.username}님은 아직 평가한 영화가 없습니다.`
        );

        return;
      }


      await interaction.reply({

        embeds: [
          userRatingsEmbed(
            user,
            ratings
          )
        ]
      });

      return;
    }


    // =====================
    // 영화평점
    // =====================

    case '영화평점': {

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

      return;
    }


    // =====================
    // 평가삭제
    // =====================

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
// 버튼 처리
// =========================

async function handleButton(
  interaction
) {

  const [
    type,
    ownerId,
    movieId
  ] =
    interaction.customId
      .split(':');


  if (
    interaction.user.id !== ownerId
  ) {

    await interaction.reply({

      content:
        '❌ 다른 사용자의 버튼입니다.',

      flags:
        MessageFlags.Ephemeral
    });

    return;
  }


  // =====================
  // 영화 평점 조회
  // =====================

  if (type === 'stats') {

    await interaction.deferUpdate();


    const movie =
      await getMovie(movieId);


    const stats =
      getMovieStats(
        interaction.guildId,
        movie.id
      );


    const total =
      Number(
        stats?.total_count || 0
      );


    if (total === 0) {

      await interaction.editReply({

        content:
          '아직 등록된 평가가 없습니다.',

        embeds: [
          movieEmbed(movie)
        ],

        components: []
      });

      return;
    }


    const ratingCount =
      Number(
        stats.rating_count || 0
      );


    const earthCount =
      Number(
        stats.earth_count || 0
      );


    const embed =
      movieEmbed(movie);


    if (ratingCount > 0) {

      embed.addFields({

        name:
          '서버 평균',

        value:
          `⭐ ${Number(stats.average_rating).toFixed(1)} / 5 (${ratingCount}명)`
      });
    }


    if (earthCount > 0) {

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


    await interaction.editReply({

      content: '',

      embeds: [embed],

      components: []
    });

    return;
  }


  // =====================
  // 평가 삭제
  // =====================

  if (type === 'delete') {

    deleteRating(

      interaction.guildId,

      interaction.user.id,

      movieId
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