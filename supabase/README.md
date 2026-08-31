# Tony Consults Supabase setup

This folder is intentionally separate from the Ascension project. It gives Tony Consults its own workspace, access rules, content revisions, private submissions, assets, publishing jobs and audit trail.

## 1. Create a dedicated project

Create a new Supabase project for Tony Consults. Do not point this portfolio at the existing Ascension project: its organization data, payments and administrators must remain isolated.

## 2. Apply the migration

Link this folder to the new project, then push the migration:

```powershell
npx supabase@latest login
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npx supabase@latest db push
```

Alternatively, run the contents of `migrations/20260831082237_tony_consults_cms_foundation.sql` in the Supabase SQL editor.

## 3. Create the first owner

Open `/admin/` and select **Create owner account**. Use `antonymburu379@gmail.com` and choose a strong password. Supabase will send a confirmation email if email confirmation is enabled. Once confirmed, the database trigger grants this allow-listed account the Tony Consults owner role and its workspace capabilities.

The owner is explicitly allow-listed. An arbitrary first sign-up cannot become an administrator.

## 4. Add public configuration locally and in GitHub Actions

Copy `.env.example` to `.env.local` and add the project URL and publishable key. Add the same values as GitHub Actions variables for production builds. The browser uses only the public/publishable key; never add a `service_role` key to Next.js, GitHub Pages, or the repository.

## 5. Enable the admin route

Open `/admin/`, sign in with the owner account, and begin with Pages, Projects, or Services. The editor saves drafts and immutable revisions in the dedicated workspace.

## Delivery boundary

The current public portfolio is a static GitHub Pages export. A CMS approval is stored safely in Supabase, but it does not change the public repository until a server-side GitHub publishing gateway is configured. That gateway must run as a Supabase Edge Function or other private server and keep the GitHub token secret; it must never run in this browser app.
