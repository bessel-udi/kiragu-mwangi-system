# Kiragu & Mwangi Real Estate Management System — Build Order & Supervisor Guide

**Audience:** Bessel, Kennedy, Kwame, John, Jayden, and each person's AI coding agent.
**Status:** Project not started. This guide takes the team from an empty folder to a deployed system.
**This document contains no application code.** It tells you *what* to build, *in what order*, *where*, *what to check first*, and *which git commands to run*. Your AI agent writes the code from this guide plus `api/openapi.yaml`.

**Team amendments (agreed by all five members before Phase 1):**

1. Runtime is **Node.js 24** (not 20 LTS). CI (Phase 2) and Railway hosting (Phase 12) must use Node 24.
2. The GitHub repository is **public** (not private). Because of this, never commit secrets: only `.env.example` files are committed.


---

## 0. How to use this document

1. Every member reads the whole guide once (Sections 1 to 7), then works only from the phase sections that name them.
2. Before every working session, paste the **Agent Briefing** below into your AI agent, filled in for the current phase.
3. Phases run in order. **You may not start a phase until its start requirement is met** (a git tag named `phase-N-complete` exists, see Section 7). Inside a phase, members work in parallel on separate files, so nobody edits the same file.
4. If anything in this guide, the contract, and your agent's idea of "better" disagree, the order of authority is: **`api/openapi.yaml` → this guide → everything else.**

### Agent Briefing (paste at the start of every agent session)

> You are the coding agent for **{MEMBER}**, working on phase **{PHASE}** of the Kiragu & Mwangi system.
> Read `docs/BUILD_GUIDE.md` and `api/openapi.yaml` first.
> You may only create or modify files inside the paths owned by {MEMBER} (Section 2).
> You must never modify `api/openapi.yaml`.
> Before writing or changing any file, complete **Checklist U** (Section 4) and the "Check first" list for this phase, and report the result of every item to me. If any item fails, stop and tell me; do not work around it.
> Implement only the operations, pages and files listed for {MEMBER} in this phase. Do not invent endpoints, fields, statuses, or error shapes. If the contract is silent, choose the stricter, safer behaviour and state your choice in the pull request description.
> Follow the git steps listed for this phase exactly: branch names and commit messages as written.

---

## 1. Fixed decisions (do not re-debate)

### 1.1 Source of truth
- `api/openapi.yaml` (v1.0.0) is **frozen**. Backend code must match it exactly. Frontends consume it exactly. If code and contract disagree, **the code is wrong**.
- If you believe the contract has an error: **stop, change nothing, tell the team.** A contract change needs agreement from all five members, one PR labelled `contract-change` by Bessel, and then everyone rebases.

### 1.2 Technology
| Layer | Choice |
|---|---|
| Runtime | Node.js 24, npm workspaces, ES modules |
| API | Express |
| Database | MySQL 8, `utf8mb4`, accessed only through parameterised (prepared) statements via the `mysql2` pool |
| Auth | HttpOnly cookie named `session` holding a signed token; passwords hashed with bcrypt |
| Request/response validation | `express-openapi-validator` driven by `api/openapi.yaml` |
| Security middleware | helmet, CORS with credentials and an origin allow-list, express-rate-limit |
| Uploads | multer; storage behind a driver interface (local disk first) |
| Email | Nodemailer (SMTP). Dev uses a sandbox inbox (Mailtrap) |
| WhatsApp | Meta WhatsApp Cloud API behind a driver interface with two drivers: `stub` (logs only) and `live` |
| Reports | PDFKit for PDF, a CSV writer library for CSV |
| Frontends | React 18 + Vite, React Router, TanStack Query, axios, react-hook-form |
| Styling | Bootstrap 5.3 via React-Bootstrap, Sass theme overrides, Font Awesome 6 (free) |
| Mock API | Prism (reads `api/openapi.yaml`) |
| Tests | Jest + Supertest (api), Vitest + React Testing Library (web, admin, ui-kit) |
| Lint/format | ESLint + Prettier, config at repo root |
| CI | GitHub Actions |
| Hosting (final phase) | Railway for API + MySQL; static host (Netlify or Vercel) for `web` and `admin` |

### 1.3 Repository layout
```
/api          Express backend. Contains openapi.yaml
/db           Migrations and seed SQL
/web          Public site (React)
/admin        Admin panel (React)
/ui-kit       Shared design system used by /web and /admin
/docs         Guides, design, test plan, manual, diagrams, brand assets
/.github      CODEOWNERS, PR template, CI workflows
```
(`/ui-kit` and `/docs` are additions to the original four folders. `/ui-kit` is what guarantees the uniform interface across web and admin; `/docs` gives Jayden an owned home.)

### 1.4 Ports and environment
| Service | Port |
|---|---|
| Real API | 4000 |
| Mock API (Prism) | 4010 |
| Web | 5173 |
| Admin | 5174 |

- Frontends read **one** variable, `VITE_API_BASE_URL`. Mock = `http://localhost:4010`, real = `http://localhost:4000`. Switching from mock to real is changing this variable and nothing else.
- Real `.env` files are **never committed**. Only `.env.example` files are.
- API variables (names are fixed; Bessel puts all of them in `api/.env.example` in Phase 1):
  `NODE_ENV, PORT, APP_TIMEZONE (Africa/Nairobi), DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME (session), COOKIE_SECURE, COOKIE_SAMESITE, COOKIE_DOMAIN, CORS_ORIGINS, WEB_BASE_URL, ADMIN_BASE_URL, PUBLIC_API_URL, UPLOAD_DIR, MAX_UPLOAD_MB, STORAGE_DRIVER, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, WHATSAPP_DRIVER (stub or live), WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_TEMPLATE_NAME, WHATSAPP_RECIPIENTS, SEED_SUPERADMIN_EMAIL, SEED_SUPERADMIN_PASSWORD, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_CLIENT_PASSWORD`
- Web and admin: `VITE_API_BASE_URL`. Web only, optional: `VITE_WHATSAPP_CHAT_NUMBER`.
- Database name: `kiragu_mwangi`. Application DB user: `km_app` (data privileges only, never root).

### 1.5 Naming and style conventions
- Files and folders: `kebab-case`. React components: `PascalCase.jsx`. Backend module files: `<module>.routes.js`, `<module>.controller.js`, `<module>.service.js`, `<module>.repository.js`, `index.js`.
- API JSON is `camelCase`. Database columns are `snake_case`. **Only the repository/service layer converts between them.** Never expose `password_hash`, `reset_token` or `reset_token_expiry`.
- Every file starts with a short comment saying what it is for; every non-obvious function has a one-line comment (marks are given for commenting and modularity).
- Branch names: `<type>/<area>-<thing>` where type is one of `feat, fix, chore, docs, test, ci, refactor`.
- Commit messages: `<type>(<scope>): <imperative summary, lower case, no full stop>`. Scopes: `repo, db, api, web, admin, ui, docs, test, ci, deps`.
- Audit action names follow `<entity>.<action>` in lower case (list in Appendix D). Every create, update, delete and status change writes one audit row through the shared audit helper.
- One logical change per commit. Small commits. Never commit generated files, `node_modules`, `.env`, uploads, or build output.

### 1.6 Design direction ("Heritage Navy & Brass")
A premium, trustworthy Nairobi real-estate look. Used identically by `/web` and `/admin`.
- **Framework:** Bootstrap 5.3 (through React-Bootstrap) customised with Sass variable overrides. Icons: Font Awesome 6 Free.
- **Typefaces:** Playfair Display (headings), Inter (body, forms, tables).
- **Palette:** Navy `#12263F` (primary), Brass `#C8A24A` (accent/CTA highlights), Ivory `#F7F5F0` (page background), Ink `#1F2933` (text), Success `#2E7D5B`, Warning `#B7791F`, Danger `#B42318`, Info `#2563A8`, Slate `#64748B` (muted).
- **Shape and depth:** 8px corner radius, soft low shadows, generous white space, image-first listing cards with a price badge.
- **Status colours (one mapping, used everywhere via the shared status badge):**
  - Booking: pending = warning, confirmed = success, rescheduled = info, completed = slate, cancelled = danger.
  - Valuation: submitted = warning, under_review = info, completed = success.
  - Property: available = success, under_offer = warning, sold/rented = slate, withdrawn = muted.
- **Formats:** money as `KES 12,500,000`; dates like `7 Nov 2026`; times shown 12-hour (`2:00 PM`) but sent to the API as `HH:mm`.
- **Admin panel:** same palette. Navy sidebar with a brass active marker, light content area, compact tables.
- **Quality bars:** mobile-first and responsive down to 360px, WCAG AA contrast, visible focus states, every form field has a label and an inline error.

### 1.7 Route map (fixed)
**Web:** `/`, `/properties`, `/properties/:id`, `/properties/:id/book`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/my/bookings`, `/my/valuations`, `/valuation/request`, `/about`, `/contact`, `/help`, `/terms`, `/privacy`, `*` (not found).
**Admin:** `/login`, `/` (dashboard), `/listings`, `/listings/new`, `/listings/:id/edit`, `/bookings`, `/valuations`, `/users`, `/audit-logs`, `/reports`, `/help`, `*` (not found).

### 1.8 Where the contract is silent
Choose the stricter, safer behaviour and write the choice in the PR description. Known cases decided here:
- Booking a property that does not exist or whose status is not `available` → respond as not found (404).
- Slot rules, workflows and permissions are in the contract's descriptions; read them for each operation. They are binding.
- The contract has no profile-edit, contact-form, or 2FA endpoints. **Do not build them.** Contact and help pages are static content.

---

## 2. Team, ownership, reviewers

| Member | Role | Owns (only they edit these) |
|---|---|---|
| **Bessel** | Backend and database lead | `/db/**`; everything in `/api/**` **except** John's items; root `package.json`, lockfile, lint/format config, `.gitignore`, `.editorconfig`; `/.github/CODEOWNERS` and PR template |
| **John** | Integration and reports lead | `api/src/modules/{bookings,valuations,notifications,audit-logs,reports}/**`; `api/src/services/{whatsapp,notifications}/**`; `/.github/workflows/**` |
| **Kennedy** | Front-end lead | `/web/**`; `/ui-kit/**` **except** `ui-kit/src/admin/**` |
| **Kwame** | Admin panel lead | `/admin/**`; `ui-kit/src/admin/**` |
| **Jayden** | Documentation, design and testing lead | `/docs/**`; every `tests/` folder (`api/tests`, `web/tests`, `admin/tests`, `ui-kit/tests`); test-runner config files (`jest.config.*`, `vitest.config.*`) in each workspace |

**Required reviewer (one approval before merge):**
Bessel's PRs → John. John's → Bessel. Kennedy's → Kwame. Kwame's → Kennedy. Jayden's → Bessel.
Any PR that touches shared tooling or dependencies also needs Bessel.

**Phase gatekeeper:** Jayden verifies each phase's gate checklist and creates the `phase-N-complete` tag.

If you need a change in a file you do not own: **do not edit it.** Ask the owner in the group chat, or open a PR the owner reviews.

---

## 3. Collision-prevention rules (hotspot files)

| Hotspot | Rule |
|---|---|
| `api/openapi.yaml` | Frozen. Nobody edits it (Section 1.1). |
| `api/src/app.js` (router registration) | Bessel only. In Phase 3 Bessel pre-registers **every** module as a stub, so John never touches this file. |
| Module folders in `api/src/modules/` | Exactly one owner each (Section 2). Bessel creates the stub; the owner fills it in. |
| Dependencies / lockfile | Any new package goes in its own tiny PR: branch `chore/deps-<package>`, commit `chore(deps): add <package> to <workspace>`. It is merged first; everyone then rebases. Never bundle a dependency change into a feature PR. |
| Database | After Phase 2 the schema is complete. Any further DB change is a new numbered migration file written **only by Bessel**. Existing migration files are never edited. |
| `ui-kit` | Kennedy owns the common exports. Kwame owns the `admin` export folder. Neither edits the other's. Need something from the other? Ask. |
| Frontend route tables | Created once as stubs (Phase 3). Later PRs only fill pages; they do not reorder or rename routes. |
| Shared env examples | Bessel writes every variable in Phase 1. Nobody else edits the example files. |

**Conflict rule:** if `git rebase` reports a conflict in a file you own, resolve it carefully and run the checks. If the conflict is in a file you do **not** own, **abort the rebase (`git rebase --abort`) and ask.** Never force-push to `main`. Never use `git push --force` on a shared branch.

---

## 4. Checklist U — mandatory before touching anything

Run this **every session and before every new task**. Your agent must report each item as PASS or FAIL. Any FAIL = stop.

1. **Phase gate:** after fetching tags, the tag required by this phase exists (`git tag --list "phase-*"`).
2. **Clean tree:** `git status` shows nothing uncommitted from earlier work (or it is deliberately on your current feature branch).
3. **Right branch:** `git branch --show-current` shows your feature branch for this task and is **not `main`**.
4. **Up to date:** your branch is rebased on the latest `origin/main` (Section 5).
5. **Ownership:** every path you are about to create or edit is inside your owned paths (Section 2). If not, stop.
6. **Contract read:** you have opened `api/openapi.yaml` and read, for **each** operation you will touch: path, method, access level, parameters, request body, every response code, every schema it references, and the description text. For frontends also read the error schema.
7. **Prerequisites merged:** everything listed under this phase's "Requires" is in `main`.
8. **No duplicates:** you have looked through the folder you are about to write in so you do not recreate a helper that already exists.
9. **Environment:** your own `.env` exists, the database is migrated to the latest migration (backend work), or `VITE_API_BASE_URL` points where you expect (frontend work).
10. **Task scope:** you can state, in one sentence, which listed task you are doing. If it is not in this guide for your name and this phase, do not do it.

---

## 5. Daily start routine (every working day, before anything else)

1. Open a terminal in the repo root.
2. `git status` — must be clean. If not: commit your work on your feature branch, or `git stash`.
3. `git checkout main`
4. `git pull --ff-only origin main` — if this fails, stop and ask; never merge on `main`.
5. `git fetch --tags` then `git tag --list "phase-*"` — note the latest completed phase.
6. `git log --oneline -20` — read what landed since yesterday. Look for anything touching files you depend on.
7. `git log --oneline -3 -- api/openapi.yaml` — it must show only the original commit. If it changed, **stop and tell the team.**
8. If `package-lock.json` changed since your last pull: run `npm install` at the repo root.
9. If new files appeared in `db/migrations`: apply them to your local database in order (instructions in `db/README.md`, Phase 2 onward).
10. Continue your work: `git checkout <your-feature-branch>` then `git rebase origin/main`. If it stops on a conflict, follow the conflict rule in Section 3.
11. Smoke check: start what you work on (mock, or real API) and confirm it boots.
12. Run Checklist U (Section 4), then begin.

**End of day:** commit everything you intend to keep, `git push` your feature branch, and open a draft PR if one is not open.

---

## 6. Standard git flow for every task

```
git checkout main
git pull --ff-only origin main
git checkout -b <type>/<area>-<thing>
   ... write files, run lint and tests ...
git add <specific paths>
git commit -m "<type>(<scope>): <summary>"
   ... repeat small commits ...
git fetch origin
git rebase origin/main
git push -u origin <type>/<area>-<thing>
```
Then open a PR to `main` (title = the main commit message). Fill in the PR template: what changed, contract operations covered, how you tested, anything the contract left silent. Request the required reviewer (Section 2).

When approved: **squash and merge**, delete the remote branch. Then:
```
git checkout main
git pull --ff-only origin main
git branch -d <type>/<area>-<thing>
```
Never `git add .` or `git add -A`: add specific paths so you cannot commit files you do not own. Never commit directly to `main` (the only exception is Bessel's initial commits in Phase 1, before protection is switched on).

Before opening any PR run, in your workspace: lint, tests, and for the API also a check that the server starts and responds on `GET /api/health`.

---

## 7. Phase map and gates

| Phase | Name | Starts when | Tag on completion |
|---|---|---|---|
| 0 | Machine setup and orientation | immediately | (none) |
| 1 | Repository foundation | Phase 0 done | `phase-1-complete` |
| 2 | Parallel foundations: database, CI, UI kit, design | `phase-1-complete` | `phase-2-complete` |
| 3 | Backend skeleton and frontend shells | `phase-2-complete` | `phase-3-complete` |
| 4 | Accounts and access (auth slice) | `phase-3-complete` | `phase-4-complete` |
| 5 | Property listings slice | `phase-4-complete` | `phase-5-complete` |
| 6 | Viewing bookings: the main transaction | `phase-5-complete` | `phase-6-complete` (**Deliverable 3 readiness**) |
| 7 | Valuations, notifications, dashboard | `phase-6-complete` | `phase-7-complete` |
| 8 | User management, audit log viewer, remaining public pages | `phase-7-complete` | `phase-8-complete` |
| 9 | Reports | `phase-8-complete` | `phase-9-complete` |
| 10 | Hardening, validation, help facilities, polish | `phase-9-complete` | `phase-10-complete` |
| 11 | Full testing and bug fixing | `phase-10-complete` | `phase-11-complete` |
| 12 | Documentation, packaging, deployment, release | `phase-11-complete` | `phase-12-complete` and release tag `v1.0.0` |

**Deliverable 3 (mid-semester marking) asks for:** a database created in a DBMS, a well-designed front-end, a well-designed admin panel, front-end connected to the database, admin panel connected to the database. All of that is demonstrable at the end of **Phase 6**, with the main transaction (site viewing booking) working. Phases 7 to 12 build the rest of the Deliverable 4 marks.

---

# PHASE 0 — Machine setup and orientation (everyone, no repository yet)

**Goal:** every machine can run the toolchain; every member has read the contract.
**Requires:** nothing.
**Finish when:** all five members have confirmed the checklist below in the group chat.

### Everyone
- **Check first:** none (no files are written).
- **External steps:**
  1. Install Node.js 24, npm, Git, MySQL Server 8 and a MySQL client (Workbench or CLI), and VS Code.
  2. Create or confirm your GitHub account and set up authentication (SSH key or credential manager).
  3. Set your git identity: `git config --global user.name "<Full Name>"` and `git config --global user.email "<your GitHub email>"`.
  4. Confirm you can start MySQL and log in as root locally. Write down the root password somewhere private.
  5. Read `openapi.yaml` end to end, including the long description at the top (conventions, workflows, booking slots). Read this guide's Sections 1 to 7.
- **Git:** only the two `git config` commands above.
- **Done when:** you have posted your versions (`node -v`, `git --version`, MySQL version) in the group chat.

### Bessel (additionally)
- **External steps:** create an **empty public GitHub repository** named `kiragu-mwangi-system` (no README, no `.gitignore`, no licence). Invite Kennedy, Kwame, John and Jayden as collaborators with write access.

### John (additionally, start now — these have long approval times)
- **External steps:**
  1. Create a Meta for Developers account and a Business app with the WhatsApp product.
  2. Obtain the test phone number, its Phone Number ID, and a temporary access token. Add the admin recipients' WhatsApp numbers to the allowed test recipients.
  3. Draft and submit a message template for "new viewing booking" and "new valuation request" alerts to admins (business-initiated messages need an approved template).
  4. Create a Mailtrap (or equivalent) sandbox inbox and note its SMTP host, port, username and password for development.
  5. Share credentials with Bessel **privately** (never in the repo or in chat history that persists).

### Jayden (additionally)
- **External steps:** obtain the Kiragu & Mwangi Ltd logo and company name/branding from the client (or create a clean placeholder if unavailable and confirm with the group). Collect all Deliverable 1 and 2 files (diagrams, schema, mockups) in one folder ready to be committed in Phase 2.

### Kennedy and Kwame (additionally)
- **External steps:** none beyond the common ones. Optionally install the browser React DevTools.

---

# PHASE 1 — Repository foundation

**Goal:** an empty, protected repository with structure, shared tooling and the frozen contract in place.
**Requires:** Phase 0 done; empty GitHub repo exists with all five members invited.
**Finish when (gate):** all five members have cloned, installed, run the mock API successfully, and branch protection is confirmed on. Jayden then tags `phase-1-complete`.

### Bessel — the only person committing in this phase
- **Check first:** the GitHub repo exists and is empty; you have `api/openapi.yaml` from the team (the file as delivered, unchanged); Node 24 and npm work.
- **External steps (GitHub settings, after the first push):**
  1. Settings → Branches → add a rule for `main`: require a pull request before merging; require 1 approval; dismiss stale approvals on new commits; require conversation resolution; block force pushes; block deletions; apply to administrators too.
  2. Settings → General → pull requests: allow **squash merging only**; auto-delete head branches.
  3. (Status checks will be added as required in Phase 2, after John's CI exists.)
- **Files to write (nothing else):**
  - Root: `README.md` (what the project is, folder map, ports, how to run mock and real, link to the guide), `.gitignore`, `.editorconfig`, `.prettierrc`, ESLint config, root `package.json` declaring npm workspaces `api, web, admin, ui-kit` and root scripts for: running the mock API on port 4010 from `api/openapi.yaml`, linting the contract, linting all workspaces, testing all workspaces.
  - `api/openapi.yaml` — **byte-for-byte the delivered contract**. Verify afterwards with a file diff against the original: it must show no differences.
  - A short `README.md` in each of `db/`, `api/`, `web/`, `admin/`, `ui-kit/`, `docs/` stating who owns the folder and what goes in it.
  - `api/.env.example`, `web/.env.example`, `admin/.env.example` with every variable named in Section 1.4 and a comment per variable. **No real secrets, no real passwords.**
  - `docs/BUILD_GUIDE.md` — a copy of this guide.
  - `.github/CODEOWNERS` encoding Section 2's ownership, and `.github/pull_request_template.md` (sections: summary, contract operations covered, how tested, contract-silent decisions made, screenshots for UI).
- **Git (first and only direct commits to `main`):**
```
git init
git branch -M main
git remote add origin <repo-url>
git add .gitignore .editorconfig .prettierrc package.json README.md
git commit -m "chore(repo): initialize repository with shared tooling config"
git add api/openapi.yaml
git commit -m "docs(contract): add frozen openapi v1.0.0 as the source of truth"
git add db/README.md api/README.md web/README.md admin/README.md ui-kit/README.md docs/README.md
git commit -m "docs(repo): add folder readmes with ownership"
git add api/.env.example web/.env.example admin/.env.example
git commit -m "chore(env): add env example files for api, web and admin"
git add docs/BUILD_GUIDE.md
git commit -m "docs(guide): add build order and supervisor guide"
git add .github/CODEOWNERS .github/pull_request_template.md
git commit -m "chore(repo): add codeowners and pull request template"
git push -u origin main
```
  (Include the root ESLint config file in the first `git add` line.) Then apply the GitHub settings above **immediately**. From this moment nobody, including Bessel, commits to `main` directly.
- **Done when:** the contract diff is clean, protection is on, and a test push to `main` from any machine is rejected.

### John, Kennedy, Kwame, Jayden — wait, then verify
- **Check first:** you have accepted the repo invitation. **Do not create or edit any file** in this phase.
- **Steps (after Bessel announces the first push):**
  1. `git clone <repo-url>` then `cd` into it.
  2. `npm install` at the repo root.
  3. Create your own `.env` files by copying the `.env.example` files in `api/`, `web/` and `admin/` (leave values for later phases empty; never commit them).
  4. Start the mock API with the root mock script and open `http://localhost:4010/api/health` — it must return the health response from the contract.
  5. Confirm your agent can read `api/openapi.yaml` and list all 40 operations.
- **Git:** none. Report PASS/FAIL to Jayden.

### Jayden — additionally, as gatekeeper
- **Steps:** verify (a) the contract file is unchanged, (b) branch protection settings, (c) all four others report the mock working. Then:
```
git fetch origin
git tag phase-1-complete origin/main
git push origin phase-1-complete
```

---

# PHASE 2 — Parallel foundations (database, CI, UI kit, design system)

**Goal:** four independent foundations built at once without any shared file.
**Requires:** `phase-1-complete`.
**Finish when (gate):** the database applies cleanly from zero; CI runs and is green; ui-kit v0 is merged; design docs and page inventory are merged. Jayden tags `phase-2-complete`.

### Bessel — the database
- **Check first:** Checklist U; `docs/deliverables/` is not yet populated, so use the **Database Schema Specification PDF as supplied by the team** as the base; re-read the contract's component schemas for every enum and for `Notification`.
- **External steps (MySQL):**
  1. Start MySQL; log in as root.
  2. Create database `kiragu_mwangi` with `utf8mb4` and a `utf8mb4_unicode_ci` collation.
  3. Create user `km_app` with a strong password and grant it only SELECT, INSERT, UPDATE, DELETE on that database. (Schema changes are run as root.)
  4. Put the DB name, user and password in your `api/.env` (not committed).
- **Files to write (in `db/`):**
  - `db/migrations/0001_users.sql`, `0002_properties.sql`, `0003_property_images.sql`, `0004_viewing_bookings.sql`, `0005_valuation_requests.sql`, `0006_audit_logs.sql`, `0007_notifications.sql` — one table per file, in dependency order.
  - `db/seed/001_properties_seed.sql` — 12 to 15 realistic Nairobi listings (mix of residential, commercial, land; sale and rent; all statuses) and their image rows. **No users in SQL** (users are seeded by a script in Phase 3 so hashes are real).
  - `db/README.md` — exact order to run migrations and seeds from zero; how to reset the database; how to create the DB and `km_app` user; troubleshooting.
- **Schema requirements:**
  - Table and column names, types, lengths and keys follow the Database Schema Specification, with these additions already built in: (a) `valuation_requests` gets an `admin_notes` text column (nullable); (b) a new `notifications` table with columns that map one-to-one to the contract's `Notification` schema (id, type, message, entity name, entity id, is-read flag, created-at).
  - `users.role` allows only `client`, `admin`, `superadmin`. Email is unique.
  - Allowed values (enforced with CHECK constraints or equivalent): property category `residential, commercial, land`; listing type `sale, rent`; property status `available, under_offer, sold, rented, withdrawn`; booking status `pending, confirmed, rescheduled, completed, cancelled`; valuation status `submitted, under_review, completed`; valuation purpose `sale, purchase, mortgage, insurance, investment, other`; notification type `booking_created, valuation_submitted`; notification entity `viewing_bookings, valuation_requests`.
  - Foreign keys: properties→users (creator); images→properties (delete with property); bookings→properties (**restrict deletion**, because the contract returns 409 when a property has bookings) and →users; valuations→users (client and handler); audit_logs→users (nullable, keep the log if user is removed).
  - Indexes for the filters the contract defines (category, listing type, location, price, status; booking property/date/time/status; valuation status; audit user/action/date; notification unread).
  - **Double-booking must be impossible at database level**, while a cancelled booking must free its slot. (This needs a deliberate design — for example a derived value that is empty when the booking is cancelled, with a unique rule over it.) Explain your choice in `db/README.md`.
  - `created_at`/`updated_at` defaults and auto-update as in the schema.
  - "Exactly one primary image per property" is enforced by the API inside a transaction (document this).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/db-schema
git add db/migrations/0001_users.sql db/migrations/0002_properties.sql db/migrations/0003_property_images.sql
git commit -m "feat(db): add users, properties and property images tables"
git add db/migrations/0004_viewing_bookings.sql db/migrations/0005_valuation_requests.sql
git commit -m "feat(db): add viewing bookings and valuation requests tables"
git add db/migrations/0006_audit_logs.sql db/migrations/0007_notifications.sql
git commit -m "feat(db): add audit logs and notifications tables"
git add db/seed/001_properties_seed.sql
git commit -m "feat(db): add property seed data"
git add db/README.md
git commit -m "docs(db): document migration order, reset and database user setup"
git push -u origin feat/db-schema
```
  Reviewer: John. **Merge this first** in the phase.
- **Done when:** running the migrations then the seed on a fresh database succeeds with no errors, and running them again after a reset also succeeds.

### John — continuous integration
- **Check first:** Checklist U; confirm the root scripts for contract lint, lint and test exist (Phase 1); `.github/workflows/` is yours.
- **Files to write:** `.github/workflows/ci.yml` — on every pull request and on pushes to `main`: install dependencies; lint the contract; lint each workspace; run each workspace's tests; each workspace step must skip gracefully while that workspace has no test files yet. Also fail the run if `api/openapi.yaml` was modified (except in a PR labelled `contract-change`).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b ci/github-actions
git add .github/workflows/ci.yml
git commit -m "ci(workflow): add contract lint, workspace lint and test pipeline"
git push -u origin ci/github-actions
```
  Reviewer: Bessel.
- **After merge:** tell Bessel to add the CI job as a **required status check** in branch protection.

### Kennedy — UI kit v0 (the shared design system)
- **Check first:** Checklist U; read Section 1.6 (design direction) and 1.7 (route map) fully. You own `ui-kit/**` except `ui-kit/src/admin/**`.
- **Files to write (in `ui-kit/`):**
  - Package manifest and Vite library setup as a workspace named `ui-kit`.
  - Theme layer: Sass variable overrides for Bootstrap from the palette, typography, radius and shadow in Section 1.6; global stylesheet; font imports (Playfair Display, Inter); Font Awesome setup.
  - Two public entry points: the **common** entry (written by you) and a reserved **admin** entry (an empty export file only; Kwame fills it).
  - Common components, each with a short usage comment: brand logo; page container and section heading; form field wrapper with label, hint and inline error; password field with show/hide; select; date field; time-slot picker button group; confirm dialog; toast/alert feedback; loading spinner and skeleton; empty state; error state with retry; pagination control; **status badge** (booking, valuation and property mappings from Section 1.6); price and date/time formatting helpers (KES, Nairobi dates, 12-hour display, 24-hour output); data table with responsive stacking on mobile.
  - A visual demo/test page inside the kit (not part of web) showing every component and state; `ui-kit/README.md` listing each component and how to use it.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/ui-theme-and-components
git add ui-kit/package.json ui-kit/src/theme ui-kit/src/styles
git commit -m "feat(ui): add navy and brass bootstrap theme with typography"
git add ui-kit/src/components ui-kit/src/index.js ui-kit/src/admin
git commit -m "feat(ui): add shared form, feedback, table and status components"
git add ui-kit/src/utils
git commit -m "feat(ui): add money, date and time formatting helpers"
git add ui-kit/README.md
git commit -m "docs(ui): document ui kit components and usage"
git push -u origin feat/ui-theme-and-components
```
  Reviewer: Kwame. **Merge second** (after Bessel's DB, or in parallel if ready).
- **Done when:** the demo page renders every component on desktop and at 360px width.

### Kwame — admin application skeleton (without the UI kit yet)
- **Check first:** Checklist U; route map in Section 1.7; `ui-kit` is **not** merged yet, so do not import it in this phase.
- **Files to write (in `admin/`):** Vite React app on port 5174; manifest with scripts (dev, build, lint, test); entry files; router with all admin routes from Section 1.7 as placeholder pages that show only the page name; an API client module that reads `VITE_API_BASE_URL`, sends cookies on every request, and converts every error response into one error object matching the contract's `Error` shape; a query client setup; folder structure (`pages`, `features`, `api`, `hooks`, `layouts`, `lib`) with a one-line README each explaining the convention; `admin/README.md`.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-app-skeleton
git add admin/package.json admin/vite.config.js admin/index.html admin/src/main.jsx
git commit -m "feat(admin): scaffold vite react admin app"
git add admin/src/router admin/src/pages
git commit -m "feat(admin): add route table with placeholder pages"
git add admin/src/api admin/src/lib
git commit -m "feat(admin): add api client with cookies and contract error handling"
git add admin/README.md
git commit -m "docs(admin): document folder conventions and run instructions"
git push -u origin feat/admin-app-skeleton
```
  Reviewer: Kennedy.

### Jayden — design and documentation foundation
- **Check first:** Checklist U; you own `docs/**` and test folders. Gather all Deliverable 1 and 2 files and the logo.
- **Files to write (in `docs/`):**
  - `docs/deliverables/` — Deliverable 1 deck, project guidelines, and the Deliverable 2 PDFs (schema, flowchart, use case diagram) **unchanged**.
  - `docs/brand/` — logo files (and a note of their usage rules). John will use these in Phase 9.
  - `docs/design/style-guide.md` — expands Section 1.6: component states (default, hover, focus, disabled, error), spacing scale, breakpoints, iconography, tone of messages.
  - `docs/design/page-inventory.md` — a table covering **every page** in Section 1.7 for web and admin: purpose, who can see it, which contract operations it calls (by operation id), required states (loading, empty, error), and what a success looks like. This is the specification Kennedy and Kwame build from.
  - `docs/design/mockups/` — wireframes for any page lacking one from Deliverable 2 (paper sketches or tool exports).
  - `docs/diagrams/` — updated use case diagram and flowchart that include the **superadmin** role and the user-management, notification and report flows (the contract has a superadmin; the Deliverable 2 diagrams show one administrator).
  - `docs/test-plan.md` — outline: scope, levels (unit, API, UI, end-to-end), tools, environments, test data, pass criteria.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b docs/design-foundation
git add docs/deliverables docs/brand
git commit -m "docs(docs): add deliverable files and brand assets"
git add docs/design/style-guide.md
git commit -m "docs(design): add style guide with component states"
git add docs/design/page-inventory.md
git commit -m "docs(design): add page inventory mapped to contract operations"
git add docs/design/mockups
git commit -m "docs(design): add wireframes for pages missing mockups"
git add docs/diagrams
git commit -m "docs(diagrams): update use case and flowchart with superadmin role"
git add docs/test-plan.md
git commit -m "docs(test): add test plan outline"
git push -u origin docs/design-foundation
```
  Reviewer: Bessel.
- **Gate check and tag:** after all four PRs above are merged and every member has applied the DB to their local MySQL once: 
```
git fetch origin
git tag phase-2-complete origin/main
git push origin phase-2-complete
```

---

# PHASE 3 — Backend skeleton and frontend shells

**Goal:** a running API with every module registered as a stub, and both frontends with layout, routing and the shared UI kit wired in, all against the mock.
**Requires:** `phase-2-complete`; your local DB applied (Bessel, John, Jayden at minimum; everyone by Phase 4).
**Finish when (gate):** `GET /api/health` returns the contract response from the **real** API; the seed script creates the users; web and admin both open a styled shell on 5173/5174 running against the mock; CI green. Jayden tags `phase-3-complete`.

### Bessel — API skeleton (two PRs, in this order)
- **Check first:** Checklist U; contract sections on conventions, error schema, security scheme `session`, pagination; DB migrated; `api/.env` filled.
- **PR A — Core.** Files in `api/`: package manifest and scripts (dev, start, lint, test, seed); `src/server.js` (starts the app) and `src/app.js` (builds the app and registers **every** module router, including stubs for auth, users, properties, dashboard, bookings, valuations, notifications, audit-logs, reports and health, with paths exactly as the contract gives, including the `/api` prefix); configuration that reads and validates all environment variables and fails fast; database pool and a transaction helper using prepared statements only; middleware for request logging, security headers, CORS with credentials from `CORS_ORIGINS`, cookie parsing, the OpenAPI validator (requests and responses in development), not-found, and one central error handler that always returns the contract's `Error` shape with the code names `VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, CONFLICT, INVALID_TRANSITION, RATE_LIMITED, PAYLOAD_TOO_LARGE, INTERNAL_ERROR, NOT_IMPLEMENTED`; authentication middleware that reads the `session` cookie, **loads the user from the database on every request and rejects deactivated users**; role guard supporting the access levels (public, any user, admin-or-superadmin, superadmin only, and "optional auth" as used by property browsing); the health operation fully implemented; every other module stub answering with the error shape and code `NOT_IMPLEMENTED`. Each module folder follows Section 1.5 naming and contains `index.js` exporting its router.
  - **Route order rule (put it in each module's comments):** fixed paths (`/mine`, `/availability`, `/read-all`) must be registered before parameterised ones (`/:id/...`).
- **PR B — Utilities and scripts.** Files in `api/`: pagination helper (page default 1, limit default 20, max 100, returns the contract's page envelope); camelCase/snake_case mapper; date/time helpers fixed to Africa/Nairobi; password helpers (bcrypt; password length 8 to 72); token helpers; async handler; an **audit-log helper** other modules call (action name, entity name, entity id, details, IP, user); storage service with a local-disk driver behind an interface (so Phase 12 can swap it); mailer service interface with an SMTP driver and a log-only driver; upload middleware enforcing max 8 images, 5 MB, jpg/png/webp (checked by content, not just extension); rate limiter presets; `api/scripts/seed-users` that creates one superadmin, one admin and several clients **from the `SEED_*` variables** (idempotent); `api/README.md` (how to run, folder map, module conventions, how to add an endpoint).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-core-skeleton
git add api/package.json api/src/config api/src/db
git commit -m "feat(api): add config validation and mysql pool with transactions"
git add api/src/middleware
git commit -m "feat(api): add security, cors, validation, auth and error middleware"
git add api/src/server.js api/src/app.js api/src/modules
git commit -m "feat(api): register all modules as stubs and implement health"
git push -u origin feat/api-core-skeleton
```
  Reviewer: John. **Merge PR A, then:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-utilities-and-seed
git add api/src/utils
git commit -m "feat(api): add pagination, mapping, time, password and audit helpers"
git add api/src/services/storage api/src/services/mailer
git commit -m "feat(api): add storage and mailer service interfaces with drivers"
git add api/scripts api/package.json
git commit -m "feat(api): add idempotent user seed script"
git add api/README.md
git commit -m "docs(api): document run instructions and module conventions"
git push -u origin feat/api-utilities-and-seed
```
  Reviewer: John.
- **Done when:** health responds; seed script run twice leaves exactly the same users; unimplemented endpoints return the stub error in the contract shape.

### John — services layer (starts after Bessel's PR A is merged)
- **Check first:** Checklist U; `api/src/modules` stubs and error helpers exist in `main`; you do **not** edit `app.js`. Review Bessel's PRs A and B (your duty as reviewer comes first).
- **External steps:** keep progress on the WhatsApp template approval; confirm test recipients; fill the WhatsApp and SMTP values in your own `api/.env`.
- **Files to write:**
  - `api/src/services/whatsapp/` — an interface with two drivers selected by `WHATSAPP_DRIVER`: `stub` (writes the message it would send to the log) and `live` (calls the Meta Cloud API using an approved template). Sending must be non-blocking for callers and must never throw into a request; it returns success or failure.
  - `api/src/services/notifications/` — one function other modules call when a booking or valuation is created. It (1) inserts a notification row (type, human message, entity name, entity id), (2) triggers the WhatsApp message to every number in `WHATSAPP_RECIPIENTS`, (3) reports whether WhatsApp succeeded so the caller can set `whatsappSent`.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-whatsapp-service
git add api/src/services/whatsapp
git commit -m "feat(api): add whatsapp service with stub and live drivers"
git add api/src/services/notifications
git commit -m "feat(api): add notification service writing rows and triggering whatsapp"
git push -u origin feat/api-whatsapp-service
```
  Reviewer: Bessel.

### Kennedy — web application shell
- **Check first:** Checklist U; `ui-kit` v0 merged; `docs/design/page-inventory.md` merged; route map in Section 1.7.
- **Files to write (in `web/`):** Vite React app on port 5173 consuming the `ui-kit` workspace and its theme; manifest and scripts; router with **every** web route in Section 1.7 as a placeholder page (including a not-found page and a "forbidden" page); API client identical in behaviour to Kwame's (reads `VITE_API_BASE_URL`, sends cookies, normalises contract errors) — written independently inside `web/`; layouts: public layout with header (logo, nav: Home, Properties, About, Contact, Help; login/register or account menu), footer (company details, links, WhatsApp click-to-chat if `VITE_WHATSAPP_CHAT_NUMBER` is set); a global error boundary; `web/README.md`.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/web-app-shell
git add web/package.json web/vite.config.js web/index.html web/src/main.jsx
git commit -m "feat(web): scaffold vite react public site using ui kit"
git add web/src/router web/src/pages
git commit -m "feat(web): add full route table with placeholder pages"
git add web/src/api web/src/lib
git commit -m "feat(web): add api client with cookies and contract error handling"
git add web/src/layouts web/src/components
git commit -m "feat(web): add public layout with header, footer and error boundary"
git add web/README.md
git commit -m "docs(web): document folder conventions and run instructions"
git push -u origin feat/web-app-shell
```
  Reviewer: Kwame.

### Kwame — admin layout (starts after `ui-kit` v0 is merged)
- **Check first:** Checklist U; your Phase 2 skeleton is merged; `ui-kit` v0 is in `main`; read `docs/design/page-inventory.md` for the admin pages.
- **Files to write:** wire `admin` to the `ui-kit` theme; admin layout (navy sidebar with brass active marker, top bar with page title, notification bell slot and user menu, responsive collapsing sidebar); sidebar items from Section 1.7 (Users and Audit logs shown to admin-or-superadmin per contract; "change role" actions later are superadmin-only); a "forbidden" and a "not found" page; in `ui-kit/src/admin/` the shared admin-only components you need now: stat card, sidebar layout, page toolbar with filters slot, confirm-destructive dialog; update `admin/README.md`.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-layout
git add admin/src/layouts admin/src/main.jsx
git commit -m "feat(admin): apply ui kit theme and build responsive sidebar layout"
git add ui-kit/src/admin
git commit -m "feat(ui): add admin sidebar, stat card and toolbar components"
git add admin/src/pages
git commit -m "feat(admin): add forbidden and not found pages"
git push -u origin feat/admin-layout
```
  Reviewer: Kennedy.

### Jayden — test infrastructure
- **Check first:** Checklist U; wait until Bessel's PR A and both frontend skeletons are merged.
- **Files to write:** in each workspace, the test-runner config (`jest.config.*` for api, `vitest.config.*` for web, admin, ui-kit); `api/tests/health.test` (health endpoint test through the real app, plus a check that an unimplemented module returns the contract error shape); `api/tests/helpers/` (test database setup and reset, login helper to obtain a session cookie as client/admin/superadmin, a helper that validates any response against the contract); one smoke test per frontend that renders the shell; `docs/test-plan.md` updated with the commands; `docs/testing/test-accounts.md` describing the seeded account **roles** (credentials are shared privately, never in the repo).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b test/infrastructure
git add api/jest.config.js api/tests/helpers
git commit -m "test(api): add jest setup with database and session helpers"
git add api/tests/health.test.js
git commit -m "test(api): add health and stub error shape tests"
git add web/vitest.config.js admin/vitest.config.js ui-kit/vitest.config.js web/tests admin/tests ui-kit/tests
git commit -m "test(ui): add vitest setup and shell smoke tests"
git add docs/test-plan.md docs/testing
git commit -m "docs(test): add test commands and test account roles"
git push -u origin test/infrastructure
```
  (Use the real filenames your agent creates; the rule is: only paths inside your owned folders.) Reviewer: Bessel.
- **Gate check and tag:** confirm every gate item, then tag `phase-3-complete` (same tag commands as Phase 2).

---

# PHASE 4 — Accounts and access (first vertical slice)

**Goal:** register, log in, log out, reset password; admin sign-in; audit log read endpoint. Proves the cookie/CORS setup end to end.
**Requires:** `phase-3-complete`; every member has the DB applied and `npm run` of the API works locally (Bessel's API is needed for the integration checkpoint).
**Finish when (gate):** a new client registers and logs in through `web`; a seeded admin signs in through `admin`; a client who signs in on `admin` is turned away; forgot/reset password works using the sandbox inbox; audit rows exist for these actions; all tests pass. Jayden tags `phase-4-complete`.

### Bessel — auth module
- **Check first:** Checklist U; in the contract read operations `register`, `login`, `logout`, `getMe`, `forgotPassword`, `resetPassword`, the `User`, `RegisterRequest`, `LoginRequest`, `Password` schemas, and the `Set-Cookie` header description.
- **External steps:** confirm the Mailtrap SMTP values in `api/.env`.
- **Files to write:** `api/src/modules/auth/` (routes, controller, service, repository, index) implementing the six operations exactly: register always creates a `client`, hashes the password, logs the user in (201 + cookie); login is rate-limited, rejects wrong credentials (401) and deactivated accounts (403); logout clears the cookie and succeeds even if not logged in (204); `me` returns the current user without secrets; forgot-password **always returns the same 200 message**, stores only a **hash** of the reset token with a one-hour expiry, and emails the link (`WEB_BASE_URL` + the reset route); reset-password validates token and expiry (single use), sets the new password, and invalidates the token. Write audit entries for register, login (success and failed), logout and password reset. Add the auth email template(s) under `api/src/services/mailer/templates`. Cookie flags: HttpOnly, SameSite and Secure from environment variables.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-auth-routes
git add api/src/modules/auth/auth.repository.js api/src/modules/auth/auth.service.js
git commit -m "feat(api): add auth service for register, login and sessions"
git add api/src/modules/auth/auth.controller.js api/src/modules/auth/auth.routes.js api/src/modules/auth/index.js
git commit -m "feat(api): expose register, login, logout and me endpoints"
git add api/src/services/mailer/templates
git commit -m "feat(api): add password reset email template"
git add api/src/modules/auth
git commit -m "feat(api): add forgot and reset password with hashed expiring tokens"
git push -u origin feat/api-auth-routes
```
  Reviewer: John. **Merge before John's PR below.**

### John — audit-logs module
- **Check first:** Checklist U; read operation `listAuditLogs` and the `AuditLog` schema; the audit helper from Phase 3 exists; role guard exists.
- **Files to write:** `api/src/modules/audit-logs/` (routes, controller, service, repository, index) implementing `GET /api/audit-logs` for admin-or-superadmin only with filters `userId, action, from, to` and the page envelope, newest first.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-audit-logs
git add api/src/modules/audit-logs
git commit -m "feat(api): add audit log listing with filters and pagination"
git push -u origin feat/api-audit-logs
```
  Reviewer: Bessel. You may code now, but **merge only after Bessel's auth PR is merged**, then rebase and run the integration test.

### Kennedy — web authentication pages
- **Check first:** Checklist U; read `docs/design/page-inventory.md` rows for `/login`, `/register`, `/forgot-password`, `/reset-password`; read the five auth operations and their error responses; your `.env` points at the **mock**.
- **Files to write (in `web/`):** pages Register, Login, ForgotPassword, ResetPassword (reads the token from the link); an auth context that calls `me` on startup and exposes the user; protected-route wrapper that redirects visitors to login and returns them to the page they wanted; header account menu with logout; field validation matching the contract (email format; password 8 to 72 characters; phone length ≤ 20; names ≤ 100); error display for 400 (field errors), 401, 403 (deactivated), 409 (email taken), 429 (rate limit).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/web-auth-pages
git add web/src/features/auth web/src/api/auth.js
git commit -m "feat(web): add auth api calls and session context"
git add web/src/pages/Login.jsx web/src/pages/Register.jsx
git commit -m "feat(web): add login and register pages with validation"
git add web/src/pages/ForgotPassword.jsx web/src/pages/ResetPassword.jsx
git commit -m "feat(web): add forgot and reset password pages"
git add web/src/router web/src/components
git commit -m "feat(web): add protected routes and account menu with logout"
git push -u origin feat/web-auth-pages
```
  Reviewer: Kwame.
- **Integration checkpoint (after Bessel's PR merges):** pull main, apply migrations, start the real API (seed users), set `VITE_API_BASE_URL` to `http://localhost:4000`, and re-test register → login → me → logout → forgot → reset. Fix issues in a `fix/web-auth-integration` branch with commits like `fix(web): handle ...`.

### Kwame — admin sign-in and access control
- **Check first:** Checklist U; read `login`, `logout`, `getMe` and the role schema; mock `.env`.
- **Files to write (in `admin/`):** Login page; auth context with `me`; route guard that allows only `admin` and `superadmin`; if a `client` signs in, show an access-denied screen and log them out; role-aware menu (hide items the role may not use); automatic redirect to login on any 401, and a friendly screen on 403; logout in the top bar.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-auth-guard
git add admin/src/features/auth admin/src/api/auth.js
git commit -m "feat(admin): add auth api calls and session context"
git add admin/src/pages/Login.jsx
git commit -m "feat(admin): add admin login page"
git add admin/src/router admin/src/layouts
git commit -m "feat(admin): enforce admin and superadmin access with route guard"
git push -u origin feat/admin-auth-guard
```
  Reviewer: Kennedy. Same integration checkpoint as Kennedy.

### Jayden — auth tests, seed images, manual start
- **Check first:** Checklist U; auth PRs merged before you finalise tests.
- **Files to write:** `api/tests/auth.test` covering all six operations: success paths, validation errors, duplicate email, wrong password, deactivated account, rate limit, always-same forgot message, token expiry and single use, cookie flags, response shape against the contract; `docs/testing/manual-cases-auth.md` (click-by-click cases for web and admin); `docs/seed-assets/properties/` with 12 to 15 royalty-free property photos (jpg, under 1 MB each) for Phase 5; start `docs/user-manual/` with the Registering, Logging in and Password reset sections for clients and the Admin sign-in section.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b test/auth
git add api/tests/auth.test.js
git commit -m "test(api): cover register, login, logout, me and password reset"
git add docs/testing/manual-cases-auth.md
git commit -m "docs(test): add manual test cases for authentication"
git add docs/seed-assets
git commit -m "docs(docs): add seed property photos"
git add docs/user-manual
git commit -m "docs(manual): draft registration, login and password reset sections"
git push -u origin test/auth
```
  Reviewer: Bessel.
- **Gate check and tag:** run the gate items by hand, tag `phase-4-complete`.

---

# PHASE 5 — Property listings (browse, filter, admin CRUD, images)

**Goal:** visitors browse and filter listings; admins add, edit, delete listings and manage images.
**Requires:** `phase-4-complete`.
**Finish when (gate):** a visitor filters and views listings on `web` with real data and images; an admin creates a listing with images, edits it, changes the primary image, and deletes it on `admin`; deleting a property with bookings is refused (409, to be re-tested in Phase 6); a listings page with several images loads in about 3 seconds locally; all tests pass. Jayden tags `phase-5-complete`.

### Bessel — properties module and seed images
- **Check first:** Checklist U; read operations `listProperties`, `getProperty`, `createProperty`, `updateProperty`, `deleteProperty`, `addPropertyImages`, `deletePropertyImage`, `setPrimaryImage` and the schemas `Property`, `PropertyDetail`, `PropertyInput`, `PropertyUpdate`, `PropertyImage`; the descriptions about optional authentication, 8 images / 5 MB limit, 413, and 409 on delete.
- **Files to write:** `api/src/modules/properties/` (routes, controller, service, repository, index): listing is **public with optional authentication**; anonymous users and clients only ever see `available` properties; admins may filter any status; filters `q` (title, description, location), `category`, `listingType`, `location`, `minPrice`, `maxPrice`, `status`, `sort` (`newest, priceAsc, priceDesc`), page and limit; list items include `primaryImageUrl`; detail returns all images and returns 404 for non-available properties to non-admins; create (multipart) validates fields and images, makes the first image primary; update changes only the sent fields; delete refuses with 409 when bookings exist and otherwise removes the property, rows and files; add images enforces the 8-image total; deleting the primary image promotes the oldest remaining one; set-primary runs in a transaction so exactly one image is primary and returns the updated image list. All writes call the audit helper. Serve uploaded files statically from the upload directory. Add a step to the seed script to copy `docs/seed-assets/properties/*` into the upload folder and point the seeded image rows at them.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-properties
git add api/src/modules/properties/properties.repository.js api/src/modules/properties/properties.service.js
git commit -m "feat(api): add property repository and service with filtering and sorting"
git add api/src/modules/properties/properties.controller.js api/src/modules/properties/properties.routes.js api/src/modules/properties/index.js
git commit -m "feat(api): expose property browse, detail, create, update and delete"
git add api/src/modules/properties
git commit -m "feat(api): add image upload, deletion and primary image handling"
git add api/scripts api/src/app.js
git commit -m "feat(api): serve uploaded images and extend seed with property photos"
git push -u origin feat/api-properties
```
  (`app.js` should need no edit; if it does not, leave it out of `git add`.) Reviewer: John.

### John — support work (no new module this phase)
- **Check first:** Checklist U.
- **Tasks:** review Bessel's PR carefully against the contract (reviewer duty). Then prepare, **without committing code outside your paths**: write down in the PR conversation the exact booking-related rules you will implement next phase for the contract's booking description, so Bessel can confirm the DB design supports them (double-booking prevention, cancelled slots freed, Sunday and past-date rejection, one active booking per client per property).
- **Git:** none unless review comments require a fix inside your own paths.

### Kennedy — public listing pages
- **Check first:** Checklist U; page inventory rows for `/`, `/properties`, `/properties/:id`; read `listProperties`, `getProperty`; mock `.env` initially.
- **Files to write (in `web/`):** property card (image, price badge, location, beds/baths/size, listing type and status badges); Home page (hero search bar, featured newest listings, categories, short company introduction); Properties page with filter panel (q, category, listing type, location, min and max price, sort), filters stored in the page URL so links are shareable, paginated results, loading skeletons, empty state and error state; Property Detail page (image gallery with primary image first and thumbnails, details, price, call-to-action buttons "Book a viewing" and "Request a valuation" that send visitors to login first and return them afterwards); lazy-loaded images and sensible image sizes (listing load target ≈ 3 seconds); responsive layout.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/web-listings
git add web/src/features/properties web/src/api/properties.js
git commit -m "feat(web): add property api calls and listing card component"
git add web/src/pages/Properties.jsx
git commit -m "feat(web): add property search page with filters and pagination"
git add web/src/pages/PropertyDetail.jsx
git commit -m "feat(web): add property detail page with image gallery"
git add web/src/pages/Home.jsx
git commit -m "feat(web): add home page with search and featured listings"
git push -u origin feat/web-listings
```
  Reviewer: Kwame. **Integration checkpoint** after Bessel's PR merges: switch to the real API and re-test.

### Kwame — admin listings management
- **Check first:** Checklist U; page inventory rows for `/listings`, `/listings/new`, `/listings/:id/edit`; read all eight property operations; note that creating uses multipart and updating uses JSON.
- **Files to write (in `admin/`):** Listings table (all statuses, status filter, search, pagination, row actions); Create page (fields per `PropertyInput`, image picker with previews, **client-side checks** for max 8 images, 5 MB each, jpg/png/webp); Edit page (JSON update of fields, plus an image manager to add images, delete an image with confirmation, and choose the primary image); delete with confirmation and a clear message when the API answers 409; success and error toasts. In `ui-kit/src/admin/` add the image uploader and image manager components.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-listings
git add admin/src/features/listings admin/src/api/properties.js
git commit -m "feat(admin): add property api calls for listing management"
git add admin/src/pages/Listings.jsx
git commit -m "feat(admin): add listings table with filters and delete confirmation"
git add ui-kit/src/admin
git commit -m "feat(ui): add image uploader and image manager components"
git add admin/src/pages/ListingCreate.jsx admin/src/pages/ListingEdit.jsx
git commit -m "feat(admin): add create and edit listing pages with image management"
git push -u origin feat/admin-listings
```
  Reviewer: Kennedy. Same integration checkpoint.

### Jayden — property tests
- **Check first:** Checklist U; seed photos exist.
- **Files to write:** `api/tests/properties.test` (anonymous vs client vs admin visibility, every filter and sort, pagination, create with and without images, image limits and wrong types, update, delete and the 409 case once bookings exist, primary image rules, audit rows written); `docs/testing/manual-cases-properties.md`; performance note for the 3-second listing target (how measured, result); user-manual sections: Browsing and filtering, Viewing property details, Managing listings (admin).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b test/properties
git add api/tests/properties.test.js
git commit -m "test(api): cover property browse, crud, images and visibility rules"
git add docs/testing/manual-cases-properties.md
git commit -m "docs(test): add manual test cases for listings"
git add docs/user-manual
git commit -m "docs(manual): add browsing and listing management sections"
git push -u origin test/properties
```
  Reviewer: Bessel. Tag `phase-5-complete` after the gate.


# PHASE 6 — Viewing bookings: the main transaction (Deliverable 3 readiness)

**Goal:** a logged-in client books a site viewing; admins are alerted on the dashboard side and by WhatsApp; admins confirm, reschedule, cancel or close it. Also: user management API.
**Requires:** `phase-5-complete`.
**Finish when (gate):** the full booking journey works on real data through `web` and `admin` (see the Deliverable 3 demo script); two simultaneous bookings for the same slot result in exactly one success and one 409; cancelling frees the slot; the property delete refusal (409) now works with real bookings; all tests pass. Jayden tags `phase-6-complete`. **This tag means Deliverable 3 can be presented.**

### John — bookings module
- **Check first:** Checklist U; the notification and WhatsApp services from Phase 3 are in `main`; read all eight operations (`getBookingAvailability`, `createBooking`, `listMyBookings`, `cancelBooking`, `listBookings`, `confirmBooking`, `rescheduleBooking`, `closeBooking`), schemas `Booking`, `Availability`, `BookingStatus`, `TimeOfDay`, and the "Status workflows" and "Booking slots" sections in the contract's top description. Confirm with Bessel (from Phase 5 notes) how the DB prevents double booking.
- **Files to write:** `api/src/modules/bookings/` (routes, controller, service, repository, index). Rules (all binding):
  - **Availability** (public): one-hour slots 09:00 to 16:00, Monday to Saturday; empty list for Sundays and past dates; a slot is unavailable when the property has any non-cancelled booking at that date and time; unknown property → 404.
  - **Create** (any logged-in user): property must exist and be `available` (otherwise 404); date not in the past; slot must be a valid slot; **409** if the slot is taken or the caller already holds an active booking for that property; creates `pending`; runs inside a transaction that locks the slot so simultaneous requests cannot both succeed; then writes the audit row and calls the notification service, and stores `whatsappSent` according to the result. A WhatsApp failure **never fails the booking**.
  - **Mine:** the caller's bookings, newest first, no pagination.
  - **Cancel:** the owner may cancel their own active booking (`pending`, `confirmed`, `rescheduled`); an admin may cancel any active booking; anyone else gets 403; inactive states give 422.
  - **Confirm, reschedule, close:** admin-or-superadmin; follow the workflow exactly (illegal moves → 422); reschedule validates the new slot like a new booking (409 if taken), sets `rescheduled`, and accepts `adminNotes`; close sets `completed`.
  - **List (admin):** filters `status`, `from`, `to`, `propertyId`, paging; each item includes the `property` summary and, for admins only, the `client` summary.
  - Every state change writes an audit row (`booking.create`, `booking.cancel`, `booking.confirm`, `booking.reschedule`, `booking.close`).
  - Route-order rule: `availability` and `mine` before `/:id/...`.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-bookings
git add api/src/modules/bookings/bookings.repository.js
git commit -m "feat(api): add booking repository with slot locking"
git add api/src/modules/bookings/bookings.service.js
git commit -m "feat(api): add booking rules for slots, workflow, permissions and admin alerts"
git add api/src/modules/bookings/bookings.controller.js api/src/modules/bookings/bookings.routes.js api/src/modules/bookings/index.js
git commit -m "feat(api): expose availability, create, list, cancel, confirm, reschedule and close endpoints"
git push -u origin feat/api-bookings
```
  Reviewer: Bessel. (If you prefer smaller commits, split by file, never by re-adding the whole folder.)

### Bessel — users module
- **Check first:** Checklist U; read `listUsers`, `createUser`, `updateUserRole`, `updateUserActive`, `adminResetUserPassword`, the `Role` and `User` schemas, and each operation's description.
- **Files to write:** `api/src/modules/users/` (routes, controller, service, repository, index). Rules: list (admin) with `q` (name, email, phone), `role`, paging; create: an admin may create only `client` users, **only a superadmin may set `admin` or `superadmin`** (otherwise 403), duplicate email → 409; change role: superadmin only, a superadmin cannot change their own role; activate/deactivate: admins cannot deactivate admins or superadmins or themselves, deactivation takes effect immediately (the auth middleware already checks); admin password reset follows the same hierarchy rule; audit rows (`user.create`, `user.role_change`, `user.activate`, `user.deactivate`, `user.password_reset`).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-users
git add api/src/modules/users/users.repository.js api/src/modules/users/users.service.js
git commit -m "feat(api): add user repository and service with role hierarchy rules"
git add api/src/modules/users/users.controller.js api/src/modules/users/users.routes.js api/src/modules/users/index.js
git commit -m "feat(api): expose user list, create, role, active and password reset endpoints"
git push -u origin feat/api-users
```
  Reviewer: John.

### Kennedy — booking pages
- **Check first:** Checklist U; page inventory rows for `/properties/:id/book` and `/my/bookings`; read `getBookingAvailability`, `createBooking`, `listMyBookings`, `cancelBooking`; mock `.env` first, then real at the checkpoint.
- **Files to write (in `web/`):** Book Viewing page (requires login; shows the property summary; date picker that blocks Sundays and past dates; slot grid built from the availability call with unavailable slots disabled; optional notes; submit; success screen explaining the booking is **pending** until an admin confirms; on 409 refresh the grid and tell the user the slot was just taken; on 404 tell the property is no longer available); My Bookings page (list newest first with status badge, property, date and time, admin notes if present; Cancel button for active bookings with a confirm dialog; handle 403/422 politely); links from property detail and the account menu.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/web-bookings
git add web/src/features/bookings web/src/api/bookings.js
git commit -m "feat(web): add booking api calls and availability slot picker"
git add web/src/pages/BookViewing.jsx
git commit -m "feat(web): add book viewing page with conflict handling"
git add web/src/pages/MyBookings.jsx
git commit -m "feat(web): add my bookings page with cancellation"
git add web/src/pages/PropertyDetail.jsx web/src/layouts
git commit -m "feat(web): link property detail and account menu to bookings"
git push -u origin feat/web-bookings
```
  Reviewer: Kwame.

### Kwame — booking management
- **Check first:** Checklist U; page inventory row for `/bookings`; read `listBookings`, `confirmBooking`, `rescheduleBooking`, `closeBooking`, `cancelBooking`, `getBookingAvailability` and the booking workflow.
- **Files to write (in `admin/`):** Bookings page: table with filters (status, from, to, property), paging, status badges, client name and phone (with a WhatsApp chat link) and property title; detail panel showing client notes and admin notes; action buttons **shown only when the workflow allows them for that status**: Confirm (optional notes), Reschedule (date picker plus availability grid for that property, notes), Close as completed (notes), Cancel (confirm dialog); handle 409 (new slot taken) and 422 (status changed meanwhile) by refreshing the row and explaining. In `ui-kit/src/admin/` add the booking action dialogs only if reusable.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-bookings
git add admin/src/features/bookings admin/src/api/bookings.js
git commit -m "feat(admin): add booking api calls and status action rules"
git add admin/src/pages/Bookings.jsx
git commit -m "feat(admin): add bookings table with filters and detail panel"
git add admin/src/features/bookings
git commit -m "feat(admin): add confirm, reschedule, close and cancel dialogs"
git push -u origin feat/admin-bookings
```
  Reviewer: Kennedy. Integration checkpoint for both frontends after John's PR merges.

### Jayden — booking tests and the Deliverable 3 demo script
- **Check first:** Checklist U.
- **Files to write:** `api/tests/bookings.test` (availability rules for Sunday, past date and every slot; create success; duplicate-active-booking 409; taken slot 409; concurrent create race; cancel by owner, by admin, by stranger; all legal and illegal transitions including reschedule conflicts; filters; client summary visible only to admins; WhatsApp stub invoked and failure does not break creation; audit rows); `api/tests/users.test` (every hierarchy rule and 403/409 case); `docs/testing/manual-cases-bookings.md`; **`docs/demo/deliverable3-demo-script.md`** — a numbered, click-by-click presentation script that shows each Deliverable 3 item: the database in a DBMS tool, the front-end, the admin panel, the front-end writing to the DB (register, book), the admin panel reading and updating the same data (confirm); user-manual sections for booking, cancelling and managing bookings.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b test/bookings-and-users
git add api/tests/bookings.test.js
git commit -m "test(api): cover booking availability, rules, workflow and concurrency"
git add api/tests/users.test.js
git commit -m "test(api): cover user management and role hierarchy"
git add docs/testing/manual-cases-bookings.md docs/demo
git commit -m "docs(test): add booking test cases and deliverable 3 demo script"
git add docs/user-manual
git commit -m "docs(manual): add booking sections for clients and admins"
git push -u origin test/bookings-and-users
```
  Reviewer: Bessel. Run the demo script end to end on a clean database; fix wording; tag `phase-6-complete`.

---

# PHASE 7 — Valuations, notifications, dashboard

**Goal:** valuation requests from submission to completion; admin notification centre; admin dashboard figures.
**Requires:** `phase-6-complete`.
**Finish when (gate):** a client submits a valuation and sees it move through `submitted → under_review → completed` with admin notes; the admin receives a bell notification (and a WhatsApp stub/live message) for new bookings and valuations; the dashboard shows correct counts; all tests pass. Jayden tags `phase-7-complete`.

### John — valuations and notifications modules
- **Check first:** Checklist U; read `createValuation`, `listMyValuations`, `listValuations`, `updateValuationStatus`, `listNotifications`, `markNotificationRead`, `markAllNotificationsRead`, schemas `Valuation`, `ValuationStatus`, `ValuationPurpose`, `Notification`, and the valuation workflow description.
- **Files to write:**
  - `api/src/modules/valuations/`: create (any logged-in user; status `submitted`; audit; notification + WhatsApp call, same non-blocking rule as bookings); mine (newest first, includes `adminNotes`, no pagination); list (admin, `status` filter, paging, includes `client` summary); status update (admin): **only `submitted → under_review → completed`**, anything else 422, sets `handledBy` to the caller, stores `adminNotes`, audit row `valuation.status_update`.
  - `api/src/modules/notifications/`: list (admin; `unread=true` filter; returns `items` newest first and `unreadCount`), mark one read (404 if missing), mark all read. Route-order rule: `read-all` before `/:id/read`.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-valuations
git add api/src/modules/valuations
git commit -m "feat(api): add valuation submission, listing and workflow endpoints"
git add api/src/services/notifications
git commit -m "feat(api): notify admins when valuation requests are submitted"
git push -u origin feat/api-valuations
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-notifications
git add api/src/modules/notifications
git commit -m "feat(api): add notification list, read and read-all endpoints"
git push -u origin feat/api-notifications
```
  Two separate PRs. Reviewer for both: Bessel.

### Bessel — dashboard and demo data
- **Check first:** Checklist U; read `getDashboardStats` and the `DashboardStats` schema; the DB tables exist since Phase 2.
- **Files to write:** `api/src/modules/dashboard/` implementing `GET /api/dashboard/stats` (admin-or-superadmin) with the exact shape: property counts (`total, available, sold, rented`), booking counts (`total, pending, confirmed, upcoming` where upcoming = active bookings dated today or later), valuation counts (`total, submitted, underReview, completed`), user counts (`total, clients`), and `unreadNotifications`. Use aggregate queries (not row loading). Extend the seed script with an optional `--demo` mode that adds realistic bookings and valuations in several statuses so dashboards and reports are not empty during demos.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-dashboard
git add api/src/modules/dashboard
git commit -m "feat(api): add dashboard statistics with aggregate queries"
git add api/scripts
git commit -m "feat(api): add demo data mode to seed script"
git push -u origin feat/api-dashboard
```
  Reviewer: John.

### Kennedy — valuation pages
- **Check first:** Checklist U; page inventory rows for `/valuation/request` and `/my/valuations`; read `createValuation`, `listMyValuations` and the enums for category and purpose.
- **Files to write (in `web/`):** Valuation Request form (requires login): property category, location, optional LR number, optional approximate size, purpose, additional details; validation matching contract lengths (location ≤ 150, LR number ≤ 50, size ≤ 50); success confirmation; My Valuations page: list newest first with a three-step progress indicator (submitted, under review, completed), status badge, and visible admin notes; empty and error states; navigation links.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/web-valuations
git add web/src/features/valuations web/src/api/valuations.js
git commit -m "feat(web): add valuation api calls and status progress component"
git add web/src/pages/ValuationRequest.jsx
git commit -m "feat(web): add valuation request form with validation"
git add web/src/pages/MyValuations.jsx web/src/layouts
git commit -m "feat(web): add my valuations page and navigation links"
git push -u origin feat/web-valuations
```
  Reviewer: Kwame.

### Kwame — valuations, notification bell, dashboard
- **Check first:** Checklist U; page inventory rows for `/valuations` and `/`; read `listValuations`, `updateValuationStatus`, the three notification operations, `getDashboardStats`.
- **Files to write (in `admin/`):** Valuations page (table, status filter, paging, client name/phone, detail panel; the only enabled action is the **next valid status**; admin notes field; handle 422 by refreshing); notification bell in the top bar (unread badge from `unreadCount`, refreshed on a modest interval and when the window regains focus; dropdown list; click marks one read and opens the related booking or valuation; "mark all read"); Dashboard page (stat cards for properties, bookings, valuations, users, unread notifications from the stats call; quick links to pending bookings and submitted valuations; a simple chart built from the returned counts).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-valuations
git add admin/src/features/valuations admin/src/api/valuations.js admin/src/pages/Valuations.jsx
git commit -m "feat(admin): add valuations table with workflow status actions"
git push -u origin feat/admin-valuations
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-notifications
git add admin/src/features/notifications admin/src/api/notifications.js admin/src/layouts
git commit -m "feat(admin): add notification bell with unread count and read actions"
git push -u origin feat/admin-notifications
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-dashboard
git add admin/src/features/dashboard admin/src/api/dashboard.js admin/src/pages/Dashboard.jsx
git commit -m "feat(admin): add dashboard with statistic cards and quick links"
git push -u origin feat/admin-dashboard
```
  Three separate PRs. Reviewer for all: Kennedy.

### Jayden — tests and docs
- **Files to write:** `api/tests/valuations.test` (create, mine, list, every legal and illegal status move, `handledBy`, notes, audit, notification created); `api/tests/notifications.test` (list, unread filter, unreadCount, mark one, mark all, 404); `api/tests/dashboard.test` (counts versus known data, access control); manual cases; user-manual sections for valuation requests, notifications and the dashboard.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b test/valuations-notifications-dashboard
git add api/tests/valuations.test.js api/tests/notifications.test.js
git commit -m "test(api): cover valuation workflow and notification endpoints"
git add api/tests/dashboard.test.js
git commit -m "test(api): cover dashboard statistics and access control"
git add docs/testing docs/user-manual
git commit -m "docs(manual): add valuation, notification and dashboard sections"
git push -u origin test/valuations-notifications-dashboard
```
  Reviewer: Bessel. Tag `phase-7-complete` after the gate.

---

# PHASE 8 — User management, audit log viewer, remaining public pages

**Goal:** finish every remaining screen that has an API already.
**Requires:** `phase-7-complete`.
**Finish when (gate):** a superadmin creates users, changes roles, deactivates, and resets passwords (with every hierarchy rule enforced in the UI and API); the audit log viewer filters correctly; the public site has About, Contact, Help, Terms, Privacy and error pages. Jayden tags `phase-8-complete`.

### Kwame — users and audit log screens
- **Check first:** Checklist U; page inventory rows for `/users` and `/audit-logs`; read the five user operations and `listAuditLogs`; note which actions are superadmin-only.
- **Files to write (in `admin/`):** Users page: table with search (`q`), role filter, paging; create-user dialog (role dropdown shows only `client` for admins, all three roles for superadmins); change-role action visible only to superadmins and never on one's own row; activate/deactivate with confirmation (hidden or disabled for admins acting on admins/superadmins and on oneself); reset-password dialog; clear messages for 403/409. Audit Logs page: filters (user, action, from, to), paging, readable action names, details expandable, newest first.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-users
git add admin/src/features/users admin/src/api/users.js admin/src/pages/Users.jsx
git commit -m "feat(admin): add user management with role hierarchy rules"
git push -u origin feat/admin-users
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-audit-logs
git add admin/src/features/audit-logs admin/src/api/audit-logs.js admin/src/pages/AuditLogs.jsx
git commit -m "feat(admin): add audit log viewer with filters and pagination"
git push -u origin feat/admin-audit-logs
```
  Reviewer: Kennedy.

### Kennedy — remaining public pages
- **Check first:** Checklist U; page inventory rows for About, Contact, Help, Terms, Privacy, not-found and forbidden.
- **Files to write (in `web/`):** About (company story, services: valuation and property management, team-style trust section); Contact (company address, phone, email, map link, WhatsApp click-to-chat button; **no form**, the contract has no contact endpoint); Help (FAQ for registering, booking, cancelling, valuations, password reset; links to the user manual PDF once Jayden publishes it); Terms and Privacy pages (clear plain-language drafts); polished not-found and forbidden pages; page titles and meta descriptions on every page; footer links.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/web-static-pages
git add web/src/pages/About.jsx web/src/pages/Contact.jsx
git commit -m "feat(web): add about and contact pages"
git add web/src/pages/Help.jsx
git commit -m "feat(web): add help page with faq"
git add web/src/pages/Terms.jsx web/src/pages/Privacy.jsx web/src/pages/NotFound.jsx web/src/pages/Forbidden.jsx
git commit -m "feat(web): add terms, privacy and error pages"
git push -u origin feat/web-static-pages
```
  Reviewer: Kwame.

### Bessel — API consistency review
- **Check first:** Checklist U.
- **Tasks and files (only in your own paths):** run the whole API against the contract; list every response that does not validate; fix them (e.g. `fix(api): return page envelope on ...`); review database indexes against the actual queries of Phases 5 to 7 and add a new numbered migration `0008_...sql` only if a measured query needs it; update `db/README.md`.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b fix/api-contract-consistency
git add api/src
git commit -m "fix(api): align responses with contract schemas"
git push -u origin fix/api-contract-consistency
```
  Reviewer: John. (Skip the branch if there is nothing to fix and say so in the group chat.)

### John — audit coverage check
- **Check first:** Checklist U; Appendix D (audit action names).
- **Task:** go through every write operation in the API; confirm each one writes an audit row with a correct action, entity and user; report gaps to the owning module's owner in the group chat (do not edit their files). Make fixes only inside your own modules.
- **Git:** only if you fix something in your paths: `git checkout -b fix/api-audit-coverage`, then commit `fix(api): record missing audit entries for ...`.

### Jayden — manual and tests
- **Files to write:** `api/tests/audit.test` (every write operation leaves an audit row); manual test cases for users and audit pages; user-manual sections for user management, audit logs, and the Help page content.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b test/audit-and-admin-screens
git add api/tests/audit.test.js
git commit -m "test(api): verify every write operation records an audit entry"
git add docs/testing docs/user-manual
git commit -m "docs(manual): add user management and audit log sections"
git push -u origin test/audit-and-admin-screens
```
  Reviewer: Bessel. Tag `phase-8-complete`.


# PHASE 9 — Reports

**Goal:** branded, filterable, sortable PDF and CSV reports.
**Requires:** `phase-8-complete`; demo data seeded (Phase 7) so reports have content.
**Finish when (gate):** all three reports download as both PDF and CSV from the admin panel; every PDF shows company name, logo, generation date and time, applied filters and page numbers; filtering and sorting visibly change the output. Jayden tags `phase-9-complete`.

### John — reports module
- **Check first:** Checklist U; read `reportBookings`, `reportValuations`, `reportListings`, the `ReportFormat` parameter, the `ReportFile` response and the `Content-Disposition` header description; confirm the logo files in `docs/brand/`.
- **External steps:** none, apart from confirming with Jayden which logo version is final.
- **Files to write:** `api/src/modules/reports/` (routes, controller, service, repository, index) plus `api/src/modules/reports/assets/` holding a **copy** of the final logo from `docs/brand/`. Rules:
  - All three are admin-or-superadmin. `format` is required (`pdf` or `csv`); an unknown format or `from` later than `to` → 400.
  - Bookings report filters: `from`, `to`, `status`, `sort` (`dateAsc`, `dateDesc`, `statusAsc`, default `dateDesc`). Valuations: `from`, `to`, `status`. Listings: `category`, `status`.
  - **PDF layout:** header with logo and company name "Kiragu & Mwangi", report title, generated date and time (Nairobi), a one-line summary of the filters used, a clean table whose header row repeats on every page, summary totals (counts by status) at the end, footer with page numbers "Page X of Y". Landscape if the table is wide.
  - **CSV:** header row, same columns and order as the PDF table, UTF-8 so Excel opens it correctly.
  - Response headers: correct content type and an attachment filename in the form `<report>-<date>.<pdf|csv>`.
  - Large result sets must stream or page internally; never build an unbounded array in memory.
  - Write an audit row `report.generate` (include the report name, format and filters in details).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/api-reports
git add api/src/modules/reports/reports.repository.js api/src/modules/reports/reports.service.js
git commit -m "feat(api): add report queries with filtering and sorting"
git add api/src/modules/reports/assets
git commit -m "feat(api): add company logo asset for reports"
git add api/src/modules/reports/pdf api/src/modules/reports/csv
git commit -m "feat(api): add branded pdf and csv generators"
git add api/src/modules/reports/reports.controller.js api/src/modules/reports/reports.routes.js api/src/modules/reports/index.js
git commit -m "feat(api): expose bookings, valuations and listings report endpoints"
git push -u origin feat/api-reports
```
  Reviewer: Bessel.

### Kwame — reports page
- **Check first:** Checklist U; page inventory row for `/reports`; read the three report operations and their query parameters.
- **Files to write (in `admin/`):** Reports page with three report cards (Bookings, Valuations, Listings); each card has its own filter controls exactly matching the contract's parameters (date range, status, category, sort), a format choice (PDF or CSV) and a Download button; download handled as a file (use the filename the server sends), with a busy state and a clear error for 400/401/403; validation that `from` is not after `to`.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-reports
git add admin/src/features/reports admin/src/api/reports.js
git commit -m "feat(admin): add report download api calls with file handling"
git add admin/src/pages/Reports.jsx
git commit -m "feat(admin): add reports page with filters and format choice"
git push -u origin feat/admin-reports
```
  Reviewer: Kennedy.

### Bessel — performance review
- **Check first:** Checklist U.
- **Tasks:** with the demo dataset enlarged (several thousand rows, via the seed script's demo mode), measure the listing, bookings list, audit log and report queries; examine their execution plans; add indexes through a new numbered migration only where measurements justify it; confirm listing responses stay well within the 3-second target.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b chore/db-performance-indexes
git add db/migrations db/README.md
git commit -m "chore(db): add indexes for slow list and report queries"
git push -u origin chore/db-performance-indexes
```
  Reviewer: John. (Skip if nothing needs changing.)

### Kennedy — web performance pass
- **Check first:** Checklist U.
- **Tasks (in `web/`):** route-level code splitting; lazy-load images with proper dimensions; cache listing queries sensibly; check bundle size; run a Lighthouse audit on Home, Properties and Property Detail (mobile profile) and fix what it reports within reason; record the numbers in the PR description.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b chore/web-performance
git add web/src
git commit -m "chore(web): add route code splitting and image lazy loading"
git push -u origin chore/web-performance
```
  Reviewer: Kwame.

### Jayden — report checks
- **Files to write:** `api/tests/reports.test` (access, formats, 400 cases, filenames, content types, filters change counts, sorts, audit row); `docs/testing/report-samples/` with one PDF and one CSV of each report as evidence; user-manual section on reports; manual visual checklist for PDF layout (logo, name, date, page numbers, repeated header row).
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b test/reports
git add api/tests/reports.test.js
git commit -m "test(api): cover report access, formats, filters, sorting and audit"
git add docs/testing/report-samples docs/user-manual
git commit -m "docs(test): add report samples and manual report section"
git push -u origin test/reports
```
  Reviewer: Bessel. Tag `phase-9-complete`.

---

# PHASE 10 — Hardening, validation, help facilities and polish

**Goal:** make the system secure, forgiving and presentable. Every member works inside their own area against the checklists below.
**Requires:** `phase-9-complete`.
**Finish when (gate):** every checklist item below is ticked in the PR descriptions; the full test suite passes; no console errors on any page; manual security probes fail as they should. Jayden tags `phase-10-complete`.

### Bessel — security and database review
- **Check first:** Checklist U.
- **Review list (fix inside your owned paths, report anything else):**
  1. Search the whole API for any query built by joining strings; there must be none (prepared statements only).
  2. Passwords hashed; reset tokens stored hashed; no secret ever logged or returned.
  3. Cookie flags correct per environment; strong `JWT_SECRET`; sensible expiry; deactivated users rejected on the next request.
  4. CORS allows only the configured web and admin origins, with credentials.
  5. Security headers on; request body size limits; upload content-type checks by content; upload filenames randomised.
  6. Rate limits tuned for login, register, forgot-password.
  7. Error responses never leak stack traces or SQL.
  8. `km_app` has only the privileges it needs; root is not used by the app.
  9. Run the dependency vulnerability audit and update packages with known serious issues (each in its own `chore/deps-...` PR).
  10. `.env` files are not tracked and no secret exists in git history.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b fix/api-security-hardening
git add api/src
git commit -m "fix(api): tighten security middleware, limits and error responses"
git push -u origin fix/api-security-hardening
```
  Reviewer: John.

### John — integration resilience
- **Check first:** Checklist U.
- **Review list (your modules and services):** WhatsApp failures are logged but never break a request; add a bounded retry for transient failures; no tokens or phone numbers in logs; report generation handles empty results and large results; every error path returns the contract's error shape; code comments and naming meet Section 1.5.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b fix/api-integration-resilience
git add api/src/services/whatsapp api/src/services/notifications api/src/modules/reports
git commit -m "fix(api): add bounded retries and safer logging for integrations"
git push -u origin fix/api-integration-resilience
```
  Reviewer: Bessel.

### Kennedy — public site polish, help facilities and extras
- **Check first:** Checklist U.
- **Checklist:** form validation parity with the contract on every form; every API error shown with a clear human message (no raw codes); loading, empty and error states on every page; a global toast for network failures; keyboard navigation and visible focus; colour contrast; works at 360px; consistent spacing with the style guide; **help facilities:** contextual hints on forms, a Help page linked in header and footer, "Need help?" links on booking and valuation pages.
- **Optional creativity features (front-end only; no new endpoints):** mortgage repayment calculator on property detail; share-link and print-friendly property view; "recently viewed" and "saved properties" kept in the browser; WhatsApp "ask about this property" button using `VITE_WHATSAPP_CHAT_NUMBER`.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b fix/web-validation-and-states
git add web/src
git commit -m "fix(web): align validation and error messages with the contract"
git push -u origin fix/web-validation-and-states
git checkout main
git pull --ff-only origin main
git checkout -b feat/web-help-and-extras
git add web/src
git commit -m "feat(web): add contextual help, mortgage calculator and saved properties"
git push -u origin feat/web-help-and-extras
```
  Reviewer: Kwame.

### Kwame — admin polish and help facilities
- **Check first:** Checklist U.
- **Checklist:** same validation, error, state, accessibility and responsive checks as Kennedy's; confirm destructive actions (delete, deactivate, cancel) always confirm first; tables usable on tablets; **help facilities:** an admin Help page (task-by-task guide for each module, role permissions table, definitions of statuses and workflows), tooltips on non-obvious controls, link to the manual.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b fix/admin-validation-and-states
git add admin/src
git commit -m "fix(admin): align validation and error messages with the contract"
git push -u origin fix/admin-validation-and-states
git checkout main
git pull --ff-only origin main
git checkout -b feat/admin-help
git add admin/src/pages/Help.jsx admin/src/features/help
git commit -m "feat(admin): add admin help page and contextual tooltips"
git push -u origin feat/admin-help
```
  Reviewer: Kennedy.

### Jayden — security probes and quality sweep
- **Files to write:** `api/tests/security.test` (attempted injection strings in every search and filter parameter, oversized bodies, wrong content types, forged or expired cookies, deactivated user's old session, access to admin endpoints with a client session, mass-assignment attempts such as a client sending a role at registration); `docs/testing/security-checklist.md` (result of each item above); `docs/testing/accessibility-checklist.md`; a coding-standards review report (comments, naming, dead code, TODOs) with one issue per finding assigned to the owner.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b test/security-and-quality
git add api/tests/security.test.js
git commit -m "test(api): add security probes for injection, access control and sessions"
git add docs/testing
git commit -m "docs(test): add security, accessibility and code quality checklists"
git push -u origin test/security-and-quality
```
  Reviewer: Bessel. Tag `phase-10-complete`.

---

# PHASE 11 — Full testing and bug fixing

**Goal:** prove the whole system works against the contract and the marking criteria, then fix what is found.
**Requires:** `phase-10-complete`.
**Finish when (gate):** all test suites pass in CI; the end-to-end scenarios below pass on a clean database; no open issue labelled critical or high; the contract-conformance run passes for all 40 operations. Jayden tags `phase-11-complete`.

### Jayden — leads
- **Check first:** Checklist U; the test plan and test accounts roles are current.
- **Steps:**
  1. Reset the database from zero (migrations, seed, seed-users with `--demo`), start API, web and admin in real mode.
  2. **Contract conformance:** exercise every one of the 40 operations (Appendix A) and validate each response against the contract; record results in `docs/testing/conformance-report.md`.
  3. **End-to-end scenarios** (write each as numbered steps in `docs/testing/e2e-scenarios.md` and run them): (S1) visitor browses, registers, books, admin confirms, client sees confirmed, WhatsApp message observed; (S2) valuation submitted and taken to completed; (S3) admin full listing lifecycle with images; (S4) superadmin creates an admin, admin attempts forbidden actions; (S5) forgot password; (S6) deactivated user's session stops working immediately; (S7) two clients book the same slot at once; (S8) cancel frees the slot; (S9) every report in both formats; (S10) property with bookings cannot be deleted.
  4. Cross-browser (current Chrome, Firefox, Edge) and mobile-viewport pass; performance check of the 3-second target; accessibility spot checks.
  5. File every defect as a GitHub issue with: title, steps, expected, actual, severity (critical, high, medium, low), and a label naming the owner (`owner:bessel`, `owner:john`, `owner:kennedy`, `owner:kwame`).
- **Git (for your own files):**
```
git checkout main
git pull --ff-only origin main
git checkout -b test/e2e-and-conformance
git add docs/testing
git commit -m "docs(test): add conformance report and end to end scenarios"
git add api/tests
git commit -m "test(api): add end to end regression tests for the main scenarios"
git push -u origin test/e2e-and-conformance
```
  Reviewer: Bessel.

### Bessel, John, Kennedy, Kwame — fix your issues
- **Check first:** Checklist U; read the issue fully; reproduce it before changing anything; confirm the file to change is yours (otherwise reassign the issue to its owner).
- **Procedure per issue (replace N with the issue number):**
```
git checkout main
git pull --ff-only origin main
git checkout -b fix/<area>-issue-N-<short-name>
   ... fix, and ask Jayden's tests or your own to prove it ...
git add <specific paths>
git commit -m "fix(<scope>): <what was wrong and now works> (#N)"
git push -u origin fix/<area>-issue-N-<short-name>
```
  Example branch names: `fix/api-issue-14-slot-race`, `fix/web-issue-21-filter-reset`, `fix/admin-issue-9-reschedule-dialog`. Reviewer follows Section 2. Add a regression test with every fix where possible (tests are Jayden's folders: ask Jayden to add it, or open the issue back to them).

Tag `phase-11-complete` when the gate holds.

---

# PHASE 12 — Documentation, packaging, deployment and release

**Goal:** a documented system running live on the web, with a tagged release.
**Requires:** `phase-11-complete`.
**Finish when (gate):** the live system passes the production smoke checklist; the user manual and installation guide are complete; `v1.0.0` is tagged. Jayden tags `phase-12-complete`.

### Bessel — deployment of API and database
- **Check first:** Checklist U; all production secrets prepared and **not** shared in chat or committed.
- **External steps:**
  1. Create a Railway project; add a MySQL database service and an API service from this repository (root directory `api`).
  2. Set every environment variable from Section 1.4 for production: production mode, strong new `JWT_SECRET`, secure cookies, correct `SameSite`, `COOKIE_DOMAIN`, `CORS_ORIGINS` listing the deployed web and admin origins, SMTP provider values, `WHATSAPP_DRIVER=live` after John's confirmation.
  3. **File storage:** attach a persistent volume to the API service for uploads (the container's own disk is wiped on redeploy), or switch `STORAGE_DRIVER` to an object-storage driver if one is added (new driver goes in as its own PR).
  4. Use **custom subdomains of one registrable domain** (for example `api.`, `www.` and `admin.`), so the session cookie works across them without third-party cookie problems. Configure DNS and HTTPS.
  5. Apply all migrations to the production database as an administrator account; create the `km_app`-style limited user for the API.
  6. Run the user seed for **superadmin only**, with a new strong password. Do not seed test accounts in production. Seed sample properties only if the group wants demo content.
  7. Turn on automatic database backups.
  8. Confirm the health endpoint on the live URL.
- **Optional portability (recommended):** add a container setup so the whole stack can be started locally with one command.
- **Files to write (optional portability):** `api/Dockerfile`, `docker-compose.yml` (API and MySQL), and `docs/installation-guide.md` coordinated with Jayden.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b chore/deployment-config
git add api/Dockerfile docker-compose.yml
git commit -m "chore(repo): add container setup for portable local and hosted runs"
git add api/.env.example
git commit -m "docs(env): document production environment variables"
git push -u origin chore/deployment-config
```
  Reviewer: John.

### John — production integrations
- **External steps:** switch the WhatsApp app to a permanent access token (system user), verify the approved template is live, add production admin recipient numbers to `WHATSAPP_RECIPIENTS` via Bessel, send a real test booking notification; configure the production email provider (verified sender domain, SPF and DKIM) and send a real password-reset email; confirm failure handling by temporarily using a wrong token on staging.
- **Git:** none unless a fix is needed (`fix(api): ...` on `fix/api-production-integrations`).

### Kennedy — deploy the public site
- **Check first:** Checklist U; Bessel's API URL is live.
- **External steps:** create a project on the chosen static host from this repository for the `web` workspace (build from the repo root with the workspace's build script); set `VITE_API_BASE_URL` (and `VITE_WHATSAPP_CHAT_NUMBER`) as build variables; add a single-page-app fallback so deep links such as `/properties/12` work; attach the `www` subdomain; verify HTTPS.
- **Git:** only if the host needs a config file inside `web/`:
```
git checkout main
git pull --ff-only origin main
git checkout -b chore/web-deploy-config
git add web
git commit -m "chore(web): add static host configuration with spa fallback"
git push -u origin chore/web-deploy-config
```
  Reviewer: Kwame.

### Kwame — deploy the admin panel
- Same steps as Kennedy for the `admin` workspace and the `admin` subdomain. Branch `chore/admin-deploy-config`, commit `chore(admin): add static host configuration with spa fallback`. Reviewer: Kennedy.

### Jayden — documentation, release gate, rehearsal
- **Files to write:** final user manual (client part and admin part, with screenshots) exported to PDF and placed in `docs/user-manual/`; `docs/installation-guide.md` (prerequisites, database setup, environment files, run commands, seeding, how to deploy); final `README.md` content proposals to Bessel (he owns the root file: raise a PR request to him); final diagrams: updated use case and flowchart, a **class diagram**, an **ER diagram regenerated from the real database**, and the final database schema document; `docs/presentation/outline.md` and `docs/presentation/demo-script.md` for the Deliverable 4 presentation mapped to the marking criteria (database normalisation and relationships, uniformity, add/delete/update/search, help, the main transaction, access levels, reports with name and logo, frameworks used, validation and error handling, creativity, coding practices, deployment, user manual, audit logs, security); a production smoke checklist.
- **Git:**
```
git checkout main
git pull --ff-only origin main
git checkout -b docs/final-documentation
git add docs/user-manual
git commit -m "docs(manual): finalise client and admin user manual"
git add docs/installation-guide.md
git commit -m "docs(docs): add installation and deployment guide"
git add docs/diagrams
git commit -m "docs(diagrams): add class diagram and er diagram from the final database"
git add docs/presentation
git commit -m "docs(docs): add final presentation outline and demo script"
git push -u origin docs/final-documentation
```
  Reviewer: Bessel.
- **Production smoke checklist (run on the live URLs):** register, log in, browse and filter, book a viewing, receive the WhatsApp message, admin confirms, client sees the update, submit a valuation and complete it, create a listing with images, deactivate and reactivate a user, download all three reports in both formats, view audit logs, forgot password email arrives, logout.
- **Release:** after everything above passes:
```
git fetch origin
git tag phase-12-complete origin/main
git push origin phase-12-complete
```
  Then **Bessel** creates the release tag:
```
git checkout main
git pull --ff-only origin main
git tag -a v1.0.0 -m "Kiragu and Mwangi Real Estate Management System v1.0.0"
git push origin v1.0.0
```
  Rehearse the presentation twice using the demo script.

---

# APPENDICES

## Appendix A — Contract coverage (every operation, owner, phase)

| # | Operation id | Method and path | Owner | Phase |
|---|---|---|---|---|
| 1 | register | POST /api/auth/register | Bessel | 4 |
| 2 | login | POST /api/auth/login | Bessel | 4 |
| 3 | logout | POST /api/auth/logout | Bessel | 4 |
| 4 | getMe | GET /api/auth/me | Bessel | 4 |
| 5 | forgotPassword | POST /api/auth/forgot-password | Bessel | 4 |
| 6 | resetPassword | POST /api/auth/reset-password | Bessel | 4 |
| 7 | listUsers | GET /api/users | Bessel | 6 |
| 8 | createUser | POST /api/users | Bessel | 6 |
| 9 | updateUserRole | PATCH /api/users/{id}/role | Bessel | 6 |
| 10 | updateUserActive | PATCH /api/users/{id}/active | Bessel | 6 |
| 11 | adminResetUserPassword | POST /api/users/{id}/reset-password | Bessel | 6 |
| 12 | listProperties | GET /api/properties | Bessel | 5 |
| 13 | createProperty | POST /api/properties | Bessel | 5 |
| 14 | getProperty | GET /api/properties/{id} | Bessel | 5 |
| 15 | updateProperty | PUT /api/properties/{id} | Bessel | 5 |
| 16 | deleteProperty | DELETE /api/properties/{id} | Bessel | 5 |
| 17 | addPropertyImages | POST /api/properties/{id}/images | Bessel | 5 |
| 18 | deletePropertyImage | DELETE /api/properties/{id}/images/{imageId} | Bessel | 5 |
| 19 | setPrimaryImage | PATCH /api/properties/{id}/images/{imageId}/primary | Bessel | 5 |
| 20 | getDashboardStats | GET /api/dashboard/stats | Bessel | 7 |
| 21 | getBookingAvailability | GET /api/bookings/availability | John | 6 |
| 22 | listBookings | GET /api/bookings | John | 6 |
| 23 | createBooking | POST /api/bookings | John | 6 |
| 24 | listMyBookings | GET /api/bookings/mine | John | 6 |
| 25 | cancelBooking | PATCH /api/bookings/{id}/cancel | John | 6 |
| 26 | confirmBooking | PATCH /api/bookings/{id}/confirm | John | 6 |
| 27 | rescheduleBooking | PATCH /api/bookings/{id}/reschedule | John | 6 |
| 28 | closeBooking | PATCH /api/bookings/{id}/close | John | 6 |
| 29 | listValuations | GET /api/valuations | John | 7 |
| 30 | createValuation | POST /api/valuations | John | 7 |
| 31 | listMyValuations | GET /api/valuations/mine | John | 7 |
| 32 | updateValuationStatus | PATCH /api/valuations/{id}/status | John | 7 |
| 33 | listNotifications | GET /api/notifications | John | 7 |
| 34 | markAllNotificationsRead | PATCH /api/notifications/read-all | John | 7 |
| 35 | markNotificationRead | PATCH /api/notifications/{id}/read | John | 7 |
| 36 | listAuditLogs | GET /api/audit-logs | John | 4 |
| 37 | reportBookings | GET /api/reports/bookings | John | 9 |
| 38 | reportValuations | GET /api/reports/valuations | John | 9 |
| 39 | reportListings | GET /api/reports/listings | John | 9 |
| 40 | health | GET /api/health | Bessel | 3 |

## Appendix B — Who builds which screen, and when

| Screen | App | Owner | Phase |
|---|---|---|---|
| Register, Login, Forgot, Reset | web | Kennedy | 4 |
| Admin Login and guard | admin | Kwame | 4 |
| Home, Properties, Property Detail | web | Kennedy | 5 |
| Listings, Create, Edit (with images) | admin | Kwame | 5 |
| Book Viewing, My Bookings | web | Kennedy | 6 |
| Bookings management | admin | Kwame | 6 |
| Valuation Request, My Valuations | web | Kennedy | 7 |
| Valuations, Notification bell, Dashboard | admin | Kwame | 7 |
| Users, Audit Logs | admin | Kwame | 8 |
| About, Contact, Help, Terms, Privacy, error pages | web | Kennedy | 8 |
| Reports | admin | Kwame | 9 |
| Admin Help | admin | Kwame | 10 |

## Appendix C — Tags and what they mean

`phase-1-complete` through `phase-12-complete` are created only by Jayden, only after the gate list of that phase is verified. `v1.0.0` is created only by Bessel after `phase-12-complete`. A member whose phase tag is missing must **not** start that phase, however ready their own files are.

## Appendix D — Audit action names (use exactly these)

`auth.register`, `auth.login`, `auth.login_failed`, `auth.logout`, `auth.password_reset`,
`user.create`, `user.role_change`, `user.activate`, `user.deactivate`, `user.password_reset`,
`property.create`, `property.update`, `property.delete`, `property.image_add`, `property.image_delete`, `property.image_primary`,
`booking.create`, `booking.cancel`, `booking.confirm`, `booking.reschedule`, `booking.close`,
`valuation.create`, `valuation.status_update`,
`report.generate`.

## Appendix E — "I am stuck" rules

| Situation | What to do |
|---|---|
| Phase tag missing | Stop. Ask Jayden which gate item is open. |
| Contract and this guide seem to disagree | The contract wins. Tell the team. |
| Contract seems wrong or incomplete | Change nothing. Report it. Follow Section 1.1. |
| You need a change in someone else's file | Ask the owner. Do not edit it. |
| Rebase conflict in a file you do not own | `git rebase --abort`, then ask. |
| Your agent wants to add an endpoint, field or status not in the contract | Refuse. It is out of scope. |
| Tests fail on code you did not touch | Pull latest `main`; if still failing, tell the owner and Jayden. |
| You committed to the wrong branch | Do not push. Ask for help before using any reset commands. |
| You committed a secret | Tell the team immediately; the secret must be rotated, not just deleted. |

---
*End of guide.*
