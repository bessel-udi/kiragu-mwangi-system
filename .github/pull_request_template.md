<!--
Pull request template for Kiragu & Mwangi.
Title = the main commit message, for example: feat(api): add property repository and service
Fill in every section. Delete nothing; write "none" or "not applicable" where it does not apply.
-->

## Summary

What changed and why, in two or three sentences.

## Contract operations covered

List each operation by id and path, or write "none".
Example: `createBooking` - POST /api/bookings

## How tested

- [ ] Lint passed in my workspace
- [ ] Tests passed in my workspace
- [ ] For the API: the server starts and `GET /api/health` responds
- [ ] Checked against `api/openapi.yaml` (paths, parameters, bodies, status codes, error shape)

Describe what you ran and what you saw.

## Contract-silent decisions made

Anywhere the contract said nothing, you chose the stricter, safer behaviour. State each choice here,
or write "none".

## Screenshots (UI changes)

Add screenshots at desktop width and at 360px, or write "not applicable".

## Checklist

- [ ] I only changed files inside paths I own
- [ ] I did not touch `api/openapi.yaml`
- [ ] No secrets, `.env` files, uploads or build output are included
- [ ] I used `git add` with specific paths, not `git add .` or `git add -A`
- [ ] My branch is rebased on the latest `origin/main`
- [ ] I requested the required reviewer
