# Digital Business Card

A full-stack platform where users can create customizable profiles, share social media links, and integrate with NFC keychains.

## Features

- ✅ Authentication: email + Google / GitHub / LinkedIn OAuth
- ✅ Unified editor at `/dashboard/edit` with **live phone-frame preview**
- ✅ 4-step **onboarding wizard** (username check, photo, starter links, confetti)
- ✅ Customizable profile with images and themes
- ✅ Drag-and-drop social link reordering (`@dnd-kit`)
- ✅ **25+ platforms** out of the box (categorized picker with search)
- ✅ Dynamic public profile URLs: `/username`
- ✅ Per-profile **SEO metadata** + dynamic Open Graph image (1200×630)
- ✅ Per-profile favicon (uses profile photo)
- ✅ Dynamic `sitemap.xml` and `robots.txt`
- ✅ VCF (contact card) download
- ✅ QR Code generation and download
- ✅ Analytics tracking (gated on cookie consent)
- ✅ NFC keychain integration support
- ✅ Forgot password / password reset flow
- ✅ Username change redirects (old links keep working forever)
- ✅ GDPR-friendly cookie consent modal
- ✅ Report modal for moderation
- ✅ Toast notifications (`sonner`) — no more browser `alert()`s

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **State**: Zustand (editor draft + dirty state)
- **UI primitives**: Radix UI Dialog, sonner (toasts), @dnd-kit (drag/drop)
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Hosting**: Vercel (Frontend), Supabase (Backend)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd digitalbusinesscard
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings > API

4. **Configure environment variables**

   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # required for /api/social/reorder
```

5. **Set up the database**

   **For an existing project**, run the migrations in order:

   ```bash
   # In Supabase SQL editor, paste the contents of each file:
   supabase/migrations/20260510_tier1_overhaul.sql        # Tier 1
   supabase/migrations/20260511_account_lifecycle.sql     # GDPR soft-delete
   ```

   Both migrations are fully additive (use `if not exists` everywhere) —
   safe to run on production with zero downtime.

   **20260510 (Tier 1)** adds:

   - `profiles.onboarding_completed_at` (controls the wizard)
   - `social_links.block_type`, `title`, `subtitle`, `thumbnail_url`,
     `is_featured`, `is_visible` (Tier 2 ready)
   - `reports` table (powers the Report modal on public profiles)
   - `reorder_social_links()` Postgres function (atomic drag-and-drop)
   - Indexes on `social_links(user_id, order_index)` and
     `profiles(lower(username))`

   **20260511 (GDPR / account lifecycle)** adds:

   - `profiles.deleted_at`, `profiles.scheduled_deletion_at`
   - Partial indexes to keep public lookups fast and to power the future
     hard-delete cron
   - Public lookups (`getProfile`) automatically filter
     `deleted_at IS NULL`, so soft-deleted accounts 404 immediately
   - Powers `/api/account/delete`, `/api/account/restore`,
     `/api/account/export`, `/api/auth/resend-verification`, and the
     new `/dashboard/settings` page

   **For a fresh setup**, run the base schema below first, then the migration:

```sql
-- Create profiles table
create table profiles (
  id uuid primary key references auth.users(id),
  username text unique,
  full_name text,
  company text,
  about text,
  phone text,
  email text,
  website text,
  profile_image_url text,
  banner_image_url text,
  theme text default 'default',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create username_redirects table for handling username changes
create table username_redirects (
  old_username text primary key,
  new_username text not null,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamp default now()
);

-- Create social_links table
create table social_links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  platform text,
  url text,
  order_index int default 0,
  created_at timestamp default now()
);

-- Create analytics table
create table analytics (
  id bigserial primary key,
  profile_id uuid references profiles(id),
  event_type text,
  platform text,
  referrer text,
  timestamp timestamp default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table username_redirects enable row level security;
alter table social_links enable row level security;
alter table analytics enable row level security;

-- RLS Policies for profiles
create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id);

create policy "Profiles are viewable by everyone"
on profiles for select
using (true);

-- RLS Policies for username_redirects
create policy "Anyone can view redirects"
on username_redirects for select
using (true);

create policy "Users can create their own redirects"
on username_redirects for insert
with check (auth.uid() = user_id);

-- RLS Policies for social_links
create policy "Users can insert their own social links"
on social_links for insert
with check (auth.uid() = user_id);

create policy "Users can update their own social links"
on social_links for update
using (auth.uid() = user_id);

create policy "Users can delete their own social links"
on social_links for delete
using (auth.uid() = user_id);

-- IMPORTANT: Allow public read access to social links
create policy "Social links are viewable by everyone"
on social_links for select
using (true);

-- RLS Policies for analytics
create policy "Anyone can insert analytics"
on analytics for insert
with check (true);
```

6. **Set up Supabase Storage**

   - Go to Storage in your Supabase dashboard
   - Create two buckets:
     - `profile-images` (public)
     - `banners` (public)
   - Set up storage policies to allow authenticated users to upload

7. **Configure Supabase Authentication URLs**

   - In Supabase Dashboard:
     - Go to **Authentication** → **URL Configuration**
     - Set **Site URL** to your local URL for development (`http://localhost:3000`)
     - Add the following **Redirect URLs** (one per line):
       ```
       http://localhost:3000/auth/callback
       http://localhost:3000/auth/update-password
       ```
   - For production (after deploying to Vercel):
     - Update **Site URL** to your Vercel URL (e.g., `https://your-app.vercel.app`)
     - Update Redirect URLs to:
       ```
       https://your-app.vercel.app/auth/callback
       https://your-app.vercel.app/auth/update-password
       ```

8. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## OAuth Setup (GitHub + LinkedIn)

You already configured Google. To add GitHub and LinkedIn with Supabase + Vercel:

### 1) Configure redirect URLs in Supabase

In **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL**
  - Local: `http://localhost:3000`
  - Production: your Vercel URL (for example `https://your-app.vercel.app`)
- **Redirect URLs** (add all environments you use):
  - `http://localhost:3000/auth/callback`
  - `https://your-app.vercel.app/auth/callback`

### 2) GitHub OAuth App

1. Go to GitHub **Settings → Developer settings → OAuth Apps**.
2. Create a new OAuth app:
   - **Homepage URL**: your app URL (`http://localhost:3000` for local testing, Vercel URL for prod)
   - **Authorization callback URL**: your Supabase callback URL:
     - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
3. Copy **Client ID** and **Client Secret**.
4. In Supabase **Authentication → Providers → GitHub**, enable GitHub and paste credentials.
5. Save and test login.

### 3) LinkedIn OAuth App

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/).
2. Create an app and add products required for Sign In (typically **Sign In with LinkedIn using OpenID Connect**).
3. In app auth settings, add redirect URL:
   - `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
4. Copy **Client ID** and **Client Secret**.
5. In Supabase **Authentication → Providers → LinkedIn**, enable LinkedIn and paste credentials.
6. Save and test login.

### 4) Vercel environment variables

Ensure these exist in Vercel for the correct environments:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_KEY=... # use your anon/publishable key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
SUPABASE_SERVICE_ROLE_KEY=...
```

After updating env vars, redeploy.

### 5) Common issues checklist

- Provider is enabled in Supabase but callback URL in GitHub/LinkedIn is wrong.
- Callback points to your app instead of Supabase (`/auth/v1/callback` must be on Supabase domain).
- Local and production URLs are mixed.
- You changed env vars in Vercel but did not redeploy.
- Browser has stale session; sign out and try again.

## Project Structure

```
/app
  /[username]                       # Public profile route + dynamic OG/Twitter/icon images
  /auth                             # Login, register, forgot-password, update-password, OAuth callback
  /dashboard
    /edit                           # Unified editor (Profile/Links/Appearance) with live preview
    /analytics                      # View counts, link clicks
    /(profile|social|appearance)    # Permanent redirects -> /dashboard/edit?tab=...
  /api
    /analytics                      # Event ingestion
    /profile/update                 # Profile + onboarding update
    /profile/[username]/links       # Public link list
    /social/(create|update|delete|list|reorder)
    /username/check                 # Live availability for onboarding
    /reports                        # Report submission
    /upload                         # Image upload
    /vcf/[username]                 # Downloadable contact card
  /sitemap.ts                       # Dynamic sitemap
  /robots.ts                        # robots.txt
  /privacy                          # Privacy policy
  /layout.tsx                       # Root layout w/ Toaster + metadata
  /page.tsx                         # Landing page

/components
  /editor                           # Editor shell, tabs, preview drawer, save status
  /onboarding                       # 4-step wizard
  /profile                          # ProfileCard (presentational) + PhoneFrame
  /ui                               # Modal, ConfirmDialog, Toaster, CookieConsentModal, ReportModal
  PlatformIcon.tsx, PlatformPicker.tsx, ImageUploader.tsx,
  Navbar.tsx, ProfilePage.tsx, ProfileForm.tsx, QRCode.tsx, SocialButton.tsx,
  SocialLinksForm.tsx, ProfileThemeToggle.tsx, ThemeToggle.tsx, TapTagLogo.tsx

/lib
  platforms.ts                      # 25 platforms registry (single source of truth)
  consent.ts                        # Cookie consent helpers
  store/editorStore.ts              # Zustand editor state
  supabase.ts, supabase-server.ts   # Supabase clients
  getProfile.ts, getSocialLinks.ts  # Server-side fetchers

/supabase/migrations                # SQL migration scripts
/utils                              # themes.ts, vcf.ts
/styles                             # globals.css (Tailwind + CSS vars)
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Update Supabase RLS Policies

Make sure your RLS policies are set up correctly for production. The policies above should work, but you may want to add more specific rules based on your needs.

## NFC Integration

To integrate NFC keychains:

1. Program your NFC keychain with the URL: `https://yourapp.com/username`
2. When someone taps the NFC keychain, it will open the user's profile
3. Analytics will automatically track the profile view

## QR Code Integration

QR codes are automatically generated for each user profile:

1. **Dashboard**: Users can view and download their QR code from the dashboard
2. **Public Profile**: QR codes are displayed on public profile pages for easy sharing
3. **Download**: Users can download QR codes as PNG images for printing or digital use
4. **Usage**: Scan the QR code with any smartphone camera to instantly open the profile

The QR code links directly to the user's public profile URL (`https://yourapp.com/username`).

## Username Changes

When a user changes their username:
- The old username link automatically redirects to the new username (301 permanent redirect)
- Old links continue to work seamlessly
- The redirect is stored in the `username_redirects` table

## Troubleshooting

### Social Links Not Showing on Public Profile

If social links are not visible on the public profile:
- Check that the social links have been saved
- The profile page polls for updates every 3 seconds
- Refresh the page if links don't appear immediately

### Multiple GoTrueClient Warnings

If you see warnings about multiple GoTrueClient instances:
- This has been fixed with a singleton pattern
- Clear your browser cache and reload
