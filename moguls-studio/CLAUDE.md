# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies (first time)
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

No lint or test scripts are configured.

## Architecture

**Mogul's Learning Studio** is a single-page academic dashboard built with React 18 + Vite 5 (plain JSX, no TypeScript).

### Data layer
All persistence is client-side via `localStorage`. The `LS` helper in `src/utils.js` wraps `get`/`set` with JSON parsing. Storage keys are prefixed `mls_`:

| Key | Used by |
|---|---|
| `mls_user` | Auth (login/register) |
| `mls_notes` | NotesApp |
| `mls_notes_upload` / `mls_papers_upload` / `mls_results_upload` | UploadCard |
| `mls_tasks` | TaskTracker |
| `mls_pomodoro_sessions` | PomodoroTimer |

There is no backend — auth is purely localStorage-based.

### Navigation
No router. The app is a single scroll page. `Navbar` calls `scrollTo(id)` which uses `document.getElementById(id).scrollIntoView()`. Section IDs match keys in `SITE_SECTIONS` from `utils.js`.

### AI Assistant
`AIAssistant.jsx` calls the Anthropic API **directly from the browser** (`https://api.anthropic.com/v1/messages`) using `claude-sonnet-4-20250514`. This requires an API key to be embedded or provided at runtime.

### Component conventions
- Each component in `src/components/` is paired with a `.module.css` CSS Module of the same name.
- Shared constants (`QUOTES`, `SLIDES`, `SITE_SECTIONS`, `AI_CHIPS`) live in `src/utils.js`.
- Global CSS variables (colors: `--emerald`, `--gold`, `--crimson`, `--mist`) and section layout classes (`.section`, `.section-header`, `.section-title`) are defined in `src/index.css`.
- Typography uses Google Fonts: Playfair Display (headings) + Inter (body).
