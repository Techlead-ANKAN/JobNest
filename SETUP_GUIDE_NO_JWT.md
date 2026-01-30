# 🚀 Quick Setup Guide - No JWT Required

## ✅ What's Done

1. **.env file** - Updated with your Supabase and Clerk credentials
2. **SQL Script** - Created `SUPABASE_SETUP_NO_RLS.sql` (without JWT requirements)

---

## 📋 Next Steps (5 minutes)

### Step 1: Run SQL Script in Supabase (2 minutes)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **vphtpnnnwchrrhgeaens**
3. Click **SQL Editor** in left sidebar
4. Open the file `SUPABASE_SETUP_NO_RLS.sql`
5. Copy **ALL contents** of the file
6. Paste into SQL Editor
7. Click **Run** or press `Ctrl+Enter`
8. You should see success messages

### Step 2: Verify Database (1 minute)

After running the script, check:
1. Go to **Table Editor** in Supabase
2. You should see 3 tables:
   - `Posted_Jobs` (with 5 sample jobs)
   - `Applied_Jobs` (empty)
   - `Saved_Jobs` (empty)

### Step 3: Start Your App (1 minute)

```bash
npm run dev
```

Your app should now work! 🎉

---

## ✅ What Will Work

- ✅ User sign up/sign in (Clerk)
- ✅ View all jobs
- ✅ Post new jobs
- ✅ Filter/search jobs
- ✅ Save jobs
- ✅ Apply to jobs
- ✅ View saved jobs
- ✅ View my applications

---

## 🔐 Security Notes

**Important:** Since we're not using RLS with JWT:
- All users can see all data in the database
- Your frontend code handles filtering (e.g., showing only user's saved jobs)
- This is fine for development/small projects
- For production with sensitive data, consider adding JWT authentication later

---

## 📊 Database Structure

### Posted_Jobs
```
- CompanyName
- Location
- Role
- JobType (Full-Time/Part-Time/Contract/Intern)
- LocationType (Remote/Hybrid/Onsite)
- Description
```

### Applied_Jobs
```
- JobId (links to Posted_Jobs)
- UserId (Clerk user ID)
```

### Saved_Jobs
```
- JobId (links to Posted_Jobs)
- UserId (Clerk user ID)
```

---

## 🧪 Test It

1. **Sign up** with a test account
2. **View jobs** - You should see 5 sample jobs
3. **Post a job** - Try creating a new job
4. **Save a job** - Click "SAVE" on any job
5. **Apply to job** - Go through application flow
6. **Check Supabase** - View data in Table Editor

---

## 🆘 Troubleshooting

### Error: "relation does not exist"
→ Run the SQL script again

### Error: Can't connect to Supabase
→ Check `.env` file has correct credentials

### Error: Clerk authentication fails
→ Verify `VITE_CLERK_PUBLISHABLE_KEY` in `.env`

### Jobs not showing
→ Check browser console for errors
→ Verify Supabase URL is correct

---

## 🎯 Your Environment Variables (Already Set)

```env
VITE_SUPABASE_URL=https://vphtpnnnwchrrhgeaens.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2hhcm1lZC1ncm91...
```

---

## 📝 Files Created/Updated

1. ✅ `SUPABASE_SETUP_NO_RLS.sql` - Database setup script
2. ✅ `.env` - Your environment variables (updated)
3. ✅ `SETUP_GUIDE_NO_JWT.md` - This file

---

**Ready to go! Just run the SQL script and start your app.** 🚀
