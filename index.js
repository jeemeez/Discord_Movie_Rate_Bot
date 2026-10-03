const {
  Client,
  GatewayIntentBits,
  Events,
  MessageFlags
} = require('discord.js');


const config =
  require('./config.json');


const movie =
  require('./commands/movie');


const rating =
  require('./commands/rating');


const client =
  new Client({

    intents: [
      GatewayIntentBits.Guilds
    ]
  });


// =========================
// Ready
// =========================

client.once(

  Events.ClientReady,

  readyClient => {

    console.log(

      `✅ ${readyClient.user.tag} 실행 완료`
    );
  }
);


// =========================
// Interaction Router
// =========================

client.on(

  Events.InteractionCreate,

  async interaction => {

    try {


      // Slash Command
      if (
        interaction.isChatInputCommand()
      ) {

        if (
          interaction.commandName ===
          '영화검색'
        ) {

          return movie.handleSearch(
            interaction
          );
        }


        return rating.handleCommand(
          interaction
        );
      }


      // Button
      if (
        interaction.isButton()
      ) {

        const type =

          interaction.customId
            .split(':')[0];


        if (

          [
            'stats',
            'ratings',
            'delete'
          ]
            .includes(
              type
            )

        ) {

          return rating.handleButton(
            interaction
          );
        }


        return movie.handleButton(
          interaction
        );
      }


      // Modal
      if (
        interaction.isModalSubmit()
      ) {

        return movie.handleModal(
          interaction
        );
      }


    } catch (error) {

      console.error(
        error
      );


      // 이미 defer한 Interaction
      if (
        interaction.deferred
      ) {

        await interaction.editReply({

          content:
            '❌ 오류가 발생했습니다.',

          components:
            []
        });


        return;
      }


      // 아직 응답하지 않은 Interaction
      if (

        interaction.isRepliable()

        &&

        !interaction.replied
      ) {

        await interaction.reply({

          content:
            '❌ 오류가 발생했습니다.',

          flags:
            MessageFlags.Ephemeral
        });
      }
    }
  }
);


// =========================
// Login
// =========================

client.login(
  config.token
);