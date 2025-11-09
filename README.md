# AI Poster Generator

An AI-assisted poster generation dashboard built with React and Vite. Users can upload creative assets, configure poster settings, and track processing progress until downloadable results are ready.

## Tech Stack

- **Build tooling:** Vite, TypeScript, React, Tanstack Query
- **UI:** React 19, Tailwind CSS, Radix UI primitives, Lucide icons
- **State & data:** Zustand for local workflow state, TanStack Query for API caching & retries, Axios for HTTP
- **Form & validation:** React Hook Form, Zod resolvers
- **Infrastructure:** Designed for Vercel deployment with configurable REST API base URL

## Setup

1. **Install pnpm** (if not already): `npm install -g pnpm`
2. **Install dependencies:** `pnpm install`
3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the values to match the target API environment
4. **Start the dev server:** `pnpm dev`
5. Visit the app at the URL shown in your terminal (defaults to `http://localhost:5173`)

To build for production run `pnpm build`, then preview the static build with `pnpm preview`.

## Project Structure

```
ai-poster-generator/
├── public/                  # Static assets served directly
├── src/
│   ├── api/                 # Axios client config and endpoint helpers
│   ├── components/
│   │   ├── layout/          # App shell and navigation
│   │   ├── poster/          # Poster workflow UI (steps, previews, results)
│   │   └── ui/              # Reusable primitive components
│   ├── hooks/               # Data fetching and job-tracking hooks
│   ├── pages/               # Route-level pages (home, create, gallery, etc.)
│   ├── stores/              # Zustand stores for session state
│   └── mutations/queries/   # React Query mutations and queries
├── .env.example             # Sample environment configuration
├── package.json
└── vite.config.ts
```

## Environment Variables

| Variable              | Description                                     | Default    |
| --------------------- | ----------------------------------------------- | ---------- |
| `VITE_API_BASE_URL`   | REST API base URL used by Axios client          | `base_url` |
| `VITE_API_TIMEOUT`    | Request timeout in milliseconds                 | `30000`    |
| `VITE_RETRY_ATTEMPTS` | Number of retry attempts for transient failures | `3`        |
| `VITE_RETRY_DELAY`    | Delay in milliseconds between retries           | `1000`     |

All variables are optional because sensible defaults exist in `src/api/config.ts`. Provide overrides at runtime when you need to target a different backend or adjust network characteristics.

## Development Workflow Highlights

- **Step-driven poster creation:** `CreatePosterPage` orchestrates upload → settings → processing → results, persisting progress in Zustand (`src/stores/use-job-store.ts`) so users can recover from errors without re-uploading.
- **Hybrid job tracking:** Hooks in `src/hooks` combine SSE streaming when available and polling fallbacks to deliver real-time job updates.
- **Composable UI primitives:** Shared inputs, cards, and layout components live under `src/components`, enabling consistent styling across pages.
