# Pink Pong - Birthday Tournament

A beer pong tournament management system with random team pairing and single-elimination brackets.

## Features

- **Player Registration** - Sign up participants for the tournament
- **Random Team Pairing** - Automatically pairs players into teams of 2
- **Tournament Bracket** - Single-elimination bracket with real-time updates
- **Match Management** - Track match results and tournament progress

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd pink-pong-bracket-bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your Supabase credentials:
   - `VITE_SUPABASE_PROJECT_ID` — your Supabase project ID
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase anon/public key
   - `VITE_SUPABASE_URL` — your Supabase project URL (e.g. `https://<project-id>.supabase.co`)

3. **Set up the database**:
   - Create a new [Supabase](https://supabase.com) project
   - Run the migrations in `supabase/migrations/` against your project

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Database Schema

- **participants** - Tournament players
- **teams** - Auto-generated player pairs
- **matches** - Tournament bracket matches
- **tournament_state** - Tournament status and progress

## Tournament Flow

1. **Registration** - Players sign up
2. **Team Generation** - Random pairing into teams
3. **Bracket Creation** - Single-elimination tournament
4. **Match Play** - Teams compete through rounds
5. **Winner** - Last team standing wins

Built with ❤️ for birthday beer pong tournaments!