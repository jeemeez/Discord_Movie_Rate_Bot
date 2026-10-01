const {
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');

const config = require('./config.json');

const commands = [

  new SlashCommandBuilder()
    .setName('영화검색')
    .setDescription('영화를 검색하고 평가합니다.')
    .addStringOption(option =>
      option
        .setName('제목')
        .setDescription('검색할 영화 제목')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('내평가')
    .setDescription('내가 남긴 영화 평가를 확인합니다.'),

  new SlashCommandBuilder()
    .setName('유저평가')
    .setDescription('다른 사용자의 영화 평가를 확인합니다.')
    .addUserOption(option =>
      option
        .setName('사용자')
        .setDescription('평가를 확인할 사용자')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('영화평점')
    .setDescription('영화의 서버 평균 평점을 확인합니다.')
    .addStringOption(option =>
      option
        .setName('제목')
        .setDescription('확인할 영화 제목')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('평가삭제')
    .setDescription('내가 남긴 영화 평가를 삭제합니다.')
    .addStringOption(option =>
      option
        .setName('제목')
        .setDescription('삭제할 영화 제목')
        .setRequired(true)
    )

].map(command => command.toJSON());

const rest = new REST({ version: '10' })
  .setToken(config.token);

(async () => {
  try {

    await rest.put(
      Routes.applicationGuildCommands(
        config.clientId,
        config.guildId
      ),
      { body: commands }
    );

    console.log('✅ Slash Command 등록 완료');

  } catch (error) {
    console.error(error);
  }
})();