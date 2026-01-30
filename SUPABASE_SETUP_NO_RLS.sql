-- =====================================================
-- JobNest - Supabase Database Setup (Without JWT RLS)
-- =====================================================
-- This script creates all tables, indexes, and storage
-- WITHOUT Row Level Security that requires JWT tokens
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
-- 4. DISABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Since we're not using JWT authentication, we disable RLS
-- Security will be handled by your application logic

ALTER TABLE public."Posted_Jobs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Applied_Jobs" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."Saved_Jobs" DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE STORAGE BUCKET FOR APPLICATION DOCUMENTS
-- =====================================================

-- Create storage bucket for resumes and cover letters
INSERT INTO storage.buckets (id, name, public)
VALUES ('applications', 'applications', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 6. STORAGE POLICIES (PUBLIC ACCESS)
-- =====================================================
-- Allow all authenticated users to upload and access files

-- Policy: Anyone can upload
CREATE POLICY "Anyone can upload application documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'applications');

-- Policy: Anyone can view
CREATE POLICY "Anyone can view application documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'applications');

-- Policy: Anyone can update
CREATE POLICY "Anyone can update application documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'applications')
WITH CHECK (bucket_id = 'applications');

-- Policy: Anyone can delete
CREATE POLICY "Anyone can delete application documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'applications');

-- =====================================================
-- 7. HELPFUL VIEWS (OPTIONAL)
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
-- 8. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant full access to authenticated and anonymous users
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- =====================================================
-- 9. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Insert some sample job postings for testing
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
     'Apple is looking for a skilled iOS Developer to contribute to groundbreaking mobile applications.')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SETUP COMPLETE! 
-- =====================================================
-- 
-- Next Steps:
-- 1. Create .env file with your credentials
-- 2. Test the connection with your frontend
-- 3. Start posting and applying to jobs!
-- 
-- Environment Variables:
-- VITE_SUPABASE_URL=https://vphtpnnnwchrrhgeaens.supabase.co
-- VITE_SUPABASE_ANON_KEY=your_anon_key
-- VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
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

-- Check sample data
SELECT COUNT(*) as job_count FROM public."Posted_Jobs";
