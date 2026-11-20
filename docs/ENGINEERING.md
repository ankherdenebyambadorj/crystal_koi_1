# Engineering standards

## Code style
- JavaScript (JSX) with the project's existing lint configuration. No TypeScript migration.
- Naming: camelCase for variables and functions, PascalCase components, UPPER_SNAKE_CASE for constants, kebab-case for CSS classes and non-component file names (components: Name.jsx, hooks: useName.js).
- Entity names are PascalCase singular; entity fields are snake_case, matching the platform's own fields.
- One component per file. A file over about 200 lines is split. Logic that is not rendering lives in hooks or lib files.
- Use the most common pattern for each job: React function components and hooks, TanStack Query for server state, react-hook-form with zod for forms, React Router for navigation.
- Comments only explain why. No comments that restate the code, no commented-out code, no TODO, no emoji, no placeholder text, no console.log.

## Failure handling
- Every network call has a timeout, one retry for safe reads, a loading state, an error state and an empty state.
- Forms are idempotent: a client-generated request id prevents duplicate records on double submit.
- User-facing errors are short Mongolian messages. Technical details go to server logs only, never to the browser, and never contain personal data.
- On any doubt, deny: if an access check cannot complete, the request fails closed.

## Security
- Never trust the client. Validate every input again on the server.
- Authorization is checked on the server for every read and write. Public visitors can only create form submissions; they can never read them.
- No secret, service key or token in client code or in git.
- Render user or database text as plain text only. Never use dangerouslySetInnerHTML. Links from data must be https and carry rel="noopener noreferrer".

## Dependencies
- Use only the packages allowed in Part 0 (section 0.2). Install any that are missing at an exact version and list them in docs/DEPENDENCIES.md with a reason. Add any other package only when nothing allowed can do the job, check that the exact name exists and is established, pin the exact version, and record the reason in docs/DEPENDENCIES.md.
- Never invent a package name.

## Verification
- Each part's acceptance list is checked and recorded in docs/verification-N.md.
- Pure logic (validation schemas, seeded series generator, pose interpolation) gets unit tests when the project allows adding a test runner. If it does not, skip tests silently and do not add errors.
