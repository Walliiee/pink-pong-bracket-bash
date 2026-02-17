# Pink Pong - Birthday Tournament

A beer pong tournament management system with random team pairing, single-elimination brackets, and real-time updates across devices.

## Features

- **Player Registration** - Sign up participants for the tournament
- **Random Team Pairing** - Automatically pairs players into teams of 2 (Fisher-Yates shuffle)
- **Tournament Bracket** - 16-team single-elimination bracket with left/right sides
- **Real-time Updates** - All connected devices see changes instantly via Socket.IO
- **Mobile Friendly** - Share the network URL so friends can join from their phones

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Express + SQLite (better-sqlite3)
- **Real-time**: Socket.IO
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## Quick Start

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd pink-pong-bracket-bash
   npm install
   ```

2. **Run in development mode** (with hot-reload):
   ```bash
   npm run dev
   ```
   This starts the backend server (port 3001) and the Vite dev server (port 8080).
   Open `http://localhost:8080` in your browser.

3. **Run in production mode** (for the actual event):
   ```bash
   npm run build
   npm start
   ```
   The server will print two URLs:
   - `http://localhost:3001` — for your own browser
   - `http://<your-ip>:3001` — share this with people on the same Wi-Fi

## Connecting from Phones

When running `npm start`, the terminal shows a **Network URL** like `http://192.168.1.42:3001`. Anyone on the same Wi-Fi network can open that URL on their phone to:

- Sign up as a participant
- See the live tournament bracket
- Watch updates in real-time as teams are generated and matches progress

## Project Structure

```
pink-pong-bracket-bash/
├── server/
│   ├── index.js          # Express server, API routes, Socket.IO
│   └── db.js             # SQLite database, bracket logic
├── src/
│   ├── main.tsx           # App entry point
│   ├── App.tsx            # Root component with routing
│   ├── index.css          # Global styles & pink theme
│   ├── pages/
│   │   └── Index.tsx      # Main tournament page
│   ├── components/
│   │   ├── SignUpForm.tsx          # Participant registration
│   │   ├── ParticipantsList.tsx    # Player list + team generation
│   │   ├── TournamentBracket.tsx   # Bracket visualization
│   │   └── ui/                     # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts         # REST API client
│   │   └── utils.ts       # Utility functions
│   └── hooks/
│       ├── useSocket.ts   # Socket.IO real-time hook
│       └── use-toast.ts   # Toast notifications
├── package.json
├── vite.config.ts
└── tournament.db          # Auto-created SQLite database (gitignored)
```

## Database

The app uses a local SQLite database (`tournament.db`) that is automatically created on first run. It contains four tables:

- **participants** - Player info (name, age, description)
- **teams** - Auto-generated player pairs
- **matches** - Tournament bracket matches (4 rounds, 15 matches)
- **tournament_state** - Tournament status and progress

To reset the tournament, simply delete `tournament.db` and restart the server.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/participants` | List all participants |
| POST | `/api/participants` | Register a new participant |
| DELETE | `/api/participants/:id` | Remove a participant |
| GET | `/api/matches` | List all matches (with team/player data) |
| POST | `/api/matches/initialize` | Initialize the bracket structure |
| GET | `/api/tournament-state` | Get current tournament state |
| PATCH | `/api/tournament-state` | Update tournament state |
| POST | `/api/tournament/generate-teams` | Regenerate all teams and bracket |

## Tournament Flow

1. **Registration** - Players sign up via the form (from any device)
2. **Team Generation** - Admin clicks "Generate Teams" to randomly pair players
3. **Bracket Populated** - Teams are randomly assigned to bracket positions
4. **Match Play** - Teams compete through 4 rounds of single elimination
5. **Winner** - Last team standing wins

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + Vite dev server (hot-reload) |
| `npm run build` | Build the frontend for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

Built with love for birthday beer pong tournaments!
