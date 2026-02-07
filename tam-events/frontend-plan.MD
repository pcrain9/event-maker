# Frontend Plan — Structured

**Instruction:** When performing frontend-specific tasks for this plan, load/boot the frontend dev persona from .github/agents/senior-frontend-dev.md and follow it strictly.

## 1) Project Summary

- **Goal:** Build a schedule-driven single-page app for TAM with admin CRUD, announcements, and theming.
- **Stack:** React + TypeScript + Vite, React Router, SCSS, Axios.
- **Backend:** FastAPI at http://localhost:8000 (local dev).

## 2) Scope & Routes

- **Public routes:**
  - Home (layout + schedule index)
  - Sponsors
  - Multi-event view (route accepts multiple event IDs and renders returned data)
- **Auth routes:**
  - Login
- **Admin routes (protected):**
  - Admin dashboard (events + event items CRUD)
  - Announcements management
  - Theme color scheme picker

## 3) Component Inventory

- **Layout:** Hero, NavBar, Notifications, Footer, OutboundLink
- **Schedule:** Accordion, EventComponent, Headshot, Cancelled
- **Admin:** CRUD modal, Announcement modal, Theme picker modal

## 4) Data & Types

- **Entities:** Event, EventItem, Speaker, Announcement, ThemeColors
- **Theme schema:**
  - primary, secondary, tertiary, background, alt_background, text, title_text

## 5) Implementation Phases

### Phase 1 — Routing & Shell

**Goal:** App scaffolding with routes and layout shell.

- 1. Confirm scope and routes from frontend-description.MD and finalize route map.
- 2. Implement React Router routes in App.tsx (home layout, index, sponsors, login, admin).
- 2. Implement React Router routes in App.tsx (home layout, index, sponsors, multi-event, login, admin).
- 3. Create layout shell component with hero, notifications, nav, outlet, footer.

### Phase 2 — Core UI Components

**Goal:** Build reusable UI blocks for schedule pages.

- 4. Implement Hero, NavBar, Notifications, Footer, OutboundLink.
- 5. Implement Accordion, EventComponent, Headshot, Cancelled.

### Phase 3 — Data Layer

**Goal:** Solid API access + types.

- 6. Add shared TypeScript types for all entities.
- 7. Normalize api.ts helpers (return promises, error handling, base URL config).
- 8. Implement schedule fetching with loading/empty states.
- 9. Add multi-event route parameter parsing and API request for selected event IDs.

### Phase 4 — Schedule Experience

**Goal:** Render event data into the UI.

- 10. Group event items by day and render accordion schedule.
- 11. Display session details (time, location, sponsor, description, speakers, links).

### Phase 5 — Announcements

**Goal:** Dismissible banners based on backend data.

- 12. Render notifications banner (success/warning/error).
- 13. Add admin announcement modal and CRUD wiring.

### Phase 6 — Authentication & Admin

**Goal:** Login and protected admin area.

- 14. Build login screen and wire login flow.
- 15. Enforce protected admin routes via auth guard.
- 16. Create admin dashboard with events + event items CRUD.
- 17. Build CRUD modal for event items (validation + submit states).

### Phase 7 — Theming & Styling

**Goal:** SCSS + dynamic theme tokens.

- 18. Configure SCSS and a mixin/util library for responsive styling.
- 19. Map backend theme colors to CSS variables.
- 20. Implement admin theme picker and persist changes.

### Phase 8 — Content & Polishing

**Goal:** Sponsors page + UX polish.

- 21. Add sponsors page content and static assets.
- 22. Add global error boundaries and user-friendly error states.
- 23. Add utility hooks (useAuth, useFetch, useTheme).
- 24. Validate accessibility (keyboard, focus, aria).

### Phase 9 — QA & Docs

**Goal:** Test and document the app.

- 25. Create smoke test checklist (routes, login, CRUD, theme).
- 26. Update README with dev setup and environment variables.

## 6) Deliverables Checklist

- Routes implemented
- Layout shell implemented
- Schedule UI implemented
- API layer solidified
- Admin CRUD + modals
- Announcements + theme picker
- SCSS + responsive styles
- Sponsors page
- Accessibility pass
- QA checklist + docs
