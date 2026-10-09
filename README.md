# Arcade Hub v2

Arcade Hub is a browser arcade with 20+ mini-games, account login, shared scores, rankings, followers, chat, responsive layouts, and a camera Photo Booth.

## What is included
- Username + 4-8 digit PIN accounts
- Duplicate usernames rejected case-insensitively
- Login from another device using the same username/PIN
- Shared player API and shared leaderboard
- Overall, per-game, and game-type rankings
- Designed 1st/2nd/3rd rank badges without emoji UI
- Achievement badges for milestones and daily streaks
- People/follow system
- Global and one-to-one text chat, refreshed while open
- Optional browser speech-to-text mic button in chat
- Responsive desktop/tablet/phone layout
- Existing 20+ games retained
- Invite-code online play for Tic-Tac-Toe and Rock-Paper-Scissors on separate devices
- Daily check-in streaks, three daily challenges, earnable coins, and a cosmetic theme shop
- Photo Booth with camera/upload, additional color looks, dog and cat overlays, fog, caption-writing overlay, and downloadable four-photo strips
- SVG game artwork so the cards are picture-based rather than emoji-only

## Render
Build command: `npm install`
Start command: `node server.js`

The server listens on `process.env.PORT` and serves the frontend and API from the same service.

## Supabase setup for durable online play

The server uses Supabase when both `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) are configured. Before deploying this version against an existing Supabase project, run the updated `SUPABASE_SCHEMA.sql` in the Supabase SQL Editor. It adds the wallet, streak, daily progress, owned themes, and private room storage. Keep the Supabase secret key on the server only.

Without Supabase, the app uses a local JSON prototype store. It supports trying the features on one running server instance, but Render's normal filesystem is not permanent; accounts, messages, coins, and online rooms may disappear when that instance restarts. Configure Supabase for persistent cross-device play.

Online invite rooms currently support Tic-Tac-Toe and Rock-Paper-Scissors. Both players need accounts on the same hosted Arcade site; one creates a room and shares its six-character code, and the other joins with that code.

Render linked GitHub services normally redeploy when the connected branch receives a new commit.

The personal chat view refreshes messages while it is open. Photo capture uses the browser's camera permission or an uploaded image; images stay in the browser and are not uploaded to the server.
