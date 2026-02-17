# Project Memory — Pink Pong Bracket Bash

## Last Updated
2026-02-17

## Recent Changes

### feat: convert to local server (2026-02-17)

Replaced Supabase cloud backend with a fully local Express + SQLite + Socket.IO stack so the app runs entirely offline on a local network.

| # | Task | Status |
|---|------|--------|
| 1 | Created `server/db.js` — SQLite database with tables for participants, teams, matches, tournament_state; all bracket logic (shuffle, team generation, assignment) moved here | Done |
| 2 | Created `server/index.js` — Express REST API + Socket.IO for real-time broadcasting + serves built frontend in production | Done |
| 3 | Created `src/lib/api.ts` — Frontend API client (fetch-based, replaces Supabase client) | Done |
| 4 | Created `src/hooks/useSocket.ts` — Socket.IO hook for real-time updates across devices | Done |
| 5 | Updated `SignUpForm.tsx` — uses local API instead of Supabase | Done |
| 6 | Updated `ParticipantsList.tsx` — uses local API + Socket.IO for live updates | Done |
| 7 | Updated `TournamentBracket.tsx` — uses local API + Socket.IO for live updates | Done |
| 8 | Updated `Index.tsx` — uses local API, removed missing hero image import | Done |
| 9 | Updated `bracketUtils.ts` — logic moved to server, file kept as thin re-export | Done |
| 10 | Updated `package.json` — removed `@supabase/supabase-js`, `lovable-tagger`; added `express`, `better-sqlite3`, `socket.io`, `socket.io-client`, `concurrently` | Done |
| 11 | Updated `vite.config.ts` — added proxy for `/api` and `/socket.io` to backend during dev, removed lovable-tagger plugin | Done |
| 12 | Updated `.gitignore` — added `tournament.db` | Done |

### chore: repo cleanup (2026-02-16) — commit `5a11e31`

Cleaned up the repository for public release:

| # | Task | Status |
|---|------|--------|
| 1 | Deleted `gh-installer.msi` and `gh.zip` (installer artifacts) | Done |
| 2 | Updated `.gitignore` — added `dist/`, `node_modules/`, `.env`, `*.msi`, `*.zip` | Done |
| 3 | Replaced `.env` (contained real Supabase credentials) with `.env.example` using placeholder values | Done |
| 4 | Removed `.claude/` directory from git tracking and deleted it | Done |
| 5 | Confirmed `dist/` and `node_modules/` were already untracked | Done |
| 6 | Updated README `Setup` section | Done |
| 7 | Committed all changes as `chore: repo cleanup` | Done |

## Notes / Gotchas
- The old `.env` file had **real Supabase credentials** in git history. Consider running `git filter-repo` or BFG Repo-Cleaner to scrub them if making the repo fully public.
- `bin/` and `LICENSE` exist as untracked files — not yet committed.
- Shell is **PowerShell on Windows** — heredoc (`<<EOF`) syntax does not work; use `"$(cat <<'EOF' ... EOF)"` style inside Git Bash or multiple `-m` flags.
- `tournament.db` is auto-created on first server start and gitignored. Delete it to reset all tournament data.
- The server binds to `0.0.0.0` so phones on the same Wi-Fi can connect via the network IP.
- In dev mode, Vite proxies `/api` and `/socket.io` to the Express backend on port 3001.
- In production, the Express server serves the built frontend from `dist/` on port 3001.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS (pink theme)
- **Backend**: Express + better-sqlite3 (SQLite)
- **Real-time**: Socket.IO (server + client)
- **State**: TanStack Query
- **Routing**: React Router DOM

## Architecture
```
[Browser / Phone]
    │
    ├── REST API (fetch)  ──→  Express (port 3001)  ──→  SQLite (tournament.db)
    │                              │
    └── Socket.IO (ws)    ←──  broadcasts changes to all connected clients
```

## Key Scripts
| Command | What it does |
|---------|-------------|
| `npm run dev` | Starts Express backend + Vite dev server (with proxy) concurrently |
| `npm run build` | Builds the React frontend into `dist/` |
| `npm start` | Starts Express in production mode, serves `dist/` + API |

## Branch
`fix/improve-tournament-randomizer` (tracks `origin/fix/improve-tournament-randomizer`)
