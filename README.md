# Aura — Clinic Suite UI

A frontend for the real Aura clinic backend (Django + DRF, deployed on Render at `auro-backend-api.onrender.com`). Built with Vite, React 19, TypeScript, Tailwind CSS v4, Framer Motion, and Recharts.

This talks to the live API directly — there is no mock-data mode. Every endpoint path, request body, and response shape in `src/lib/dataSource.ts` and `src/lib/types.ts` was taken from the actual backend source (`urls.py` / `serializers.py` / `views.py`), not guessed.

## Design direction

"Sereno" — a fresh departure from the earlier dark "Aura AI" frontend: warm ivory background, deep forest green, champagne-gold accents, Fraunces serif headings over Inter body text.

## Pages

- **Login** — calls `POST /api/users/login/`, stores the JWT pair, auto-refreshes via `POST /api/users/refresh/` on a 401
- **Dashboard** — `GET /api/dashboard/`, which returns a different shape per role (admin gets full revenue/leads/staff-performance analytics; reception and therapist get a simpler today's-schedule view)
- **Appointments** — `GET /api/appointments/?date=...` for the day timeline + list, `GET /api/treatments/`, `/api/users/staff/?role=therapist`, and `/api/rooms/` (admin-only on the backend) to populate the booking form, `POST /api/appointments/` to create — the backend does all real conflict/working-hours/leave checking server-side and returns its exact error message on failure
- **Patients** — `GET /api/patients/`
- **Inventory** — `GET /api/inventory/`, `POST /api/inventory/` to add an item (admin-only on the backend)
- **Billing** — `GET /api/payments/`
- **AI Assistant** — `POST /api/ai/chat/` with `{ message, conversation_history }`, Groq-backed

## Configuration

`src/lib/api.ts` defaults `VITE_API_BASE_URL` to `https://auro-backend-api.onrender.com/api`. To point at a different environment (local dev, staging), copy `.env.example` to `.env` and override it.

## A few things worth knowing about the real backend

- **Roles matter.** `/api/rooms/` and `POST /api/inventory/` are admin-only (`IsAdmin` permission) — a reception or therapist login will get a 403 there. The Appointments page degrades gracefully (room selection is disabled with a note) if that happens.
- **Appointment statuses** are `upcoming` / `in_session` / `completed` / `cancelled` — not the generic "confirmed/pending" some UIs use.
- **Payment statuses** are `pending` / `paid` / `refunded` (no "failed" state exists in the model).
- **Booking requires a price plan.** Every appointment needs a `treatment_id` *and* a `price_plan_id` from that treatment's price plans — there's no such thing as booking a treatment with no plan selected.
- **The AI Assistant has no history endpoint.** Conversation history is kept client-side and resent with each message (`conversation_history`), matching how the backend's `/api/ai/chat/` expects it.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

Note: this sandbox's outbound network doesn't reach `onrender.com`, so the API wiring here was verified by reading the backend source directly rather than a live round-trip. Test it against the real login on your machine and let me know if anything doesn't match (worth double-checking: the exact serializer names for `RoomsView`/`InventoryListView` permissions if your admin test account doesn't have `role == 'admin'` set).
