const {
  MessageFlags
} = require('discord.js');


// =========================
// 개인 오류 메시지
// =========================

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
// 버튼 사용자 확인
// =========================

async function checkOwner(
  interaction,
  ownerId
) {
  if (
    interaction.user.id === ownerId
  ) {
    return true;
  }

  await privateError(
    interaction,
    '❌ 다른 사용자의 버튼입니다.'
  );

  return false;
}


// =========================
// 서버 닉네임 조회
// =========================

async function getDisplayName(
  interaction,
  userId
) {
  // 캐시 우선
  const cached =
    interaction.guild
      ?.members
      .cache
      .get(userId);

  if (cached) {
    return cached.displayName;
  }

  // 서버 Member 조회
  try {
    const member =
      await interaction.guild
        .members
        .fetch(userId);

    return member.displayName;

  } catch {
    // 서버에서 찾을 수 없는 경우 Discord User 조회
    try {
      const user =
        await interaction.client
          .users
          .fetch(userId);

      return (
        user.globalName ||
        user.username
      );

    } catch {
      return '알 수 없는 사용자';
    }
  }
}


module.exports = {
  privateError,
  checkOwner,
  getDisplayName
};