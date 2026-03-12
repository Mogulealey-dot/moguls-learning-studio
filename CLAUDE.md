# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Rule
**Always push to the GitHub repository after every change.** The site is hosted and deployed directly from this repo (`https://github.com/Mogulealey-dot/moguls-learning-studio`).

## Commands

```bash
npm install       # Install dependencies (first time)
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

No lint or test scripts are configured.

## Architecture

**Mogul's Learning Studio** is a multi-studio academic dashboard built with React 18 + Vite 5 (plain JSX, no TypeScript), backed by Firebase (Auth + Firestore + Storage).

### Entry points
- `src/main.jsx` → mounts `Root`
- `src/Root.jsx` → handles auth state, routes between `AuthScreen`, `LandingPage`, `FinanceStudio` (App.jsx), and `GenericStudio`
- `src/LandingPage.jsx` → dashboard grid of all studio cards
- `src/App.jsx` → the Finance studio (legacy, standalone)

### Studios
- `src/studioConfigs.js` — config object for every non-finance studio (id, name, icon, color, AI prompt, subjects, nav links, ToolsComponent)
- `src/studios/GenericStudio.jsx` — shell that renders any studio from its config
- `src/studios/*Tools.jsx` — subject-specific tool panels (one per studio)

### Data layer
All user data is cloud-synced via Firestore using `useUserData(key, default)` from `src/hooks/useUserData.js`. Data is stored at `users/{uid}/data/{key}`. Common keys are prefixed `mls_`:

| Key | Used by |
|---|---|
| `mls_hidden_studios` | LandingPage — hidden studio IDs |
| `mls_studio_visits` | LandingPage — visit counts per studio (used for card ranking) |
| `mls_tasks` | TaskTracker |
| `mls_pomodoro_sessions` | PomodoroTimer |
| `mls_notes` | NotesApp |
| `mls_notes_upload` / `mls_papers_upload` / `mls_results_upload` | UploadCard |

File uploads go to Firebase Storage at `users/{uid}/{storageKey}/{id}_{filename}`.

### Studio card ranking
`LandingPage` sorts visible studio cards by `mls_studio_visits` descending. Visit count increments each time the user clicks "Enter Studio →".

### Component conventions
- Each component in `src/components/` is paired with a `.module.css` CSS Module of the same name.
- Global CSS variables (`--emerald`, `--gold`, `--crimson`, `--mist`, `--cream`, `--ink`) and layout classes (`.section`, `.section-header`, `.section-title`) are in `src/index.css`.
- Typography: Playfair Display (headings), DM Sans (body), DM Mono (code/filenames) — loaded from Google Fonts.
