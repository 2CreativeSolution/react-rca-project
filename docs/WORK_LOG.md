# Work Log

Keep entries outcome-focused. Prefer updating a single entry per feature/change instead of many micro-entries.

## 2026-02-10

- Added/updated agent guidance and repo hygiene.
  - Artifacts:
    - `AGENTS.md`
    - `package.json` (added `lint:fix`)
    - `docs/WORK_LOG.md`

## 2026-02-11

- Implemented a modern MUI auth flow with an editorial split login/logout shell (brand narrative panel + focused action panel), added Google CTA in login UI (with clear coming-soon notice), introduced email/password credential sign-in with local session persistence, built a full signup page for credential registration, introduced protected blank `/catalog` destination, and redirected post-auth navigation from dashboard to catalog.
  - Artifacts:
    - `src/components/ui/AuthShell.tsx`
    - `src/pages/Login.tsx`
    - `src/pages/Signup.tsx`
    - `src/pages/Logout.tsx`
    - `src/pages/Catalog.tsx`
    - `src/services/localAuth.ts`
    - `src/context/AuthProvider.tsx`
    - `src/context/authTypes.ts`
    - `src/pages/OAuthCallback.tsx`
    - `src/components/Header.tsx`
    - `src/App.tsx`
    - `src/auth/salesforceConfig.ts`

- Hardened auth session modeling for dual-login support by adding explicit auth method persistence alongside a single session token, introduced a global app-wide notification provider (replacing page-level snackbars), added an Axios-based API layer for Salesforce integration calls, and aligned product loading to service boundaries while clearing stale catalog data after failed loads.
  - Artifacts:
    - `src/context/AuthProvider.tsx`
    - `src/context/authTypes.ts`
    - `src/constants/authStorage.ts`
    - `src/context/NotificationContext.ts`
    - `src/context/NotificationProvider.tsx`
    - `src/context/useNotification.ts`
    - `src/pages/Login.tsx`
    - `src/pages/Signup.tsx`
    - `src/pages/Logout.tsx`
    - `src/pages/OAuthCallback.tsx`
    - `src/pages/ProductLanding.tsx`
    - `src/api/httpClient.ts`
    - `src/api/salesforceClient.ts`
    - `src/services/salesforceApi.ts`
    - `src/App.tsx`

## 2026-02-13

- Replaced local + Salesforce auth flows with Firebase email/password auth, migrated auth context to Firebase session state (`onAuthStateChanged`), removed Salesforce callback/login artifacts, switched integration calls to backend endpoint style with Firebase bearer token authorization, aligned product landing UI/copy with repo standards (MUI-first rendering + centralized page copy constants), implemented a production-ready `/catalog` experience with typed service mapping, responsive cards, toolbar search/filter/sort, summary metrics, robust state handling (loading/error/empty), and catalog details drawer interactions, then elevated `/catalog` to a premium editorial-glass design with stronger visual hierarchy, refined micro-UX, enhanced card/drawer information design, sticky filter controls, and improved empty/error/loading presentation.
  - Artifacts:
    - `src/auth/firebaseClient.ts`
    - `src/context/AuthProvider.tsx`
    - `src/context/authTypes.ts`
    - `src/pages/Login.tsx`
    - `src/pages/Signup.tsx`
    - `src/pages/Logout.tsx`
    - `src/pages/ProductLanding.tsx`
    - `src/constants/productContent.ts`
    - `src/components/catalog/CatalogToolbar.tsx`
    - `src/components/catalog/CatalogStats.tsx`
    - `src/components/catalog/CatalogCard.tsx`
    - `src/components/catalog/CatalogDetailsDrawer.tsx`
    - `src/components/catalog/styles.ts`
    - `src/services/catalog/types.ts`
    - `src/services/catalog/catalogService.ts`
    - `src/pages/Catalog.tsx`
    - `src/routes/ProtectedRoute.tsx`
    - `src/services/salesforceApi.ts`
    - `src/api/integrationClient.ts`
    - `src/constants/authContent.ts`
    - `src/constants/routes.ts`
    - `src/App.tsx`
    - `package.json`

- Built a modern baseline `/settings` experience with read-only account profile, session controls, app info links, and in-page password reset delivery using Firebase Auth service orchestration via context so reset behavior is reusable across UI flows; then aligned the settings UI to MUI theme-token standards (removed hardcoded color values) and extracted reusable settings section/field components to keep the page thin.
  - Artifacts:
    - `src/pages/UserSettings.tsx`
    - `src/components/settings/ReadOnlyField.tsx`
    - `src/components/settings/SettingsSectionCard.tsx`
    - `src/context/AuthProvider.tsx`
    - `src/context/authTypes.ts`
    - `src/services/auth/passwordResetService.ts`
    - `src/constants/productContent.ts`

## 2026-02-18

- Refined the products experience to better align with modularity and styling standards by keeping `/products` page logic orchestration-focused, extracting reusable product list/details components, centralizing product field formatters for reuse, and replacing hardcoded visual color values in product cards/dialog with theme-driven styling primitives.
  - Artifacts:
    - `src/pages/ProductLanding.tsx`
    - `src/components/product/ProductList.tsx`
    - `src/components/product/ProductDetailsDialog.tsx`
    - `src/components/product/formatters.ts`

## 2026-02-19

- Implemented persistent RCA sync status tracking (per Firebase user) by extending existing auth storage and centralizing sync attempt handling in auth context, then surfaced sync state and manual retry controls in Settings while wiring Signup/Login to shared sync orchestration so failures persist across sessions until successful retry.
  - Artifacts:
    - `src/services/auth/rcaIdentityStorage.ts`
    - `src/context/authTypes.ts`
    - `src/context/AuthProvider.tsx`
    - `src/pages/Signup.tsx`
    - `src/pages/Login.tsx`
    - `src/pages/UserSettings.tsx`
    - `src/constants/productContent.ts`

- Hardened decision-session persistence by clearing per-user decision state when decision evaluation fails during login and by clearing stored decision data as part of logout/session teardown, preventing stale active/inactive decision status from resurfacing across sessions.
  - Artifacts:
    - `src/pages/Login.tsx`
    - `src/context/AuthProvider.tsx`

- Extended signup orchestration to initialize a default quote immediately after successful RCA identity sync, added typed `createDefaultQuote` API integration, and persisted returned `salesTransactionId` into per-user session state for downstream flows.
  - Artifacts:
    - `src/services/salesforceApi.ts`
    - `src/context/AuthProvider.tsx`
    - `src/context/authTypes.ts`
    - `src/services/auth/rcaIdentityStorage.ts`
    - `src/pages/Signup.tsx`
    - `src/constants/authContent.ts`

- Built Cart v1 from stub with typed cart API integration (fetch/add/edit/remove/place-order), added quote-aware cart loading from `decisionSession.quoteId` without bootstrap/auto-create behavior, implemented ProductLanding add-to-cart in-place (no auto-navigation) with per-product in-flight guards, and surfaced fallback-total warning UX when totals are computed from line quantity × unit price.
  - Artifacts:
    - `src/pages/Cart.tsx`
    - `src/components/cart/CartLineList.tsx`
    - `src/components/cart/CartSummary.tsx`
    - `src/services/salesforceApi.ts`
    - `src/constants/integrationRoutes.ts`
    - `src/pages/ProductLanding.tsx`
    - `src/components/product/ProductList.tsx`
    - `src/constants/productContent.ts`

## 2026-02-20

- Hardened cart/product integration behavior by preventing known-invalid add-to-cart mutations (required `BillingFrequency` for subscription/term/evergreen models, commitment-style short-circuit) while surfacing concise backend validation messages, and aligned cart line parsing with current API response keys (`quoteLineId`, `quoteSubTotal`) so row mutations re-enable when IDs are present.
  - Artifacts:
    - `src/pages/ProductLanding.tsx`
    - `src/constants/productContent.ts`
    - `src/services/salesforceApi.ts`

- Delivered Settings V2 as a user-focused one-page layout (Account, Security & access, RCA sync, Advanced diagnostics, App info), added Firebase Storage-backed profile photo upload/remove flows with strict client validation (JPG/PNG/WebP up to 2MB), and extended auth context/provider interfaces so photo updates persist through Firebase Auth `photoURL`.
  - Artifacts:
    - `src/pages/UserSettings.tsx`
    - `src/context/AuthProvider.tsx`
    - `src/context/authTypes.ts`
    - `src/services/auth/profilePhotoService.ts`
    - `src/auth/firebaseClient.ts`
    - `src/constants/productContent.ts`

- Rewired profile photo persistence from Firebase Storage to browser local storage (per-user key), preserved the same Settings upload/remove UX and validation limits, and added auth-context state so avatars resolve from local data without cloud storage dependency.
  - Artifacts:
    - `src/services/auth/profilePhotoService.ts`
    - `src/context/AuthProvider.tsx`
    - `src/context/authTypes.ts`
    - `src/pages/UserSettings.tsx`
    - `src/auth/firebaseClient.ts`
    - `src/constants/productContent.ts`

- Polished Settings visual hierarchy and spacing by increasing section/field inner padding, adding left-aligned account accent styling, strengthening display-name/email typography, fixing persistent accordion divider behavior, and normalizing app-version pill sizing in App information.
  - Artifacts:
    - `src/pages/UserSettings.tsx`
    - `src/components/settings/SettingsSectionCard.tsx`
    - `src/components/settings/ReadOnlyField.tsx`

- Added checkout flow handoff from Cart using in-memory router state (quote, line items, totals), replaced the Checkout placeholder with a review-only checkout page, introduced billing-information form capture with client-side validation, moved final order submission to Checkout, and modernized the checkout layout with a premium header, responsive billing form grid, and sticky order-review/summary panel while preserving existing behavior.
  - Artifacts:
    - `src/pages/Cart.tsx`
    - `src/pages/Checkout.tsx`
    - `src/constants/productContent.ts`

## 2026-02-23

- Enhanced catalog/product/cart/checkout flows by adding catalog-origin-aware back navigation on Products, expanding Product Details with explicit Description and Attributes sections, showing quote name (with safe fallback) across Cart/Checkout, and restructuring Checkout to support contact + billing/shipping address capture with same-as-billing support, a country dialing-code dropdown before phone input, and synchronized shipping-address state while same-as-billing is enabled.
  - Artifacts:
    - `src/pages/Catalog.tsx`
    - `src/pages/ProductLanding.tsx`
    - `src/components/product/ProductDetailsDialog.tsx`
    - `src/pages/Cart.tsx`
    - `src/pages/Checkout.tsx`
    - `src/services/salesforceApi.ts`
    - `src/constants/productContent.ts`
    - `src/constants/countryDialCodes.ts`

- Implemented async order creation by sending checkout address/contact payload to `/api/createOrdersFromQuote`, added `/api/getOrderStatus` polling with timeout handling on a dedicated Order Status page, and wired status-driven routing (`Processing` stays on status page, `Completed` routes to cart, `Failed` routes back to checkout with preserved state).
  - Artifacts:
    - `src/pages/Checkout.tsx`
    - `src/pages/OrderStatus.tsx`
    - `src/services/salesforceApi.ts`
    - `src/constants/integrationRoutes.ts`
    - `src/constants/routes.ts`
    - `src/constants/productContent.ts`
    - `src/App.tsx`

- Cleaned Product Details label contracts by removing unused `attributeCodeLabel`/`productCodeLabel`/`productIdLabel` keys from page wiring, dialog label typings, and shared copy constants to reduce dead configuration surface while preserving current UI behavior.
  - Artifacts:
    - `src/pages/ProductLanding.tsx`
    - `src/components/product/ProductDetailsDialog.tsx`
    - `src/constants/productContent.ts`

## 2026-02-25

- Extended Product Details with hierarchical child-item visibility by mapping `productComponentGroups`/`childProducts` from Salesforce detail payloads into typed `childItems`, rendering expandable nested rows with quantity in the dialog, and wiring shared labels through product copy constants and page props; documented current dedupe-key limitation as an intentional TODO for follow-up.
  - Artifacts:
    - `src/services/salesforceApi.ts`
    - `src/components/product/ProductDetailsDialog.tsx`
    - `src/pages/ProductLanding.tsx`
    - `src/constants/productContent.ts`

## 2026-03-11

- Completed uncommitted-change review for dashboard/orders additions, confirmed lint/build pass, and documented the current single-account SPA-session assumption directly in dashboard store request-deduping logic to guide future account-switch hardening.
  - Artifacts:
    - `src/store/dashboardStore.ts`

- Upgraded dashboard order-health presentation by replacing snapshot wording with professional section labels and adding an animated Order Status Distribution visualization that grows vertical bars on mount using current in-progress/active/past counts from the dashboard view model, while removing redundant order-health summary cards.
  - Artifacts:
    - `src/components/dashboard/sections.tsx`
    - `src/hooks/useDashboardViewModel.ts`

- Updated AI Insights panel to a static "Coming soon." state and added a subtle animated spark border effect limited to that card.
  - Artifacts:
    - `src/components/dashboard/sections.tsx`
    - `src/pages/Dashboard.tsx`

## 2026-03-12

- Improved Quotes & Assets transparency by surfacing preview-vs-total counts per slide (`Showing X of Y`) and a `+N more` indicator whenever additional records exist beyond the first two shown in the dashboard carousel.
  - Artifacts:
    - `src/hooks/useDashboardViewModel.ts`
    - `src/pages/Dashboard.tsx`
    - `src/components/dashboard/sections.tsx`

## 2026-03-17

- Added a dashboard hero CTA to create a default quote when no active quote exists, reusing existing auth quote-creation flow, refreshing decision state after creation, and redirecting successful creations to cart.
  - Artifacts:
    - `src/pages/Dashboard.tsx`
    - `src/components/dashboard/sections.tsx`
    - `src/constants/productContent.ts`

- Redesigned dashboard activation milestones to use fulfillment-first triage (delayed/overdue-aware ranking), surfaced top actionable fulfillment steps with progress/plan metrics, and replaced AI Insights placeholder content with typed message/priority/type rendering from API data.
  - Artifacts:
    - `src/services/salesforceApi.ts`
    - `src/store/dashboardStore.ts`
    - `src/hooks/useDashboardViewModel.ts`
    - `src/components/dashboard/sections.tsx`
    - `src/pages/Dashboard.tsx`
    - `src/constants/productContent.ts`
