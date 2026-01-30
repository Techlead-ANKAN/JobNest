# JobNest - Quick Setup Reference

## 🚀 Quick Start Guide

### 1. Database Setup (5 minutes)

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy entire contents** of `COMPLETE_SUPABASE_SETUP.sql`
3. **Paste and Run** in SQL Editor
4. **Verify** tables were created (should see 3 tables: Posted_Jobs, Applied_Jobs, Saved_Jobs)

### 2. Clerk JWT Configuration (3 minutes)

1. **Clerk Dashboard** → JWT Templates → New Template
2. **Name:** `supabase`
3. **Claims:** (copy from CLERK_JWT_SETUP_GUIDE.md section 1B)
4. **Save** and copy JWKS URL

### 3. Environment Variables (2 minutes)

Create `.env` file with:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 4. Test (2 minutes)

1. Run `npm run dev`
2. Sign up/Login
3. Try posting a job
4. Try saving a job
5. Check Supabase Dashboard → Table Editor

---

## 📋 Database Schema Overview

### Posted_Jobs
```
id (UUID) - Primary Key
CompanyName (TEXT)
Location (TEXT)
Role (TEXT)
JobType (TEXT) - Full-Time, Part-Time, Contract, Intern
LocationType (TEXT) - Remote, Hybrid, Onsite
Description (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Applied_Jobs
```
id (UUID) - Primary Key
JobId (UUID) - Foreign Key → Posted_Jobs
UserId (TEXT) - Clerk User ID
applied_at (TIMESTAMP)
UNIQUE(JobId, UserId)
```

### Saved_Jobs
```
id (UUID) - Primary Key
JobId (UUID) - Foreign Key → Posted_Jobs
UserId (TEXT) - Clerk User ID
saved_at (TIMESTAMP)
UNIQUE(JobId, UserId)
```

### Storage Bucket: applications
- Stores resumes and cover letters
- Private bucket (not publicly accessible)
- User can only access their own files

---

## 🔒 RLS Policies Summary

### Posted_Jobs
- ✅ **SELECT:** Anyone can view
- ✅ **INSERT:** Authenticated users can create
- ✅ **UPDATE:** Authenticated users can update
- ✅ **DELETE:** Authenticated users can delete

### Applied_Jobs
- ✅ **SELECT:** Users can view only their applications
- ✅ **INSERT:** Users can create applications
- ✅ **DELETE:** Users can delete their applications

### Saved_Jobs
- ✅ **SELECT:** Users can view only their saved jobs
- ✅ **INSERT:** Users can save jobs
- ✅ **UPDATE:** Users can update saved jobs
- ✅ **DELETE:** Users can delete saved jobs

### Storage (applications bucket)
- ✅ **INSERT:** Users can upload to their folder
- ✅ **SELECT:** Users can view their own files
- ✅ **UPDATE:** Users can update their files
- ✅ **DELETE:** Users can delete their files

---

## 🛠️ Useful SQL Queries

### Check if tables exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Posted_Jobs', 'Applied_Jobs', 'Saved_Jobs');
```

### View all job postings
```sql
SELECT * FROM "Posted_Jobs" ORDER BY created_at DESC;
```

### Check application count per job
```sql
SELECT 
  pj."Role",
  pj."CompanyName",
  COUNT(aj.id) as application_count
FROM "Posted_Jobs" pj
LEFT JOIN "Applied_Jobs" aj ON pj.id = aj."JobId"
GROUP BY pj.id
ORDER BY application_count DESC;
```

### View all RLS policies
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Test JWT authentication
```sql
SELECT auth.jwt() ->> 'sub' as current_user_id;
```

### Insert sample job (for testing)
```sql
INSERT INTO "Posted_Jobs" ("CompanyName", "Location", "Role", "JobType", "LocationType", "Description")
VALUES ('Google', 'California, United States', 'Software Engineer', 'Full-Time', 'Hybrid', 
        'Join Google as a Software Engineer and work on cutting-edge technologies.');
```

---

## 🔍 Troubleshooting

### ❌ Error: "JWT claims missing"
**Fix:** Get Clerk token before making request
```javascript
const token = await getToken({ template: 'supabase' });
const supabase = await supabaseClient(token);
```

### ❌ Error: "new row violates row-level security policy"
**Fix:** Make sure JWT template name is exactly `supabase` (lowercase)

### ❌ Error: "relation does not exist"
**Fix:** Run `COMPLETE_SUPABASE_SETUP.sql` in Supabase SQL Editor

### ❌ Can't see any jobs
**Fix:** Check RLS policies are set up correctly
```sql
SELECT * FROM pg_policies WHERE tablename = 'Posted_Jobs';
```

### ❌ Storage upload fails
**Fix:** Check storage bucket exists
```sql
SELECT * FROM storage.buckets WHERE id = 'applications';
```

---

## 📊 Performance Indexes

All these indexes are already created by the setup script:

- `idx_posted_jobs_company_name` - Fast company search
- `idx_posted_jobs_location` - Fast location filtering
- `idx_posted_jobs_job_type` - Fast job type filtering
- `idx_posted_jobs_created_at` - Fast sorting by date
- `idx_applied_jobs_user_id` - Fast user applications lookup
- `idx_saved_jobs_user_id` - Fast user saved jobs lookup

---

## 🔐 Security Checklist

- [ ] JWT template created in Clerk
- [ ] RLS enabled on all tables
- [ ] Storage policies configured
- [ ] `.env` added to `.gitignore`
- [ ] Environment variables set
- [ ] API keys are not committed to git
- [ ] Tested authentication flow
- [ ] Tested RLS policies

---

## 📚 Important Files

1. **COMPLETE_SUPABASE_SETUP.sql** - Complete database setup
2. **CLERK_JWT_SETUP_GUIDE.md** - Detailed Clerk configuration
3. **THIS FILE** - Quick reference

---

## 🆘 Need Help?

1. Check `CLERK_JWT_SETUP_GUIDE.md` for detailed instructions
2. Check Supabase Dashboard → Logs
3. Check Clerk Dashboard → Logs
4. Use browser DevTools → Console for errors
5. Test JWT at [jwt.io](https://jwt.io)

---

## 🎯 Current Features Supported

✅ Post new jobs  
✅ View all jobs  
✅ Filter jobs (by type, location, work mode)  
✅ Search jobs (by company name)  
✅ Apply to jobs  
✅ Save/bookmark jobs  
✅ View my applications  
✅ View saved jobs  
✅ Upload resume/cover letter  
✅ User authentication via Clerk  
✅ Row-level security  
✅ Performance indexes  

---

## 🚀 Next Steps (Optional Enhancements)

- [ ] Add job owner tracking (add creator_id to Posted_Jobs)
- [ ] Email notifications for applications
- [ ] Admin dashboard for recruiters
- [ ] Application status tracking
- [ ] Job expiration dates
- [ ] Company profiles
- [ ] Applicant tracking system
- [ ] Resume parsing
- [ ] Job recommendations
- [ ] Analytics dashboard

---

**Version:** 1.0  
**Last Updated:** December 2024  
**Database:** Supabase (PostgreSQL)  
**Auth:** Clerk v5.x
