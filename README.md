# Arcade Hub v2

Arcade Hub is a browser arcade with 46 mini-games and two creative tools, account login, shared scores, rankings, followers, chat, responsive layouts, and a camera Photo Booth.

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
- All existing games retained
- Invite-code online play for Jenga, Tic-Tac-Toe, Rock-Paper-Scissors and Photo Booth on separate devices
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

Online invite rooms support Jenga, Tic-Tac-Toe, Rock-Paper-Scissors and the two-player Photo Booth. Both players need accounts on the same hosted Arcade site; one creates a room and shares its six-character code, and the other joins with that code.

Render linked GitHub services normally redeploy when the connected branch receives a new commit.

The personal chat view refreshes messages while it is open. Photo capture uses the browser's camera permission or an uploaded image; images stay in the browser and are not uploaded to the server.

## Cute arcade restoration

- Rabbit Mochi is free; unlock Cat (80 diamonds) or Puppy (100 diamonds), then equip them in Shop. Six accessory choices include a blinking, bobbing companion wearing a party hat. Equipment syncs with the account. Purchases equip the cosmetic in the same transaction.
- Daily check-in: 3 diamonds plus 10–45 coins. Each completed daily task: 2 diamonds plus its listed coins.
- Games: 2 coins per completed round, 1 per 20 points, 10 per win, and 20 per unlocked level, capped at 500 coins per reward claim. Saved score checkpoints prevent duplicate reward claims. This casual arcade uses client-reported scores; rewards are not suitable for real-money purchases or competitive anti-cheat guarantees.
- Lucky box: 30 coins; 80% chance of 10–50 coins, 20% chance of 1–3 diamonds. The shop displays these odds.
- Snake and Flappy offer one 25-coin revive per run, retaining the score; finishing saves the result and offers Play again or Exit.
- Tic-Tac-Toe, RPS, Ludo, Chess, Snakes & Ladders, Pong, Candy Breaker and 2048 use scores without level selection. Snake, Flappy and Match 3 retain progression.
- Photo Booth includes colour filters, draggable bunny/kitty ears, image upload and downloadable strips. All 48 games/tools and chat remain available.

**Deployment:** The shop works with existing Supabase account tables, including databases without the optional wallet columns. Account extras are stored in a private `_arcade` envelope inside the existing `stats` JSON column; that envelope is removed from public scores. Existing wallet columns and earlier `daily._arcade` data remain readable, and updated values take priority. The full `SUPABASE_SCHEMA.sql` is available for new installations; the shop does not require a manual migration. Without Supabase, set `DATA_FILE` to a persistent disk path for durable local storage.

Validation: `node --test tests/*.cjs` runs storage compatibility checks and the isolated wallet integration test using Node's built-in test runner and a temporary local server on an available port.

Game cards and wardrobe previews use original SVG illustrations from `public/cute-art.js`, with blush, soft colours and gentle movement. The shop includes Pets, Dress up, Themes and My items categories.

## Cozy game interiors and stability

- Jenga has illustrated pastel blocks, a living room scene, and invite-code play for two. Players alternate pulls; a layer with a single edge support tips the tower, while a centre support stays balanced. The roof and foundation stay in place. Online Jenga uses a discriminator in the room state and an existing allowed storage slot, so existing room-table constraints do not need a SQL migration.
- Burger Chef serves animal customers at a café counter and builds a visible layered dish on the tray. Boba Builder shows the tea, flavour, ice and toppings in both the requested drink and your cup.
- The multiplayer lounge has illustrated game choices and player seats. Chat has timed bubbles, quick stickers, saved conversation drafts and updates that preserve your place in the conversation.
- Four new games: **Cloud Hop** (endless distance runner), **Jelly Stack** (endless timing game), **Star Trail** (constellation levels), and **Mochi’s Garden** (plant, water and harvest levels). All save scores and earn the existing game rewards. Endless games use scores without level selectors.
- Leaving or replaying a game cancels its timers, animation callbacks and keyboard listeners. Leaving Photo Booth releases the camera. Background score updates preserve the active screen, typed text and invite controls. Room moves are serialized in the UI and conditional room updates reject conflicting writes.

Checks: `node --test tests/*.cjs` covers economy/storage, old multiplayer modes, Jenga moves and conflicts, chat privacy, the new game reward contracts, and game callback cleanup. Visual and interaction checks use the browser at phone and desktop sizes. Production deployment and a real Supabase connection must be verified separately.

## A toy-box aesthetic and Mochi Café

All 48 games and creative tools share illustrated title badges, soft board materials and rounded controls. Board pieces, matching candies, potion layers, memory cards and rhythm pads have their own toy details. Snake, Bubble Pop, Bird Launch and Turbo Racer include illustrated playfields; Hangman uses a bunny with seven guess balloons. Colour clues remain distinct, and reduced-motion preferences are respected.

**Mochi Café** is a separate cooking game: read an animal customer’s recipe, mix ingredients, brew the drink, choose the pastry, and serve. Incorrect orders cost hearts; complete the shift before closing to unlock the next level. Later shifts introduce more recipes and customers. Scores, coins, daily activities and replay use the existing arcade systems. Brewing and countdown callbacks are cancelled when leaving the café.
