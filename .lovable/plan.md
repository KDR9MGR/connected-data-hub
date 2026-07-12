# Full-fledged CMS + Admin Role

## 1. Add `admin` super-role (DB migration)

- Add `'admin'` value to the `app_role` enum (above editor/blogger).
- Update `handle_new_user()` default logic unchanged (still `blogger`), but the first admin is seeded manually.
- Add helper SQL function `is_admin(uuid)` reusing `has_role`.
- Broaden RLS on all content tables (`blog_posts`, `testimonials`, `portfolio_items`, `pricing_plans`, `contact_submissions`) so `admin` has the same rights as `editor`.
- New RLS on `user_roles`: admins can `SELECT/INSERT/DELETE` any row (currently only self-select). Editors/bloggers unchanged.
- New RLS on `profiles`: admins can `SELECT` all profiles (needed for user list).
- Seed the current signed-in user as admin via a one-off insert after migration approval (I'll ask which email).

## 2. Storage: media library

- Create public bucket `media` via storage tool.
- RLS on `storage.objects`: public `SELECT`; `INSERT/UPDATE/DELETE` restricted to editors + admins.
- New `MediaAdmin` tab in `/admin`: grid of uploaded files, drag-and-drop upload, copy URL, delete.
- Replace "Image URL" text inputs in Blog / Portfolio / Testimonial admin with an image picker component that opens the media library or uploads a new file inline.

## 3. Rich text editor for blog

- Install `@tiptap/react` + starter kit + link/image extensions.
- Replace the plain `<textarea>` for `body` in `BlogAdmin` with a Tiptap editor storing HTML.
- Render posts on the public `/blog` route using sanitized HTML (`dangerouslySetInnerHTML` after `DOMPurify`).

## 4. User & role management UI

- New `UsersAdmin` tab (admin-only).
- Server function `listUsers` (uses `supabaseAdmin.auth.admin.listUsers` inside handler) — protected by `requireSupabaseAuth` + `has_role(_, 'admin')` check.
- Server function `setUserRole({ userId, role })` — same guard; upserts into `user_roles`.
- Server function `removeUserRole({ userId, role })`.
- UI: table of users (email, current roles, joined), inline role toggles for admin/editor/blogger, "Invite user" via `supabase.auth.admin.inviteUserByEmail`.

## 5. Site settings & homepage content

- New table `site_settings` (single-row pattern with `id = 'default'`):
  - `site_title`, `site_description`, `hero_heading`, `hero_subheading`, `hero_image_url`, `about_body`, `contact_email`, `contact_phone`, `contact_address`, `whatsapp_number`, `social_instagram`, `social_facebook`, `social_youtube`, `seo_keywords`, `og_image_url`.
- RLS: public `SELECT`; `UPDATE` for admin + editor.
- New `SettingsAdmin` tab: single form editing the row.
- Wire homepage (`/`), `SiteNav`, `SiteFooter`, `ContactForm`, `ConsultWhatsapp`, and route `head()` metadata to read from `site_settings` (SSR-loaded via a public server fn using publishable key, cached with TanStack Query).

## 6. Admin panel restructuring

- Tab visibility:
  - blogger: Blog (own posts only, existing behavior).
  - editor: Blog, Testimonials, Portfolio, Pricing, Submissions, Media, Settings.
  - admin: all of the above + Users.
- Update `useAuth` to expose `isAdmin` and treat `admin` as a superset of `editor` for UI gating.
- Update `admin.tsx` header to show role badge.

## Technical details

- Server functions live in `src/lib/users.functions.ts` and `src/lib/settings.functions.ts`; admin ops load `client.server` inside the handler with `await import(...)`.
- Enum addition must be committed before use: split into two migrations if Postgres complains (`ALTER TYPE ... ADD VALUE` cannot run in same tx as usage) — I'll structure it accordingly.
- DOMPurify runs client-side only (dynamic import) to keep SSR clean.
- Tiptap SSR: render editor in `<ClientOnly>` fallback or dynamic import.
- Media picker is a reusable `<MediaPicker />` component used by all content admins.

## Out of scope (ask if you want these)

- Post scheduling / drafts workflow beyond current `is_published`.
- Multi-language content.
- Audit log of admin actions.
- Comments moderation.

Reply "go" to proceed, or tell me which email to seed as the first admin (I'll assume your currently signed-in account otherwise).
