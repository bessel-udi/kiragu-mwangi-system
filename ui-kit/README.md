# ui-kit

Owner: **Kennedy**, except `src/admin/`, which is owned by **Kwame**.

This folder holds the shared design system, "Heritage Navy and Brass", used by both `web` and `admin` so the two apps look the same.

What goes here:

- `src/theme` and `src/styles` - Bootstrap theme overrides, typography and global styles.
- `src/components` - common components (form fields, status badge, data table, dialogs, feedback). Owned by Kennedy.
- `src/utils` - money, date and time formatting helpers. Owned by Kennedy.
- `src/admin` - admin-only components (sidebar layout, stat card, image uploader). Owned by Kwame.
- `tests/` - ui-kit tests. Owned by **Jayden**.

Rules:

- Neither Kennedy nor Kwame edits the other's part. Ask the owner for changes.
- Colours, fonts, radius and status colour mappings come from the build guide and must not be redefined elsewhere.

This README will be extended in Phase 2 with a list of every component and how to use it.
