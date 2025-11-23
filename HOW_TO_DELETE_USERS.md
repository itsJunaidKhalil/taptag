# How to Delete Users in Supabase for Testing

## Method 1: Delete via SQL Editor (Recommended - Most Reliable)

This method ensures all related data is deleted properly.

### Steps:

1. **Go to SQL Editor**
   - In Supabase Dashboard, click **"SQL Editor"** in the left sidebar (terminal/code icon)

2. **Run this SQL query** (replace the user ID with the one you want to delete):

```sql
-- Delete user by email (replace with actual email)
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'arbabkhalil14@gmail.com'; -- Replace with your email
  
  -- Delete from social_links first (if exists)
  DELETE FROM social_links WHERE user_id = user_uuid;
  
  -- Delete from analytics (if exists)
  DELETE FROM analytics WHERE profile_id = user_uuid;
  
  -- Delete from profiles
  DELETE FROM profiles WHERE id = user_uuid;
  
  -- Finally delete from auth.users
  DELETE FROM auth.users WHERE id = user_uuid;
  
  RAISE NOTICE 'User deleted successfully';
END $$;
```

3. **To delete multiple users**, run this:

```sql
-- Delete all users (use with caution!)
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Delete related data
    DELETE FROM social_links WHERE user_id = user_record.id;
    DELETE FROM analytics WHERE profile_id = user_record.id;
    DELETE FROM profiles WHERE id = user_record.id;
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
  
  RAISE NOTICE 'All users deleted';
END $$;
```

4. **Click "Run"** button (or press Ctrl+Enter)

---

## Method 2: Delete via UI (If Method 1 doesn't work)

### Steps:

1. **Go to Authentication > Users**
   - Click **"Authentication"** in left sidebar
   - Click **"Users"** tab (should be default)

2. **Select Users to Delete**
   - Check the boxes next to users you want to delete
   - Click **"Delete X users"** button

3. **If you get an error**, it's because:
   - The user has related data in `profiles` or `social_links` tables
   - You need to delete those first using Method 1 (SQL)

---

## Method 3: Quick Test Without Deleting

Instead of deleting, you can:

1. **Sign out** from your app
2. **Use a different Google account** for testing
3. **Or use incognito/private browser window** to test signup flow

This way you don't need to delete existing users!

---

## Method 4: Delete Specific User by Email (SQL)

```sql
-- Delete a specific user by email
DO $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Find user
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'your-email@example.com';
  
  IF user_uuid IS NOT NULL THEN
    -- Delete in correct order
    DELETE FROM social_links WHERE user_id = user_uuid;
    DELETE FROM analytics WHERE profile_id = user_uuid;
    DELETE FROM profiles WHERE id = user_uuid;
    DELETE FROM auth.users WHERE id = user_uuid;
    
    RAISE NOTICE 'User % deleted', user_uuid;
  ELSE
    RAISE NOTICE 'User not found';
  END IF;
END $$;
```

---

## Why You're Getting the Error

The error "Database error deleting user" happens because:

1. **Foreign Key Constraints**: The `profiles` table has a foreign key reference to `auth.users`
2. **Cascade Delete Not Set**: When you delete from `auth.users`, related records in `profiles` and `social_links` need to be deleted first
3. **RLS Policies**: Row Level Security might be blocking the delete operation

## Solution: Delete in Correct Order

Always delete in this order:
1. `social_links` (references profiles)
2. `analytics` (references profiles)
3. `profiles` (references auth.users)
4. `auth.users` (the actual user)

---

## Quick Test Script

Run this in SQL Editor to delete all test users:

```sql
-- Delete all users and their data
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id, email FROM auth.users LOOP
    RAISE NOTICE 'Deleting user: %', user_record.email;
    
    -- Delete related data
    DELETE FROM social_links WHERE user_id = user_record.id;
    DELETE FROM analytics WHERE profile_id = user_record.id;
    DELETE FROM profiles WHERE id = user_record.id;
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;
  
  RAISE NOTICE 'All users deleted successfully';
END $$;
```

---

## After Deleting Users

1. **Refresh the Users page** in Supabase Dashboard
2. **Test Google OAuth signup** on your Vercel app
3. **Verify the new user appears** in Authentication > Users

---

## Pro Tip: Use Different Email for Testing

Instead of deleting, create a test Google account or use:
- `yourname+test1@gmail.com` (Gmail ignores the + part)
- This way you can test multiple times without deleting!

