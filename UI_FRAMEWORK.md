# UI Framework (MUI-First)

## Goal
Make UI development fast, consistent, and maintainable by following one system for layout, styling, and component usage.

## Primary Decision
This project is **MUI-first**:

- Use **MUI components + MUI theme** for all UI.
- Do **not** use Tailwind utility classes for new UI work (avoid two styling systems and visual drift).
- Keep global CSS minimal (`src/index.css` resets only).

## Non-Negotiables

- All colors/spacing/typography must come from the theme (no random hex values, no one-off font sizes).
- Prefer composition over duplication: create shared components when a pattern appears twice.
- Accessibility is required: keyboard navigation, focus states, proper labels, and semantic components.

## Theme-First Rules

### Theme Location

- `src/theme/theme.ts`: `createTheme()` with palette/typography/shape/spacing.
- `src/theme/components.ts`: component overrides and default props (Button/TextField/AppBar/etc.).

### What Goes Into The Theme

- Palette: `primary`, `secondary`, `error`, `warning`, `info`, `success`, `background`, `text`, `divider`.
- Typography: base font family and sizes for `h1..h6`, `body1`, `body2`, `button`.
- Shape: `shape.borderRadius`.
- Component defaults: standardize Button/TextField/Container/Paper/Card/Chip/Alert, etc.

### What Must NOT Be Done

- No inline styles for colors/spacing unless truly unavoidable (and document why).
- No ad-hoc CSS files for pages. If styling repeats, make a component or a theme override.

## Layout Standards

- Page container: use `Container maxWidth="lg"` (or `xl` if needed).
- Spacing: prefer `Stack spacing={...}` and theme spacing (`sx={{ mt: 2 }}` is acceptable when using theme units).
- Layout primitives: `Box`, `Stack`, `Grid` (only when true grid behavior is needed).
- Responsive: use MUI breakpoints (`sx={{ display: { xs: 'none', md: 'flex' } }}`).

## Component Usage Standards

### Allowed Building Blocks

- `Typography` for text (avoid raw `h1/h2` + custom sizes).
- `Button`, `IconButton`.
- `TextField` + `FormControl` for forms.
- `Card`/`Paper` for grouped UI.
- `Dialog` for modals.
- `Snackbar` for feedback.

### App-Level Wrapper Components (Create When Patterns Repeat)

Create wrappers in `src/components/ui/` when we want strict defaults:

- `AppButton` (default variant/color/size)
- `AppTextField` (default size/fullWidth/consistent helper text)
- `PageHeader` (title + actions)
- `EmptyState`, `ErrorState`, `LoadingState`

Rule: wrappers should be thin and enforce standards, not hide MUI.

## File/Folder Organization (UI)

- `src/components/ui/`: standardized wrappers + reusable UI patterns
- `src/components/`: domain components (ProductCard, CartSummary)
- `src/pages/`: route pages (thin orchestration)
- `src/layout/`: app chrome (Header/Footer/MainLayout)
- `src/theme/`: theme + component overrides

## Styling Rules (How To Style)

- Default styling uses `sx` and theme tokens:
  - `sx={{ bgcolor: 'background.paper', borderColor: 'divider' }}`
- For larger reusable style patterns:
  - move to a component or theme override (do not copy/paste `sx` blocks everywhere).

## Forms Rules

- Always label fields (`label`, `name`, `autoComplete` when applicable).
- Use `helperText` for validation messages consistently.
- Prefer a consistent form layout pattern (e.g., `Stack spacing={2}`).

## States (Required Patterns)

Every data-backed UI must support:

- Loading (skeleton or progress)
- Empty
- Error (with retry)
- Success feedback (snackbar/toast)

Standardize these states with shared components so pages do not reinvent them.

## Icons

- Use `@mui/icons-material` consistently (avoid mixing icon packs).

## "Don't Make Dev Life Hard" Defaults

- Prefer MUI defaults over heavy custom styling.
- Only add variants/overrides when a pattern repeats.
- Keep components small and composable; avoid "god components".

## Checklist for PRs

- Uses MUI components and theme tokens (no Tailwind for new UI)
- Uses standard layout patterns (Container + Stack/Box)
- Accessibility basics covered (labels, focus, keyboard)
- Loading/empty/error states present where applicable

