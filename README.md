# React RCA (Ecommerce Case Study)

Pure React (Vite) frontend that demonstrates building an ecommerce-style UI while consuming Salesforce backend APIs (no backend in this repo).

## Quick Start

```sh
npm install
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

## Scripts

```sh
npm run dev
npm run lint
npm run lint:fix
npm run build
npm run preview
```

## Project Rules (Read These First)

- Agent/development rules: `AGENTS.md`
- UI standardization (MUI-first): `UI_FRAMEWORK.md`

## Architecture (High Level)

- This is a **client-only** app. It will consume Salesforce APIs directly.
- Routing is defined in `src/App.tsx`.
- Auth is currently a stub (`src/context/*`) and will evolve to Salesforce auth + persistence.
- UI should follow the MUI-first conventions in `UI_FRAMEWORK.md`.

## Folder Structure

Key folders/files:

- `src/pages/`: route pages (thin)
- `src/components/`: reusable UI and domain components
- `src/layout/`: app chrome (header/footer/layout)
- `src/context/`: app state (auth)
- `src/routes/`: route utilities (e.g. `ProtectedRoute`)

Planned (to be added as features are built):

- `src/api/`: typed API client layer (Salesforce requests, error normalization)
- `src/services/`: business logic layer (orchestration, no UI imports)

## Notes

- If you add a new UI pattern more than once, it should become a shared component or a theme override (see `UI_FRAMEWORK.md`).
- Keep the app data-driven (avoid hardcoding values that should come from APIs).
