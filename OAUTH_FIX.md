# OAuth Redirect Fix - Step by Step

## The Problem
After clicking "Continue with Google", you're being redirected to `localhost:3000` instead of your Vercel production URL. This happens because:

1. Supabase Site URL is set to `localhost:3000`
2. The environment variable `NEXT_PUBLIC_APP_URL` might not be set in Vercel
3. Supabase uses the Site URL for OAuth redirects

## Solution - Follow These Steps

### Step 1: Update Supabase Site URL

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Settings** > **API**
4. Scroll down to **Site URL**
5. Change it from `http://localhost:3000` to your Vercel production URL:
   ```
   https://your-project-name.vercel.app
   ```
6. **IMPORTANT**: Also add this URL to **Redirect URLs** section below:
   - Click **Add URL**
   - Add: `https://your-project-name.vercel.app/auth/callback`
   - Add: `https://your-project-name.vercel.app/**` (wildcard for all routes)
7. Click **Save**

### Step 2: Verify Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Check if `NEXT_PUBLIC_APP_URL` exists
5. If it doesn't exist or is wrong:
   - Click **Add New**
   - Key: `NEXT_PUBLIC_APP_URL`
   - Value: `https://your-project-name.vercel.app` (your actual Vercel URL)
   - Select all environments: Production, Preview, Development
   - Click **Save**

### Step 3: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, make sure you have:
   - `https://your-project-name.vercel.app`
   - `http://localhost:3000` (for local development)
5. Under **Authorized redirect URIs**, make sure you have:
   - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
   - (This should be your Supabase project URL, NOT your Vercel URL)
6. Click **Save**

### Step 4: Redeploy on Vercel

1. Push the latest code changes:
   ```bash
   git add .
   git commit -m "Fix OAuth callback handling"
   git push
   ```
2. Vercel will auto-deploy, OR
3. Manually redeploy in Vercel Dashboard:
   - Go to **Deployments**
   - Click the three dots on latest deployment
   - Click **Redeploy**

### Step 5: Test

1. Go to your Vercel production URL
2. Click "Sign Up" or "Login"
3. Click "Continue with Google"
4. After clicking "Continue" on Google's consent screen, you should be redirected back to your Vercel app (not localhost)

## How It Works Now

1. User clicks "Continue with Google" on your Vercel app
2. Redirects to Google for authentication
3. Google redirects to: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
4. Supabase processes OAuth and redirects to: `https://your-vercel-app.vercel.app/auth/callback#access_token=...`
5. The callback page handles the token and redirects to `/dashboard`

## Troubleshooting

### Still redirecting to localhost?

1. **Clear browser cache** - OAuth redirects can be cached
2. **Check Supabase Site URL** - Make sure it's set to your Vercel URL, not localhost
3. **Check Vercel environment variables** - Verify `NEXT_PUBLIC_APP_URL` is set correctly
4. **Try incognito/private window** - To rule out browser cache issues

### Getting "Redirect URI mismatch" error?

- Make sure in Google OAuth settings, the redirect URI is: `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
- Do NOT use your Vercel URL as the redirect URI in Google settings

### Access token in URL but not logging in?

- The callback page should handle this automatically
- Check browser console for any errors
- Make sure the callback route is accessible

## Quick Checklist

- [ ] Supabase Site URL = Your Vercel production URL
- [ ] Supabase Redirect URLs includes: `https://your-vercel-app.vercel.app/auth/callback`
- [ ] Vercel `NEXT_PUBLIC_APP_URL` = Your Vercel production URL
- [ ] Google OAuth redirect URI = `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
- [ ] Code pushed and Vercel redeployed
- [ ] Tested in incognito/private window

After completing these steps, OAuth should work correctly! 🎉

