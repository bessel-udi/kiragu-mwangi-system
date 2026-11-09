# api

Owner: **Bessel**, except the items owned by **John** listed below.

This folder holds the Express backend and the frozen API contract.

What goes here:

- `openapi.yaml` - the API contract (v1.0.0). It is the source of truth and is frozen. Nobody edits it.
- `src/` - the application code (modules, middleware, services, utilities).
- `scripts/` - scripts such as the user seed.
- `tests/` - API tests. Owned by **Jayden**.

John owns:

- `src/modules/bookings`, `src/modules/valuations`, `src/modules/notifications`, `src/modules/audit-logs`, `src/modules/reports`
- `src/services/whatsapp` and `src/services/notifications`

Rules:

- Backend code must match `openapi.yaml` exactly. If code and contract disagree, the code is wrong.
- Never put real secrets in the repository. Only `.env.example` is committed.

This README will be extended in Phase 3 with run instructions, the folder map and module conventions.
