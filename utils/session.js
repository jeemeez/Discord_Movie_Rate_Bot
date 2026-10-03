// 평가 진행 중인 사용자별 세션
const sessions = new Map();


// =========================
// 세션 Key
// =========================

function sessionKey(interaction) {
  return `${interaction.guildId}:${interaction.user.id}`;
}


// =========================
// 세션 생성
// =========================

function setSession(
  interaction,
  movie
) {
  const session = {
    movie,
    rating: null,
    review: null
  };

  sessions.set(
    sessionKey(interaction),
    session
  );

  return session;
}


// =========================
// 세션 조회
// =========================

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
    String(session.movie.id) !==
      String(movieId)
  ) {
    return null;
  }

  return session;
}


// =========================
// 세션 삭제
// =========================

function clearSession(
  interaction,
  movieId
) {
  const session =
    getSession(
      interaction,
      movieId
    );

  if (!session) {
    return false;
  }

  sessions.delete(
    sessionKey(interaction)
  );

  return true;
}


module.exports = {
  setSession,
  getSession,
  clearSession
};