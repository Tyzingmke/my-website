# Tony Consults Frontend

## Stack
React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Query, Zustand, React Router, react-hook-form, Zod, and Supabase.

## Rules
- Pages never call Supabase directly. Feature API modules own data access through `src/lib/supabase.ts`.
- Server data belongs to React Query. UI preferences belong to Zustand.
- Every dashboard route requires `RoleGuard`.
- Use token variables from `src/styles/tokens.css`; do not add component-local colors.
- Keep forms beside their Zod schemas. Use the shared DataTable for future list pages.
- Validate desktop, tablet, and mobile layouts before completing a route.
- Do not commit environment files or secrets.
