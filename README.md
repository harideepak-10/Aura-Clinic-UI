# Aura — Clinic Suite UI

A fresh frontend for the Aura clinic management backend (Django + DRF, PostgreSQL, JWT, Stripe, Groq). Built with Vite, React 19, TypeScript, Tailwind CSS v4, Framer Motion, and Recharts.

## Design direction

"Sereno" — a warm, clinical-modern aesthetic for a luxury Spain-based clinic: ivory backgrounds, deep forest green, and a champagne-gold accent, paired with a Fraunces display serif over Inter body text. This intentionally departs from the existing dark "Aura AI" frontend for a calmer, more premium daytime feel — swap the CSS variables in `src/index.css` if you'd rather keep the dark theme.

## Pages

- **Dashboard** — today's stats, revenue trend, appointments by service, today's schedule, inventory alerts
- **Appointments** — day timeline per therapist/room with conflict-aware booking modal, plus a list view
- **Patients** — searchable directory with a detail panel (contact info, tags, notes, visit history)
- **Inventory** — stock table with category filters, low/out-of-stock badges, add-item modal
- **Billing** — invoice table with Stripe-style status badges (paid/pending/failed/refunded) and totals
- **AI Assistant** — chat UI for the Groq-backed clinic assistant, with suggested prompts

## Connecting to the real backend

By default the app runs entirely on realistic mock data (`src/lib/mockData.ts`) so it's explorable standalone. To wire it up to your actual Django/DRF backend:

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your API root (e.g. your Render URL + `/api`).
2. All requests go through `src/lib/api.ts`, an axios instance that attaches the JWT access token and auto-refreshes it via `/token/refresh/` on a 401 — matching DRF SimpleJWT conventions.
3. `src/lib/dataSource.ts` is the single switch point between mocks and live calls — update the endpoint paths there to match your actual URLconf (currently assumes `/appointments/`, `/patients/`, `/inventory/`, `/payments/invoices/`, `/chat/messages/`, `/therapists/`, `/rooms/`, `/dashboard/stats/`, `/token/`, `/users/me/`).
4. Update the response shapes in `src/lib/types.ts` if your serializers use different field names.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```
