# Arcade Hub v2

Arcade Hub is a browser arcade with 20+ mini-games, account login, shared scores, rankings, followers, chat, responsive layouts, and a camera Photo Booth.

## What is included
- Username + 4-8 digit PIN accounts
- Duplicate usernames rejected case-insensitively
- Login from another device using the same username/PIN
- Shared player API and shared leaderboard
- Overall, per-game, and game-type rankings
- Designed 1st/2nd/3rd rank badges without emoji UI
- People/follow system
- Global text chat
- Optional browser speech-to-text mic button in chat
- Responsive desktop/tablet/phone layout
- Existing 20+ games retained
- Redesigned Photo Booth with in-page camera preview, image upload, live filters, and four-photo strip
- SVG game artwork so the cards are picture-based rather than emoji-only

## Render
Build command: `npm install`
Start command: `node server.js`

The server listens on `process.env.PORT` and serves the frontend and API from the same service.

## Important production note
The included JSON store is a working prototype store. It is shared by all visitors while the server instance has the file, but Render's normal service filesystem is not a permanent database. For permanent global accounts/scores/chat/follows, the next step is moving the data layer to a managed database such as Supabase.

Render linked GitHub services normally redeploy when the connected branch receives a new commit.

## Next upgrade
Supabase can later provide durable Postgres data, authentication including Google sign-in, realtime chat, and photo storage. Keep secret database/service keys server-side; never put them in frontend JavaScript.
