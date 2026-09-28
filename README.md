# PixelGen

PixelGen is an original, cozy social browser world inspired by the feeling of classic virtual-world games. This repository is being built in integrated, playable milestones—not as a one-shot mockup.

## Current milestone: playable plaza prototype

The first increment is a dependency-free browser client with a hand-built pixel-art plaza. It includes a manual **light/dark theme switch** (saved on the device), responsive mobile camera zoom, keyboard/click movement, a four-step walk cycle, idle breathing, wave/dance poses, demo residents, emotes, and local demo chat. The plaza currently runs locally in one browser; accounts, persistence, and network multiplayer are future milestones and are not represented as working features yet. The scene and sprites are still prototype art, not the final production asset pack.

## Run locally

Requires Node.js 20 or newer. No package installation is needed for the current prototype.

```sh
npm run dev
```

Open the local address printed by the server (default `http://localhost:4173`). Run checks with:

```sh
npm test
npm run check
```

## Project map

- `apps/web/` — browser game and interface
- `scripts/` — local development server
- `tests/` — fast unit tests for movement and collision rules
- `docs/ROADMAP.md` — integrated build plan
- `.env.example` — names of future local configuration values; contains no secrets

## Product principles

- Original characters, art, names, and world; no copied game assets.
- The server will be authoritative for movement, currency, inventory, rewards, and trades.
- Safety comes before social scale: block, mute, report, rate limits, and auditable moderator actions.
- Each milestone must run, pass tests, and integrate with the existing application before the next one begins.
