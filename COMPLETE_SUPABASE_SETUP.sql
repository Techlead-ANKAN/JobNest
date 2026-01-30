-- =====================================================
-- JobNest - Complete Supabase Database Setup Script
-- =====================================================
-- This script creates all tables, RLS policies, indexes,
-- triggers, and storage buckets for the JobNest application
-- =====================================================

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Table: Posted_Jobs
-- Stores all job postings created by recruiters/companies
CREATE TABLE IF NOT EXISTS public."Posted_Jobs" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "CompanyName" TEXT NOT NULL,
    "Location" TEXT NOT NULL,
    "Role" TEXT NOT NULL,
    "JobType" TEXT NOT NULL CHECK ("JobType" IN ('Full-Time', 'Part-Time', 'Contract', 'Intern')),
    "LocationType" TEXT NOT NULL CHECK ("LocationType" IN ('Remote', 'Hybrid', 'Onsite')),
    "Description" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Applied_Jobs
-- Tracks which users have applied to which jobs
CREATE TABLE IF NOT EXISTS public."Applied_Jobs" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "JobId" UUID NOT NULL REFERENCES public."Posted_Jobs"(id) ON DELETE CASCADE,
    "UserId" TEXT NOT NULL, -- Clerk User ID
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("JobId", "UserId") -- Prevent duplicate applications
);

-- Table: Saved_Jobs
-- Stores jobs that users have bookmarked/saved
CREATE TABLE IF NOT EXISTS public."Saved_Jobs" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "JobId" UUID NOT NULL REFERENCES public."Posted_Jobs"(id) ON DELETE CASCADE,
    "UserId" TEXT NOT NULL, -- Clerk User ID
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("JobId", "UserId") -- Prevent duplicate saves
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for Posted_Jobs
CREATE INDEX IF NOT EXISTS idx_posted_jobs_company_name ON public."Posted_Jobs"("CompanyName");
CREATE INDEX IF NOT EXISTS idx_posted_jobs_location ON public."Posted_Jobs"("Location");
CREATE INDEX IF NOT EXISTS idx_posted_jobs_role ON public."Posted_Jobs"("Role");
CREATE INDEX IF NOT EXISTS idx_posted_jobs_job_type ON public."Posted_Jobs"("JobType");
CREATE INDEX IF NOT EXISTS idx_posted_jobs_location_type ON public."Posted_Jobs"("LocationType");
CREATE INDEX IF NOT EXISTS idx_posted_jobs_created_at ON public."Posted_Jobs"(created_at DESC);

-- Indexes for Applied_Jobs
CREATE INDEX IF NOT EXISTS idx_applied_jobs_user_id ON public."Applied_Jobs"("UserId");
CREATE INDEX IF NOT EXISTS idx_applied_jobs_job_id ON public."Applied_Jobs"("JobId");
CREATE INDEX IF NOT EXISTS idx_applied_jobs_applied_at ON public."Applied_Jobs"(applied_at DESC);

-- Indexes for Saved_Jobs
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public."Saved_Jobs"("UserId");
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON public."Saved_Jobs"("JobId");
CREATE INDEX IF NOT EXISTS idx_saved_jobs_saved_at ON public."Saved_Jobs"(saved_at DESC);

-- =====================================================
-- 3. CREATE TRIGGER FOR AUTO-UPDATING updated_at
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Posted_Jobs
DROP TRIGGER IF EXISTS update_posted_jobs_updated_at ON public."Posted_Jobs";
CREATE TRIGGER update_posted_jobs_updated_at
    BEFORE UPDATE ON public."Posted_Jobs"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public."Posted_Jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Applied_Jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Saved_Jobs" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR Posted_Jobs
-- =====================================================

-- Policy: Anyone can view all job postings (SELECT)
CREATE POLICY "Anyone can view job postings" 
ON public."Posted_Jobs"
FOR SELECT
USING (true);

-- Policy: Authenticated users can create job postings (INSERT)
-- Note: In production, you may want to restrict this to specific roles
CREATE POLICY "Authenticated users can create job postings" 
ON public."Posted_Jobs"
FOR INSERT
WITH CHECK (true);

-- Policy: Authenticated users can update their own job postings (UPDATE)
-- Note: Since there's no owner field, allowing all authenticated users to update
-- You may want to add a creator_id field for stricter control
CREATE POLICY "Authenticated users can update job postings" 
ON public."Posted_Jobs"
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Authenticated users can delete job postings (DELETE)
CREATE POLICY "Authenticated users can delete job postings" 
ON public."Posted_Jobs"
FOR DELETE
USING (true);

-- =====================================================
-- RLS POLICIES FOR Applied_Jobs
-- =====================================================

-- Policy: Users can view only their own applications (SELECT)
CREATE POLICY "Users can view own applications" 
ON public."Applied_Jobs"
FOR SELECT
USING (auth.jwt() ->> 'sub' = "UserId");

-- Policy: Users can create their own applications (INSERT)
CREATE POLICY "Users can create own applications" 
ON public."Applied_Jobs"
FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' = "UserId");

-- Policy: Users can delete their own applications (DELETE)
CREATE POLICY "Users can delete own applications" 
ON public."Applied_Jobs"
FOR DELETE
USING (auth.jwt() ->> 'sub' = "UserId");

-- =====================================================
-- RLS POLICIES FOR Saved_Jobs
-- =====================================================

-- Policy: Users can view only their own saved jobs (SELECT)
CREATE POLICY "Users can view own saved jobs" 
ON public."Saved_Jobs"
FOR SELECT
USING (auth.jwt() ->> 'sub' = "UserId");

-- Policy: Users can save jobs (INSERT/UPSERT)
CREATE POLICY "Users can save jobs" 
ON public."Saved_Jobs"
FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' = "UserId");

-- Policy: Users can update their saved jobs (UPDATE)
CREATE POLICY "Users can update saved jobs" 
ON public."Saved_Jobs"
FOR UPDATE
USING (auth.jwt() ->> 'sub' = "UserId")
WITH CHECK (auth.jwt() ->> 'sub' = "UserId");

-- Policy: Users can delete their own saved jobs (DELETE)
CREATE POLICY "Users can delete own saved jobs" 
ON public."Saved_Jobs"
FOR DELETE
USING (auth.jwt() ->> 'sub' = "UserId");

-- =====================================================
-- 5. CREATE STORAGE BUCKET FOR APPLICATION DOCUMENTS
-- =====================================================

-- Create storage bucket for resumes and cover letters
INSERT INTO storage.buckets (id, name, public)
VALUES ('applications', 'applications', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES FOR applications BUCKET
-- =====================================================

-- Policy: Users can upload their own application documents
CREATE POLICY "Users can upload own application documents"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'applications' 
    AND auth.jwt() ->> 'sub' = (storage.foldername(name))[1]
);

-- Policy: Users can view their own application documents
CREATE POLICY "Users can view own application documents"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'applications' 
    AND auth.jwt() ->> 'sub' = (storage.foldername(name))[1]
);

-- Policy: Users can update their own application documents
CREATE POLICY "Users can update own application documents"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'applications' 
    AND auth.jwt() ->> 'sub' = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'applications' 
    AND auth.jwt() ->> 'sub' = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own application documents
CREATE POLICY "Users can delete own application documents"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'applications' 
    AND auth.jwt() ->> 'sub' = (storage.foldername(name))[1]
);

-- =====================================================
-- 6. HELPFUL VIEWS (OPTIONAL)
-- =====================================================

-- View: Get job postings with application count
CREATE OR REPLACE VIEW public.job_postings_with_stats AS
SELECT 
    pj.*,
    COUNT(DISTINCT aj."UserId") as application_count,
    COUNT(DISTINCT sj."UserId") as saved_count
FROM public."Posted_Jobs" pj
LEFT JOIN public."Applied_Jobs" aj ON pj.id = aj."JobId"
LEFT JOIN public."Saved_Jobs" sj ON pj.id = sj."JobId"
GROUP BY pj.id;

-- =====================================================
-- 7. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert some sample job postings (comment out in production)
/*
INSERT INTO public."Posted_Jobs" ("CompanyName", "Location", "Role", "JobType", "LocationType", "Description")
VALUES 
    ('Google', 'California, United States', 'Software Engineer', 'Full-Time', 'Hybrid', 
     'We are looking for a talented Software Engineer to join our team. You will work on cutting-edge technologies and collaborate with world-class engineers.'),
    ('Microsoft', 'Washington, United States', 'Cloud Solutions Architect', 'Full-Time', 'Remote',
     'Join Microsoft as a Cloud Solutions Architect and help businesses transform their infrastructure with Azure.'),
    ('Amazon', 'New York, United States', 'Product Manager', 'Full-Time', 'Onsite',
     'Amazon is seeking an experienced Product Manager to drive innovation in our e-commerce platform.'),
    ('Meta', 'California, United States', 'Data Scientist Intern', 'Intern', 'Hybrid',
     'Join Meta as a Data Science Intern and work on machine learning models that impact billions of users.'),
    ('Apple', 'California, United States', 'iOS Developer', 'Contract', 'Onsite',
     'Apple is looking for a skilled iOS Developer to contribute to groundbreaking mobile applications.');
*/

-- =====================================================
-- 8. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users (for public access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public."Posted_Jobs" TO anon;

-- =====================================================
-- 9. CLERK JWT SETUP (IMPORTANT!)
-- =====================================================

-- For Clerk authentication to work with Supabase RLS:
-- 1. Go to your Supabase Dashboard > Authentication > Providers
-- 2. Disable Email/Password authentication if not needed
-- 3. Go to Project Settings > API > JWT Settings
-- 4. Update the JWT Secret with your Clerk JWT template
-- 
-- In your Clerk Dashboard:
-- 1. Go to JWT Templates
-- 2. Create a new template named "supabase"
-- 3. Use the following claims:
-- {
--   "aud": "authenticated",
--   "exp": {{user.expire_at}},
--   "sub": "{{user.id}}",
--   "email": "{{user.primary_email_address}}",
--   "role": "authenticated"
-- }
-- 4. Copy the JWKS Endpoint URL
-- 
-- Then in Supabase:
-- Run the following SQL to set up the JWT issuer:
-- This needs to be done in the SQL Editor separately after the main setup

/*
-- Update this with your Clerk JWKS URL
SELECT auth.jwt() ->> 'sub' as user_id;
*/

-- =====================================================
-- SETUP COMPLETE! 
-- =====================================================
-- 
-- Next Steps:
-- 1. Configure Clerk JWT Template (see section 9 above)
-- 2. Update your .env file with Supabase credentials
-- 3. Test the connection with your frontend
-- 4. Verify RLS policies are working correctly
-- 
-- Environment Variables needed:
-- VITE_SUPABASE_URL=your_supabase_project_url
-- VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
-- 
-- Clerk Environment Variables:
-- VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
-- 
-- =====================================================

-- Verify tables were created successfully
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN ('Posted_Jobs', 'Applied_Jobs', 'Saved_Jobs')
ORDER BY table_name;

-- Verify RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('Posted_Jobs', 'Applied_Jobs', 'Saved_Jobs');

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
