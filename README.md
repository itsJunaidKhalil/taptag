# Digital Business Card

A full-stack platform where users can create customizable profiles, share social media links, and integrate with NFC keychains.

## Features

- ✅ User authentication (Sign up / Login)
- ✅ Customizable profile with images
- ✅ Social media links management
- ✅ Dynamic public profile URLs: `/username`
- ✅ VCF (contact card) download
- ✅ QR Code generation and download
- ✅ Analytics tracking (profile views, link clicks)
- ✅ Theme customization
- ✅ NFC keychain integration support
- ✅ Forgot password / password reset flow
- ✅ Username change redirects (old links automatically redirect to new username)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
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
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional, for better performance)
```

5. **Set up the database**

   Run these SQL commands in your Supabase SQL Editor:

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

## Project Structure

```
/app
  /auth          # Login and registration pages
      forgot-password/page.tsx
      update-password/page.tsx
  /dashboard     # User dashboard pages
  /api           # API routes
  /[username]    # Public profile pages
/components      # React components
/lib             # Utility functions
/utils           # Helper functions
/styles          # Global styles
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
