# admin

Owner: **Kwame** (only Kwame edits files in this folder, except tests).

This folder holds the admin panel used by staff (admins and superadmins): listings, bookings, valuations, users, audit logs, reports and the dashboard. It is a React 18 and Vite app that runs on port 5174.

What goes here:

- `src/` - pages, layouts, features, API client and routing.
- `tests/` - admin tests. Owned by **Jayden**.

Rules:

- The app reads one environment variable, `VITE_API_BASE_URL`. Use `http://localhost:4010` for the mock API and `http://localhost:4000` for the real API.
- Only users with the `admin` or `superadmin` role may use the panel.
- Use the shared `ui-kit` for components and styling so the panel matches the public site.
- Build only the routes and pages listed in the build guide.

This README will be extended in Phase 2 with run instructions and folder conventions.
