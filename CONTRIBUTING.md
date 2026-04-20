# Contributing to Pink Pong

Thanks for wanting to contribute! Here's how to get set up and ship changes.

## Prerequisites

- Node.js 18+
- npm 9+

## Local Setup

```bash
# Clone the repo
git clone https://github.com/Walliiee/pink-pong-bracket-bash.git
cd pink-pong-bracket-bash

# Install dependencies
npm install

# Create your .env file with Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Supabase Setup (for backend features)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migrations in `supabase/migrations/`
3. Add your credentials to `.env`
4. Restart the dev server

## Development Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Branching Strategy

1. Create a feature branch: `git checkout -b feat/your-feature-name`
2. Make your changes — keep PRs small and focused
3. Run `npm run lint` and `npm run build` to verify before pushing
4. Open a PR against `main`

## Code Style

- Use TypeScript — avoid `any`
- Prefer functional components with hooks
- Use `cn()` from `@/lib/utils` for Tailwind class merging
- No magic numbers; extract constants

## PR Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] New features have corresponding documentation updates
- [ ] README / screenshots updated if UI changed

## Questions?

Open an issue — happy to help!
