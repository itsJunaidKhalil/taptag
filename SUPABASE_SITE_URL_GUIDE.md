# How to Find and Update Site URL in Supabase Dashboard

## Step-by-Step Instructions

### Method 1: Through Settings > API (Recommended)

1. **Log in to Supabase**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Sign in with your account

2. **Select Your Project**
   - You'll see a list of your projects
   - Click on the project you're using for this app

3. **Navigate to Settings**
   - Look at the **left sidebar menu**
   - Find and click on **"Settings"** (it has a gear icon ⚙️)
   - It's usually near the bottom of the sidebar

4. **Go to API Settings**
   - In the Settings page, you'll see several tabs/sections:
     - General
     - API ← **Click on this one**
     - Database
     - Auth
     - Storage
     - etc.
   - Click on **"API"** tab

5. **Find Site URL**
   - Scroll down on the API settings page
   - Look for a section called **"Project URL"** or **"Site URL"**
   - You should see:
     - **Project URL**: `https://xxxxx.supabase.co` (this is your Supabase URL)
     - **Site URL**: `http://localhost:3000` ← **This is what you need to change!**

6. **Update Site URL**
   - Click in the **Site URL** field
   - Change it from `http://localhost:3000` to your Vercel URL:
     ```
     https://your-project-name.vercel.app
     ```
   - Replace `your-project-name` with your actual Vercel project name

7. **Add Redirect URLs**
   - Scroll down a bit more
   - Look for **"Redirect URLs"** section
   - Click **"Add URL"** button
   - Add these URLs one by one:
     - `https://your-project-name.vercel.app/auth/callback`
     - `https://your-project-name.vercel.app/**`
   - Click **"Save"** after adding each URL

8. **Save Changes**
   - Click the **"Save"** button at the bottom of the page
   - You should see a success message

---

### Method 2: Through Authentication > URL Configuration

1. **Go to Authentication**
   - In the left sidebar, click **"Authentication"** (has a key icon 🔑)

2. **Click on "URL Configuration"**
   - In the Authentication page, look for tabs at the top
   - Click on **"URL Configuration"** tab

3. **Update Site URL**
   - You'll see **"Site URL"** field
   - Change it to your Vercel URL
   - Add redirect URLs in the **"Redirect URLs"** section below

4. **Save**

---

## Visual Guide - What to Look For

### In Settings > API:
```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│ [General] [API] [Database] [Auth]  │ ← Click "API"
├─────────────────────────────────────┤
│                                     │
│ Project URL                         │
│ https://xxxxx.supabase.co           │
│                                     │
│ Site URL                            │ ← THIS ONE!
│ http://localhost:3000  [Edit]      │
│                                     │
│ Redirect URLs                       │
│ http://localhost:3000/**           │
│ [Add URL]                           │ ← Add your Vercel URLs here
│                                     │
│ [Save]                              │
└─────────────────────────────────────┘
```

### In Authentication > URL Configuration:
```
┌─────────────────────────────────────┐
│ Authentication                      │
├─────────────────────────────────────┤
│ [Users] [Policies] [URL Config]     │ ← Click "URL Config"
├─────────────────────────────────────┤
│                                     │
│ Site URL                            │ ← Change this
│ http://localhost:3000               │
│                                     │
│ Redirect URLs                       │
│ [Add URL]                           │
│                                     │
│ [Save]                              │
└─────────────────────────────────────┘
```

---

## Quick Checklist

- [ ] Logged into Supabase Dashboard
- [ ] Selected the correct project
- [ ] Went to **Settings** > **API** (or **Authentication** > **URL Configuration**)
- [ ] Found **Site URL** field
- [ ] Changed from `http://localhost:3000` to `https://your-vercel-app.vercel.app`
- [ ] Added redirect URLs:
  - [ ] `https://your-vercel-app.vercel.app/auth/callback`
  - [ ] `https://your-vercel-app.vercel.app/**`
- [ ] Clicked **Save**
- [ ] Saw success message

---

## Still Can't Find It?

If you still can't locate the Site URL setting, try this:

1. **Search in Supabase Dashboard**
   - Use the search bar at the top (if available)
   - Search for "Site URL" or "Redirect URL"

2. **Check Project Settings**
   - Some Supabase versions have it under **Project Settings** instead of **Settings**

3. **Alternative: Update via SQL** (Advanced)
   - Go to **SQL Editor** in Supabase
   - Run this query (replace with your actual URL):
   ```sql
   -- Note: Site URL is typically managed through the dashboard UI
   -- But you can check current auth config
   SELECT * FROM auth.config;
   ```

4. **Contact Support**
   - If you're using a newer Supabase version, the UI might be different
   - Check Supabase documentation: https://supabase.com/docs/guides/auth

---

## Important Notes

- **Site URL** is different from **Project URL**
  - Project URL: `https://xxxxx.supabase.co` (don't change this)
  - Site URL: `http://localhost:3000` (change this to your Vercel URL)

- **Redirect URLs** must include:
  - Your callback route: `/auth/callback`
  - Wildcard for all routes: `/**`

- After changing, wait a few seconds for changes to propagate

---

## Your Vercel URL Format

Your Vercel URL will look like:
```
https://digital-business-card.vercel.app
```
or
```
https://your-custom-domain.com
```

Replace `your-project-name` in the instructions with your actual Vercel project name!

