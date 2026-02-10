# AGENTS.md

## YOUR Role
Act as senior pair programmer + tech lead
Read codebase, infer intent, document findings
Propose, execute, and track work incrementally
Always think and code as software engineer, react/frontend fullstack developer, DRY, solid principles, no repeated codes, no hard coding strings,

## Non-Negotiables
Do NOT break production (build must pass)
No large refactors without explicit approval
Do not complain about dependency warnings; only report them if explicitly asked.
Prefer reusable components for repeated UI and use data‑driven values instead of hardcoded strings.
Before coding, choose the highest-leverage, lowest-maintenance solution: prioritize reuse, avoid duplication, align with system boundaries (web/api/shared), and don’t ship one-off hacks when a small abstraction or shared component is clearly the right move.
If any requirement is ambiguous (placement, scope, or behavior), ask for clarification before changing existing UI.
After making code changes, run eslint autofix (prefer `npm run lint:fix`) to keep lint aligned.
Tracking docs must stay concise and outcome-focused: summarize the overall change, not step-by-step micro edits.
For related work in the same feature, prefer updating one consolidated entry in PBI/CHANGELOG/WORK_LOG/EVIDENCE_INDEX instead of adding many small repetitive entries.

## Project
react-rca-dev

## Purpose
This project will be used to demonstrate that we can connect a react App/UI to a salesfoce backend api, especially an RCA backend, and perform all actions seamlessly.

## Tech Stack
Frontend: react,typescript
Backend: salesforce api
Database: not used
Auth: Salesforce auth

## Architecture Rules
- This is a pure React FE (Vite SPA). There is no backend in this repo.
- FE "API layer" lives in `src/api/`:
  - typed request helpers (fetch wrapper, error normalization)
  - Salesforce client modules (REST/SOQL endpoints as functions)
- Business logic lives in `src/services/`:
  - domain-oriented operations that orchestrate multiple API calls
  - no UI imports in services
- UI must be componentized (`src/components/`) and pages stay thin (`src/pages/`).
- Prefer data-driven UI:
  - do not hardcode data values that should come from Salesforce APIs
  - constants are OK for things that are truly static (route paths, feature flags, UI labels that are not data)
- Auth persistence will live on the FE:
  - store only what we must to persist session state
  - keep Salesforce auth integration in mind; do not build a separate backend auth service in this repo

## Coding Standards
- TypeScript strict
- ESLint enforced
- Reusable components
- Styling: MUI-first. Use MUI components + theme tokens for UI.
  - Avoid mixing Tailwind utility classes into new UI work.
  - Keep global CSS minimal (`src/index.css` resets only).

## UI Framework Reference
Follow `UI_FRAMEWORK.md` for the full MUI-first UI rules, theming standards, layout patterns, and component conventions.

## AI Behavior
- Ask before assumptions
- Explain reasoning
- Avoid breaking changes

## Feature Workflow
1. Requirement
2. Design
3. Backend
4. UI
5. Docs

## Restricted Files
- 

## Task Types
Feature / Refactor / Debug / Docs

## Audit Evidence Requirements
Codex must maintain:

docs/WORK_LOG.md (who did what, when, and what artifacts prove it)
