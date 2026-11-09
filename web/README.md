# web

Owner: **Kennedy** (only Kennedy edits files in this folder, except tests).

This folder holds the public website that clients use: browsing properties, booking viewings, requesting valuations and managing their account. It is a React 18 and Vite app that runs on port 5173.

What goes here:

- `src/` - pages, layouts, features, components, API client and routing.
- `tests/` - front-end tests. Owned by **Jayden**.

Rules:

- The app reads one environment variable, `VITE_API_BASE_URL`. Use `http://localhost:4010` for the mock API and `http://localhost:4000` for the real API.
- Use the shared `ui-kit` for components and styling so the site matches the admin panel.
- Build only the routes and pages listed in the build guide.

This README will be extended in Phase 3 with run instructions and folder conventions.
