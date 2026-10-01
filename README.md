# 🎬 Discord Movie Rating Bot

Discord 서버에서 영화를 검색하고, 별점과 감상평을 기록할 수 있는 영화 평가 봇입니다.

TMDB API를 이용해 영화를 검색하며, 각 Discord 서버별로 사용자 평가를 SQLite에 저장합니다.  
이 저장소는 **봇의 구조와 구현 예시를 공개하기 위한 목적**으로 제공됩니다.

> 현재 개발자가 운영 중인 인스턴스는 **DisHost**에서 호스팅하고 있습니다.  
> 이 저장소에는 별도의 호스팅 서비스나 서버가 포함되어 있지 않으므로, 직접 사용할 경우 실행 환경과 호스팅은 별도로 구성해야 합니다.

---

## 주요 기능

### `/영화검색`
영화 제목을 검색한 뒤 원하는 영화를 선택하여 평가합니다.

- TMDB 기반 영화 검색
- 검색 결과 최대 5개 표시
- 0.5 ~ 5.0점 별점
- 특별 평가 `🌍 지구에게 사죄`
- 감상평 작성
- 선택형 뱃지
  - `🏆 갓영화`
  - `💩 똥영화`

### `/내평가`
본인이 작성한 최근 영화 평가를 확인합니다.

### `/유저평가`
다른 사용자가 작성한 영화 평가를 확인합니다.

### `/영화평점`
특정 영화에 대한 현재 Discord 서버의 평가 통계를 확인합니다.

- 서버 평균 별점
- 일반 별점 평가 인원
- `🌍 지구에게 사죄` 평가 인원
- 전체 평가 인원

### `/평가삭제`
본인이 작성한 영화 평가를 검색하여 삭제합니다.

---

## 기술 스택

- **Node.js**
- **discord.js v14**
- **TMDB API**
- **SQLite (`node:sqlite`)**

---

## 프로젝트 구조

```text
Discord_Movie_Rate_bot/
├─ commands/
│  ├─ movie.js          # 영화 검색 및 평가 흐름
│  └─ rating.js         # 평가 조회, 통계, 삭제
│
├─ database/
│  └─ db.js             # SQLite DB 생성 및 평가 CRUD
│
├─ services/
│  └─ tmdb.js           # TMDB API 요청 및 영화 정보 조회
│
├─ utils/
│  └─ ui.js             # Discord Embed / Button UI
│
├─ deploy-commands.js   # Slash Command 등록
├─ index.js             # Discord Bot 실행 및 Interaction Router
├─ package.json
├─ package-lock.json
└─ .gitignore
```

실행 시 평가 데이터는 다음 위치에 생성됩니다.

```text
data/movie.db
```

`data/*.db` 파일과 `config.json`은 `.gitignore`에 포함되어 GitHub에 업로드되지 않습니다.

---

## 실행 방법

### 1. Repository Clone

```bash
git clone https://github.com/jeemeez/Discord_Movie_Rate_bot.git
cd Discord_Movie_Rate_bot
```

### 2. Dependency 설치

```bash
npm install
```

### 3. `config.json` 생성

프로젝트 루트에 `config.json` 파일을 생성합니다.

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "clientId": "YOUR_DISCORD_APPLICATION_ID",
  "guildId": "YOUR_DISCORD_SERVER_ID",
  "tmdbApiKey": "YOUR_TMDB_API_KEY"
}
```

각 값은 본인의 Discord Application 및 TMDB 계정에서 발급받아야 합니다.

> `config.json`에는 Discord Bot Token과 TMDB API Key가 포함되므로 GitHub에 업로드하지 마세요.

### 4. Slash Command 등록

```bash
node deploy-commands.js
```

현재 Slash Command는 `guildId`에 지정한 Discord 서버에 등록됩니다.

### 5. Bot 실행

```bash
node index.js
```

정상적으로 실행되면 콘솔에 Bot 실행 완료 메시지가 출력됩니다.

---

## Discord Bot 준비

직접 실행하려면 Discord Developer Portal에서 Application과 Bot을 생성해야 합니다.

필요한 정보:

- Discord Bot Token
- Application(Client) ID
- Bot을 사용할 Discord Server(Guild) ID

Bot을 서버에 초대한 뒤 `config.json`에 해당 정보를 입력하고 Slash Command를 등록하면 됩니다.

---

## TMDB API

영화 검색 및 영화 정보는 **TMDB(The Movie Database) API**를 사용합니다.

TMDB API Key를 발급받은 뒤 다음 값에 입력합니다.

```json
{
  "tmdbApiKey": "YOUR_TMDB_API_KEY"
}
```

영화 검색은 한국어(`ko-KR`) 및 대한민국(`KR`) 기준으로 요청합니다.

---

## 데이터 저장 방식

평가 정보는 별도의 외부 DB 서버 없이 로컬 SQLite 파일에 저장됩니다.

```text
data/movie.db
```

평가 데이터에는 다음 정보가 저장됩니다.

- Discord Server ID
- Discord User ID
- TMDB Movie ID
- 영화 제목
- 개봉 연도
- 감독
- 포스터
- 별점 또는 특별 평가
- 감상평
- 뱃지

동일한 서버에서 같은 사용자가 같은 영화를 다시 평가하면 기존 평가가 업데이트됩니다.

---

## Hosting

현재 개발자가 운영 중인 Bot은 **DisHost**를 사용하고 있습니다.

다만 이 Repository는 **Bot 소스 코드와 구조를 보여주기 위한 저장소**이며, 특정 호스팅 환경에 종속되어 있지 않습니다.

직접 Bot을 운영하려는 경우 다음과 같은 환경을 별도로 준비해야 합니다.

- Node.js를 실행할 수 있는 서버 또는 호스팅 서비스
- Discord Bot Token 및 TMDB API Key 관리
- Bot 프로세스 상시 실행
- SQLite 데이터 파일 보존

특히 SQLite를 사용하므로, 재배포 시 파일 시스템이 초기화되는 호스팅 서비스를 사용할 경우 `data/movie.db`가 유지되도록 별도의 영구 저장 공간 또는 백업 방식을 구성해야 합니다.

---

## 참고

이 프로젝트는 개인적인 Discord 영화 평가 기능 구현 및 Bot 구조 예시를 목적으로 제작되었습니다.

Repository를 Clone/Fork하여 사용할 수 있지만, Discord Bot 생성, API Key 발급, Slash Command 등록, 서버 호스팅 및 운영 환경 구성은 사용자가 직접 진행해야 합니다.
