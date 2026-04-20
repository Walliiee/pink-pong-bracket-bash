# 🎉 Pink Pong — Birthday Beer Pong Tournament

**The ultimate beer pong tournament bracket manager.** Sign up, get randomly paired with a teammate, and battle through a single-elimination bracket for glory.

---

## 📸 Screenshots

> **Add a screenshot here** — a bracket mid-tournament or the hero landing page works great.

---

## ✨ Features

- **Player Registration** — Collect name, age, and a fun descriptor from each participant
- **Random Team Pairing** — Automatically shuffles players into teams of 2 with one click
- **Single-Elimination Bracket** — Visual bracket that updates in real-time as matches complete
- **Match Management** — Track winners and advance teams through rounds (Quarter-Final → Semi-Final → Final)
- **Graceful Empty States** — Clear prompts guide users through each stage of the tournament
- **Responsive Design** — Works on desktop and mobile so everyone can follow along

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Backend | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime) |
| State | [TanStack Query](https://tanstack.com/query/latest) |
| Routing | [React Router](https://reactrouter.com/) |

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-Enabled-3ECF8E?logo=supabase&style=flat-square)

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/Walliiee/pink-pong-bracket-bash.git
cd pink-pong-bracket-bash

# Install dependencies
npm install

# Configure Supabase (see below)
# Then start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/`
3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

4. Restart the dev server

---

## 📋 Tournament Flow

1. **Registration** — Players sign up with their name, age, and a fun descriptor
2. **Team Generation** — Hit "Generate Teams" to randomly pair players into teams of 2
3. **Bracket Creation** — The single-elimination bracket is generated automatically
4. **Match Play** — Teams compete; mark the winner to advance them through the bracket
5. **Winner** — The last team standing takes the trophy 🏆

---

## 📁 Project Structure

```
src/
├── components/
│   ├── SignUpForm.tsx        # Player registration form
│   ├── ParticipantsList.tsx # View & manage participants, generate teams
│   └── TournamentBracket.tsx # Visual bracket display
├── context/
│   └── TournamentContext.tsx # Global tournament state
├── hooks/
│   └── use-tournament.ts     # Tournament logic hooks
├── lib/
│   └── types.ts              # TypeScript type definitions
└── pages/
    └── Index.tsx             # Main landing page
```

---

## 📄 License

MIT — use it, remix it, make it your own.

---

_Built with ❤️ for birthday beer pong tournaments._
