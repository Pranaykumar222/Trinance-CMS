# Trinance CMS

An internal **editorial CMS** for the Trinance financial-newsletter platform — think
Beehiiv, tailored for a finance publisher and optimised for speed: a new employee should be
able to create and publish a newsletter in under five minutes.

Built with **React + TypeScript + Vite + Tailwind CSS** and shadcn/ui-style components.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build      # type-check + production build to /dist
npm run preview    # preview the production build
npm run typecheck  # tsc --noEmit
```

On the login screen, sign in normally or pick one of the four **role cards** to explore the
app as an Owner, Admin, Editor, or Writer. You can switch roles at any time from the account
menu (top-right). Your session persists across refreshes.

---

## Roles & permissions

| Capability | Owner | Admin | Editor | Writer |
|---|:--:|:--:|:--:|:--:|
| Create & edit drafts | ✅ | ✅ | ✅ | ✅ |
| Publish & schedule | ✅ | ✅ | ✅ | — |
| Manage subscribers | ✅ | ✅ | ✅ | — |
| View analytics | ✅ | ✅ | ✅ | — |
| Manage team | ✅ | ✅ | — | — |
| Manage settings & billing | ✅ | ✅ | — | — |

Navigation items and in-page actions are gated by role, and protected routes fall back to a
friendly "no access" screen (`RoleGate`).

---

## Modules

- **Dashboard** — KPI widgets, revenue chart, recent activity, quick actions, recent newsletters.
- **Newsletters** — tabbed list (Draft / Scheduled / Published / Archived) with search, filter,
  sort, pagination, bulk actions, and row actions (edit, duplicate, publish, archive, delete).
- **Newsletter editor** — a guided 5-step wizard: Basics → Template → drag-and-drop Content
  Builder → Access control → split-screen live Preview (desktop / tablet / mobile). Autosave,
  validation, publish / schedule / save-draft.
- **Subscribers** — table with filters + detail drawer (profile, payments, activity timeline,
  notes) and a Subscription Plans manager.
- **Analytics** — revenue / subscriber / engagement charts, date-range filters, and highlights.
- **Team** — invite members, change roles, disable users, permission matrix, activity log.
- **Settings** — general, branding, email, templates, plans, roles, integrations, API keys,
  backup & export.

**Global features:** command palette (`⌘K` / `Ctrl+K`), dark mode, toasts, confirmation
modals, empty states, loading skeletons, responsive layout.

---

## Architecture

```
src/
  components/
    ui/          # shadcn-style primitives (button, card, dialog, table, …)
    common/      # shared building blocks (PageHeader, StatCard, TrendChart, …)
    layout/      # AppLayout, Sidebar, Topbar, RoleGate
    editor/      # ContentBuilder, BlockPreview, BlockInspector, NewsletterPreview
    subscribers/ # SubscriberDrawer, PlansManager
  context/       # AuthContext, DataContext (mock API store), ThemeContext
  data/          # seed.ts — deterministic realistic sample data
  lib/           # utils, constants, metrics, mock api
  pages/         # one file per route
  types/         # shared TypeScript types
```

### Mock API / data layer

`DataContext` holds all application state in memory, seeded from `src/data/seed.ts`, and
exposes async CRUD methods (`saveNewsletter`, `deleteSubscriber`, `updatePlan`, …) that
simulate network latency via `src/lib/api.ts`. To connect a real backend, swap the bodies of
those methods for `fetch()` calls — the component layer doesn't change.

### Design system

Indigo / royal-blue finance palette defined as HSL CSS variables in `src/index.css`
(light + dark), consumed through Tailwind tokens in `tailwind.config.js`. 8px spacing scale,
10–12px radii, soft shadows.

> Sample data is fictional and for demonstration only.
