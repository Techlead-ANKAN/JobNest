# Clerk JWT Setup for Supabase Authentication

This guide explains how to integrate Clerk authentication with Supabase using JWT tokens for Row Level Security (RLS) policies.

## Overview

Your JobNest application uses:
- **Clerk** for user authentication (login/signup)
- **Supabase** for database and backend
- **JWT tokens** to bridge Clerk authentication with Supabase RLS policies

## Step-by-Step Setup

### 1. Clerk Configuration

#### A. Create JWT Template in Clerk

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **JWT Templates** (in the sidebar)
4. Click **"New template"**
5. Choose **"Blank"** template
6. Name it: `supabase` (lowercase is important)

#### B. Configure JWT Claims

In the JWT template, add the following claims:

```json
{
  "aud": "authenticated",
  "exp": {{user.expire_at}},
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}",
  "role": "authenticated"
}
```

**Important Claims Explained:**
- `aud`: Audience - tells Supabase this is an authenticated user
- `exp`: Expiration time - when the token expires
- `sub`: Subject - the unique Clerk user ID (this is what we use in RLS policies)
- `email`: User's email address
- `role`: User role for Supabase RLS

#### C. Save and Copy JWKS URL

1. Click **"Save"** or **"Apply Changes"**
2. You'll see a **JWKS Endpoint URL** like:
   ```
   https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json
   ```
3. **Copy this URL** - you'll need it for Supabase

### 2. Supabase Configuration

#### A. Update JWT Settings (Option 1 - Dashboard)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Scroll to **JWT Settings**
5. Update **JWT Secret** with your Clerk JWKS URL

**Note:** Some Supabase setups may not support JWKS URLs directly. If this doesn't work, use Option 2.

#### B. Custom Authentication (Option 2 - SQL)

If the above doesn't work, you can use Supabase's custom authentication:

1. In Supabase, go to **SQL Editor**
2. Run the following SQL:

```sql
-- Create a function to extract user ID from Clerk JWT
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  );
$$ LANGUAGE SQL STABLE;

-- Test the function
SELECT auth.user_id();
```

#### C. Verify JWT Configuration

After setting up, verify your JWT is working:

1. Go to **SQL Editor** in Supabase
2. Run this test query:

```sql
-- This should return your Clerk user ID when authenticated
SELECT auth.jwt() ->> 'sub' as user_id;
```

### 3. Frontend Configuration

#### A. Update Supabase Client

Update your `src/utils/supabase.js` to include Clerk JWT:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Create authenticated Supabase client with Clerk token
const supabaseClient = async (supabaseAccessToken) => {
    const supabase = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${supabaseAccessToken}`
            }
        }
    });
    return supabase;
}

export default supabaseClient;
```

#### B. Get Clerk JWT Token

Whenever you need to make authenticated requests to Supabase:

```javascript
import { useAuth } from '@clerk/clerk-react';
import supabaseClient from '@/utils/supabase';

function MyComponent() {
  const { getToken } = useAuth();
  
  const fetchData = async () => {
    // Get the Clerk token for Supabase
    const token = await getToken({ template: 'supabase' });
    
    // Create authenticated Supabase client
    const supabase = await supabaseClient(token);
    
    // Make authenticated request
    const { data, error } = await supabase
      .from('Saved_Jobs')
      .select('*');
  };
}
```

### 4. Environment Variables

Create a `.env` file in your project root with:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Clerk Configuration  
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

**How to get these values:**

#### Supabase:
1. Go to your Supabase project
2. Settings → API
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### Clerk:
1. Go to your Clerk Dashboard
2. API Keys
3. Copy **Publishable Key** → `VITE_CLERK_PUBLISHABLE_KEY`

### 5. Testing the Integration

#### A. Test User Authentication Flow

1. Sign up/Login using Clerk in your app
2. Try saving a job
3. Check if the job appears in your Saved Jobs

#### B. Test RLS Policies

In Supabase SQL Editor:

```sql
-- Check if your user can see their saved jobs
-- (Replace 'user_xxxxx' with your actual Clerk user ID)
SELECT * FROM "Saved_Jobs" WHERE "UserId" = 'user_xxxxx';

-- This should work when authenticated
SELECT * FROM "Posted_Jobs" LIMIT 5;
```

### 6. Common Issues and Solutions

#### Issue 1: "JWT claims missing" error

**Solution:** Make sure you're passing the JWT token correctly:

```javascript
const token = await getToken({ template: 'supabase' });
const supabase = await supabaseClient(token);
```

#### Issue 2: RLS policies blocking access

**Solution:** Verify the JWT template name is exactly `supabase` (lowercase)

#### Issue 3: "relation does not exist" error

**Solution:** Run the `COMPLETE_SUPABASE_SETUP.sql` script first

#### Issue 4: Can't insert/update data

**Solution:** Check that RLS policies are correctly set up:

```sql
-- View all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### 7. Security Best Practices

1. **Never commit `.env` files** to version control
2. Add `.env` to your `.gitignore`:
   ```
   .env
   .env.local
   ```
3. **Use environment variables** for all sensitive keys
4. **Rotate keys regularly** in production
5. **Enable MFA** in Clerk for production apps
6. **Monitor API usage** in both Clerk and Supabase dashboards

### 8. Production Checklist

Before deploying to production:

- [ ] JWT template created in Clerk with correct claims
- [ ] Supabase JWT settings configured
- [ ] All RLS policies tested and working
- [ ] Environment variables set in production hosting
- [ ] `.env` files not committed to git
- [ ] API keys rotated from development
- [ ] Storage bucket policies configured
- [ ] Database indexes created for performance
- [ ] Error logging implemented
- [ ] Backup strategy in place

## Reference Links

- [Clerk JWT Documentation](https://clerk.com/docs/backend-requests/making/jwt-templates)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk + Supabase Integration Guide](https://clerk.com/docs/integrations/databases/supabase)

## Support

If you encounter issues:

1. Check Clerk Dashboard → Logs for authentication errors
2. Check Supabase Dashboard → Logs for database errors
3. Use browser DevTools → Network tab to inspect JWT tokens
4. Verify JWT claims at [jwt.io](https://jwt.io)

## Example: Complete Authentication Flow

```javascript
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '@/utils/supabase';
import supabaseClient from '@/utils/supabase';

function SaveJobButton({ job }) {
  const { user } = useUser();  // Get current user from Clerk
  const { getToken } = useAuth();  // Get token function
  
  const handleSave = async () => {
    if (!user) {
      alert('Please sign in');
      return;
    }
    
    try {
      // Get Clerk JWT token for Supabase
      const token = await getToken({ template: 'supabase' });
      
      // Create authenticated Supabase client
      const authenticatedSupabase = await supabaseClient(token);
      
      // Make authenticated request
      const { data, error } = await authenticatedSupabase
        .from('Saved_Jobs')
        .upsert([
          { 
            UserId: user.id,  // Clerk user ID
            JobId: job.id 
          }
        ], { 
          onConflict: ['UserId', 'JobId'] 
        });
      
      if (error) throw error;
      
      alert('Job saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save job');
    }
  };
  
  return (
    <button onClick={handleSave}>
      Save Job
    </button>
  );
}
```

---

**Last Updated:** December 2024  
**Compatible with:** Clerk v5.x, Supabase v2.x
