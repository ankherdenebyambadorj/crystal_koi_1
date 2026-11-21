# Engineering Standards

## Runtime & Language
- **Node.js `>=22.18`**: Runs `server.ts` directly with native type-stripping (development via `tsx server.ts`, production via `node server.ts`).
- **Frontend**: React 19 (`.jsx` modules) + Vite 8 + Tailwind CSS v4 + `@radix-ui/*` primitives.
- **Database**: Relational schema with `snake_case` tables and columns (`call_requests`, `access_requests`, `contact_messages`, `opt_out_requests`, `partners`, `customer_stories`, `service_status`, `status_incidents`, `users`, `email_verifications`, `sessions`).

## Code Structure & Naming
- **Conventions**: `camelCase` for functions/variables, `PascalCase` for React components, `UPPER_SNAKE_CASE` for shared constants, `kebab-case` for CSS classes.
- **File sizing**: Keep modules cohesive and focused (~200 lines target; split scene shaders/meshes, dashboard subcomponents, nav panels, and auth handlers cleanly).
- **Server boundaries**: All SQL queries live strictly inside `functions/repository/sqliteRepo.js` and `functions/repository/pgRepo.js`. Request handlers import only from `functions/db.js`.

## Failure Handling & Testing
- API client (`src/api/client.js`) enforces request timeouts and bounded retries for safe reads; UI views render loading skeletons, error alerts, and empty states.
- Intake submissions include client-generated UUID `request_id` values so retries remain idempotent.
- Server logs emit non-PII operational events (`timestamp`, `kind`/`route`, status/code) only.
- Unit tests (`npm test` -> `node --test tests/unit.test.js`) exercise pure math, form/rate-limit rules, auth security checks, and cookie/CSRF guards using an in-memory repository stub.
