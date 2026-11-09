# Kiragu & Mwangi Real Estate Management System

A property listing, site-viewing booking and valuation system for Kiragu & Mwangi Ltd, Nairobi.
It has a public website for clients, an admin panel for staff, and a REST API backed by MySQL.

**Source of truth:** `api/openapi.yaml` (v1.0.0) is frozen. Code must match it exactly.
**Build order and team rules:** see [`docs/BUILD_GUIDE.md`](docs/BUILD_GUIDE.md).

## Folder map

| Folder     | What it holds                                         | Owner                           |
| ---------- | ----------------------------------------------------- | ------------------------------- |
| `api/`     | Express backend. Contains `openapi.yaml`              | Bessel (John owns some modules) |
| `db/`      | MySQL migrations and seed SQL                         | Bessel                          |
| `web/`     | Public site (React + Vite)                            | Kennedy                         |
| `admin/`   | Admin panel (React + Vite)                            | Kwame                           |
| `ui-kit/`  | Shared design system used by `web` and `admin`        | Kennedy (admin part: Kwame)     |
| `docs/`    | Guides, design, test plan, manual, diagrams, branding | Jayden                          |
| `.github/` | CODEOWNERS, pull request template, CI workflows       | Bessel (workflows: John)        |

## Ports

| Service           | Port |
| ----------------- | ---- |
| Real API          | 4000 |
| Mock API (Prism)  | 4010 |
| Web (public site) | 5173 |
| Admin panel       | 5174 |

## Getting started

Requires Node.js 24, npm, Git and MySQL 8.

```
npm install
```

Copy each `.env.example` to `.env` in `api/`, `web/` and `admin/`. Never commit a real `.env` file.

## Running the mock API

The mock reads `api/openapi.yaml` and answers every operation without a database.

```
npm run mock
```

Open http://localhost:4010/api/health. It must return the health response from the contract.
The front-ends read one variable, `VITE_API_BASE_URL`: `http://localhost:4010` for the mock,
`http://localhost:4000` for the real API. Switching is changing that variable and nothing else.

## Running the real API

Set up the database as described in `db/README.md`, fill in `api/.env`, then follow
`api/README.md`. The real API listens on port 4000.

## Root scripts

| Command                 | What it does                                   |
| ----------------------- | ---------------------------------------------- |
| `npm run mock`          | Start the Prism mock API on port 4010          |
| `npm run lint:contract` | Lint `api/openapi.yaml`                        |
| `npm run lint`          | Lint all JavaScript and JSX in every workspace |
| `npm run format`        | Format all files with Prettier                 |
| `npm run format:check`  | Check formatting without changing files        |
| `npm test`              | Run the tests of every workspace that has them |

## Code style

Formatting is set by `.prettierrc` and `.editorconfig` (2 spaces, LF line endings, single quotes,
semicolons, 100-character lines). Code quality rules are in `eslint.config.js`. Prettier owns
formatting; ESLint checks code quality.

## Rules of the road

- Work on a feature branch and open a pull request. Nobody commits directly to `main`.
- Only edit files you own (see the table above and `.github/CODEOWNERS`).
- Never edit `api/openapi.yaml`. A contract change needs all five members and a `contract-change` PR.
- Never commit secrets. Only `.env.example` files are committed. This repository is public.
