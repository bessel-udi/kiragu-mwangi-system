# db

Owner: **Bessel** (only Bessel edits files in this folder).

This folder holds the MySQL database definition for the system. Nothing here is application code.

What goes here:

- `migrations/` - numbered SQL files that create the tables, one table per file, in dependency order (added in Phase 2).
- `seed/` - SQL files that load sample data such as the property listings (added in Phase 2).

Rules:

- After Phase 2 the schema is complete. Any further change is a new numbered migration file. Existing migration files are never edited.
- Users are not seeded in SQL. They are created by the script `api/scripts/seed-users` so that password hashes are real.

This README will be replaced in Phase 2 with the full instructions: how to create the `kiragu_mwangi` database and the `km_app` user, the exact order to run migrations and seeds, how to reset the database, and how double-booking is prevented.
