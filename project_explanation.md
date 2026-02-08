# JobNest – Detailed Project Explanation

## 1. High‑Level Overview

JobNest is a full‑stack job portal that connects **job seekers** and **recruiters**.

- Job seekers can:
  - Browse and filter active job postings
  - View rich job details in a modal
  - Save/bookmark interesting jobs
  - Apply to jobs through a structured, multi‑section form
  - See a list of all jobs they have applied to
- Recruiters (or any authenticated user) can:
  - Post new job openings with a rich text description

The project is built as a **single‑page application (SPA)** with **client‑side routing** and uses **Supabase** as the backend for data storage, authentication context (via JWT), and file storage (for resumes and cover letters). **Clerk** manages user authentication and gives you a secure, production‑ready auth layer.

---

## 2. Technology Stack

- **Frontend**: React + Vite
- **Routing**: `react-router-dom` with `createBrowserRouter`
- **Authentication**: Clerk (via `@clerk/clerk-react`)
- **Backend & Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage bucket `applications`
- **UI/Styling**:
  - Custom CSS files per page (e.g. `LandingPage.css`, `Job.css`)
  - Reusable UI components in `src/components/ui`
  - Theme provider for dark/light mode
- **Animations**: Framer Motion
- **Rich Text Editing**: TinyMCE (for job description when posting jobs)

Supporting documentation files:

- `COMPLETE_SUPABASE_SETUP.sql` – full DB + RLS + indexes
- `DATABASE_SETUP_README.md` – DB setup guide
- `CLERK_JWT_SETUP_GUIDE.md` – how Clerk JWT integrates with Supabase
- `ARCHITECTURE_DIAGRAMS.md` – system, auth, and data flow diagrams
- `QUICK_REFERENCE.md` – quick commands and troubleshooting

---

## 3. Overall Architecture and Flow

### 3.1 Application Bootstrapping

- **Entry point**: `src/main.jsx`
  - Creates the React root with `ReactDOM.createRoot`.
  - Wraps the entire app with `ClerkProvider`, passing in `VITE_CLERK_PUBLISHABLE_KEY`.
  - Renders the root component `App` inside `#root`.

- **Router and Layout**: `src/App.jsx` and `src/layouts/AppLayout.jsx`
  - `App.jsx` defines the client‑side routes using `createBrowserRouter`.
  - Routes:
    - `/` → `LandingPage`
    - `/job` → `Job` (protected)
    - `/postjobs` → `PostJobs` (protected)
    - `/savedjobs` → `SavedJobs` (protected)
    - `/myjobs` → `MyJobs` (protected)
    - `/apply/:jobId` → `ApplyPage` (protected)
  - `AppLayout` wraps all pages with a common layout:
    - Header (`Header` component)
    - Footer (`Footer` component)
    - A central `<Outlet />` to render the current route

- **Theme**: `ThemeProvider` from `src/components/ui/ThemeProvider.jsx` wraps the router to enable a dark/light theme (configured via `storageKey="vite-ui-theme"`).

### 3.2 Authentication Guard

- `ProtectedRoute` (in `src/components/ui/ProtectedRoute.jsx`):
  - Uses Clerk’s `useUser()` hook.
  - If `isLoaded` is true and `isSignedIn` is false, it redirects to a sign‑in route.
  - If user is authenticated, it simply renders its children.
  - All protected routes in `App.jsx` are wrapped with `<ProtectedRoute>...</ProtectedRoute>`.

**Result:** Any attempt to access `/job`, `/postjobs`, `/savedjobs`, `/myjobs`, or `/apply/:jobId` while signed out will redirect the user to sign in.

### 3.3 Supabase Client

- Defined in `src/utils/supabase.js`:
  - `supabase` – default Supabase client created with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - `supabaseClient(supabaseAccessToken)` – a helper that returns a Supabase client instance configured with an `Authorization: Bearer <Clerk JWT>` header. This is important when enforcing RLS with Clerk JWTs.

**Usage inside pages**:

- Many pages (Job, PostJobs, SavedJobs, MyJobs, ApplyPage) import and use `supabase` for their queries and inserts.

---

## 4. Data Model and Database Behavior

All details live in `COMPLETE_SUPABASE_SETUP.sql`, but here is the conceptual model.

### 4.1 Tables

1. **Posted_Jobs** – main job postings table
   - Fields (simplified):
     - `id` (UUID, primary key)
     - `CompanyName` (TEXT)
     - `Location` (TEXT, e.g. "California, United States")
     - `Role` (TEXT)
     - `JobType` (TEXT: Full‑Time, Part‑Time, Contract, Intern)
     - `LocationType` (TEXT: Remote, Hybrid, Onsite)
     - `Description` (TEXT)
     - `created_at`, `updated_at` (TIMESTAMP)

2. **Applied_Jobs** – which user applied to which job
   - Fields:
     - `id` (UUID, primary key)
     - `JobId` (UUID, foreign key → Posted_Jobs.id)
     - `UserId` (TEXT, Clerk user id)
     - `applied_at` (TIMESTAMP)
   - `UNIQUE(JobId, UserId)` ensures a user cannot apply to the same job twice.

3. **Saved_Jobs** – jobs bookmarked/saved by users
   - Fields:
     - `id` (UUID, primary key)
     - `JobId` (UUID, foreign key → Posted_Jobs.id)
     - `UserId` (TEXT, Clerk user id)
     - `saved_at` (TIMESTAMP)
   - `UNIQUE(JobId, UserId)` ensures a job is saved at most once per user.

4. **Storage Bucket: `applications`**
   - Holds resumes and cover letters.
   - Files are typically named with a pattern including the user id and timestamp.

### 4.2 Row Level Security (RLS)

RLS policies (from the SQL script) control which rows each user can see or modify.

- **Posted_Jobs**:
  - SELECT: open read access so any client can view jobs.
  - INSERT/UPDATE/DELETE: restricted to authenticated users.

- **Applied_Jobs**:
  - Users can only see rows where `UserId = auth.jwt() ->> 'sub'` (their own applications).
  - Users can only create or delete their own applications.

- **Saved_Jobs**:
  - Same pattern as Applied_Jobs: a user only sees and manages their own saved jobs.

- **Storage (`applications` bucket)**:
  - Policies ensure that each user can only access files they uploaded.

---

## 5. Detailed Feature Workflows

### 5.1 Landing Page Flow

**File:** `src/pages/LandingPage.jsx`

**What it does:**

- Acts as the main marketing/entry page for the app.
- Shows hero text, CTAs for "Find Jobs" and "Post Jobs".
- Displays a carousel of company logos from `src/data/companiesData.json`.
- Renders a FAQ section from `src/data/faq.json`.

**How it works:**

1. **Authentication awareness**:
   - Uses `useUser()` from Clerk.
   - `useEffect` checks `isLoaded` and `isSignedIn`.
   - If the user is not signed in once loaded, it opens a `SignInModal` and optionally auto‑closes it after a short timeout.

2. **CTA behavior**:
   - Buttons for `"/job"` and `"/postjobs"` use `handleProtectedNavigation(path)`.
   - If user is unsigned, clicking these will:
     - Call `e.preventDefault()` to stop navigation.
     - Show the sign‑in modal.
   - If user is signed in, navigation proceeds.

3. **Trusted companies section**:
   - Reads JSON from `companiesData.json` and creates a continuous marquee of logos.

4. **FAQ section**:
   - Renders questions & answers from `faq.json`.
   - Clicking an item toggles its expanded state.

**Result:** LandingPage is fully static from a data perspective but deeply integrated with Clerk for guiding users into the authenticated experience.

---

### 5.2 Viewing and Filtering Jobs (Job Page)

**File:** `src/pages/Job.jsx`

**What it does:**

- Displays a grid of all job postings with filters and search.
- Provides a detailed modal view for each job.
- Allows saving jobs.
- Provides quick navigation to the Apply page.

**Core state variables:**

- `jobData` – array of job objects fetched from Supabase.
- `searchTerm` – user’s free‑text search.
- `selectedType` – job type filter (All, Full‑Time, Part‑Time, Contract, Intern).
- `selectedLocation` – location text filter.
- `selectedLocationType` – work type filter (All, Onsite, Remote, Hybrid).
- `expandedDescriptions` – tracks which job descriptions are expanded.
- `selectedJob` – job currently shown in the details modal.

**Data fetch workflow:**

1. On mount and whenever filters change, `useEffect` runs `fetchJobData`.
2. `fetchJobData` builds a Supabase query:
   - Base: `supabase.from('Posted_Jobs').select().order('created_at', { ascending: false })`.
   - If `searchTerm` is present: `ilike('CompanyName', '%searchTerm%')`.
   - If `selectedType != 'all'`: `eq('JobType', selectedType)`.
   - If `selectedLocation` not empty: `ilike('Location', '%selectedLocation%')`.
   - If `selectedLocationType != 'all'`: `eq('LocationType', selectedLocationType)`.
3. The result is normalized with default values (e.g., "Unknown Company" if null) and stored in `jobData`.

**UI behavior:**

- Each job is rendered inside a Framer Motion animated card.
- Description is truncated to 100 characters; the "Read more" button toggles full text.
- Clicking **View Details** sets `selectedJob` and opens a modal overlay with full job details.
- Clicking **Apply** navigates to `/apply/:jobId`.

**Saving a job from this page:**

- The `<SaveJobBtn job={job} />` component is rendered on each card.
- See the next section for its detailed behavior.

---

### 5.3 Saving Jobs (SaveJobBtn + SavedJobs)

#### 5.3.1 Save Job Button

**File:** `src/components/ui/SaveJobBtn.jsx`

**What it does:**

- Lets a user bookmark a job from the job listing.

**How it works:**

1. Uses `useUser()` from Clerk to get the current user.
2. On click:
   - If there is no user, it alerts "Please Sign In" and exits.
   - Otherwise, performs an `upsert`:
     - `supabase.from('Saved_Jobs').upsert([{ UserId: user.id, JobId: job.id }], { onConflict: ['UserId', 'JobId'] })`.
   - The `onConflict` on (`UserId`, `JobId`) ensures no duplicates.
3. On success, it shows a simple alert "Job Saved".

#### 5.3.2 Saved Jobs Page

**File:** `src/pages/SavedJobs.jsx`

**What it does:**

- Shows all jobs the current user has saved.
- Allows unsaving/removing jobs.
- Provides an expanded detail modal, and an Apply button.

**Data fetching workflow:**

1. Uses Clerk’s `useUser()` to get `user.id`.
2. In `useEffect`, if there is a user:
   - Queries:
     - `supabase.from('Saved_Jobs').select('JobId, Posted_Jobs(id, Location, Role, Description, created_at, CompanyName, JobType, LocationType)').eq('UserId', user.id)`.
   - Supabase returns rows where each row has `JobId` and an embedded `Posted_Jobs` object.
   - The component maps over `data` and extracts `item.Posted_Jobs` into a `savedJobs` array.

**UI behavior:**

- Renders a heading that adjusts depending on whether there are saved jobs.
- For each job in `savedJobs`:
  - Shows company initial, name, role, location, and job type.
  - Shows a truncated description.
  - **Remove** button:
    - Calls `supabase.from('Saved_Jobs').delete().eq('UserId', user.id).eq('JobId', job.id)`.
    - If no error, updates local state to remove the job from the list.
  - **View Details** button: opens a detailed modal similar to `Job` page.
  - **Apply** button (inside modal) navigates to `/apply/:job.id`.

**Result:** The `Saved_Jobs` table combined with this page gives each user a persistent, server‑side list of bookmarks.

---

### 5.4 Applying to Jobs (ApplyPage)

**File:** `src/pages/ApplyPage.jsx`

**What it does:**

- Presents a multi‑section application form for a specific job.
- Persists an application record in `Applied_Jobs`.
- Supports attaching resume and cover letter files (via Supabase Storage).

**Workflow:**

1. **Load job details:**
   - Grabs `jobId` from the URL via `useParams()`.
   - Fetches job data from `Posted_Jobs` where `id = jobId`.
   - Shows basic info (role, company, location, job type, work setup, posted date, description).

2. **Form structure:**
   - `formData` state contains nested sections:
     - `basicInfo`: names, email, phone, location, LinkedIn, portfolio
     - `education`: array of education entries
     - `workExperience`: array of experience entries
     - `skills`: technical skills, certifications, languages, GitHub
     - `documents`: resume and cover letter Files
     - `preferences`: job location preference, expected salary, notice period, references
   - There are helper functions `addEducation` and `addWorkExperience` to push new blank entries into the arrays.

3. **Validation:**
   - `validateForm` ensures minimum required basic fields (first name, last name, email, phone) are filled.

4. **Submission:**
   - On submit:
     - Prevents default event.
     - Validates and, if invalid, shows an error message.
     - If valid:
       - Inserts a minimal row into `Applied_Jobs`:
         - `{ JobId: jobId, UserId: user.id }`.
       - On success, shows a success modal and redirects back to `/job` after a short timeout.
   - `handleFileUpload` is defined to upload files to the `applications` bucket and return the storage path; you can extend the submit logic to use this and store file paths along with the application.

**Important note:** Currently the rich `formData` content is kept only in the frontend state. Only `JobId` and `UserId` are persisted in `Applied_Jobs`. You can extend the backend later to store this full payload.

---

### 5.5 Viewing Applied Jobs (MyJobs)

**File:** `src/pages/MyJobs.jsx`

**What it does:**

- Lists all jobs the current user has applied to.

**How it works:**

1. Uses `useUser()` to get `user.id`.
2. In `useEffect`, if user exists:
   - Queries:
     - `supabase.from('Applied_Jobs').select('JobId, Posted_Jobs(id, Location, Role, Description, created_at, CompanyName, JobType, LocationType)').eq('UserId', user.id)`.
   - Maps over `data` to extract the embedded `Posted_Jobs` into `appliedJobs` array.
3. Renders:
   - Heading "My Applied Jobs".
   - If `appliedJobs` is empty, shows a message "No jobs applied yet.".
   - Else, shows a list of cards with role, company name, location, job type, location type, and description.

**Result:** This page provides a personal history of which jobs the user has applied to.

---

### 5.6 Posting Jobs (PostJobs)

**File:** `src/pages/PostJobs.jsx`

**What it does:**

- Allows any authenticated user to create a new job posting.
- Uses TinyMCE to capture a rich text job description.

**Core behavior:**

1. **Local form state:**
   - Separate fields for company name, role, state, country, employment type, work mode, and description HTML.

2. **Location formatting:**
   - Uses `lodash` (`_.startCase`) to transform free text state and country into title case.
   - Combines them into `Location = "State, Country"`.

3. **Description processing:**
   - TinyMCE editor provides HTML content.
   - Before inserting into the DB, a `DOMParser` converts the HTML into plain text (`textContent`).
   - This plain text is stored as `Description` in `Posted_Jobs`.

4. **Database insert:**
   - Calls `supabase.from('Posted_Jobs').insert([{ CompanyName, Location, Role, JobType: employmentType, LocationType: workMode, Description: textContent }])`.
   - On success:
     - Shows an animated success popup.
     - Clears the form and editor content.

**Result:** Recruiters can add new opportunities with well‑formatted descriptions that then appear on the `Job` listing page.

---

## 6. Authentication Flow (Clerk + Supabase)

**Conceptual flow (see `ARCHITECTURE_DIAGRAMS.md` for diagrams):**

1. User opens the app; `ClerkProvider` initializes in `main.jsx`.
2. User signs in or signs up via Clerk UI (SignInModal on landing page, or the app’s header controls).
3. Clerk issues a JWT containing the user id (`sub`) and other claims.
4. When a Supabase call uses a JWT (via `supabaseClient(token)` pattern), Supabase validates the token and populates `auth.jwt()` in Postgres.
5. RLS policies reference `auth.jwt() ->> 'sub'` to filter data by user id.
6. When using the default `supabase` client with anon key, public operations (like reading `Posted_Jobs`) are allowed because the RLS policies permit them.

**Protected routes** (using `ProtectedRoute`) ensure a user must be signed in to reach pages that read/write user‑specific tables.

---

## 7. Deployment and Routing Behavior

- The app is deployed as a SPA (for example, on Vercel).
- `vercel.json` contains a rewrite:

  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

- This ensures that deep links like `/myjobs`, `/savedjobs`, or `/apply/123` are always served `index.html`, and then React Router takes over on the client side.

---

## 8. How Everything Fits Together

- **LandingPage** introduces the platform and nudges users to sign in.
- Once authenticated, users can:
  - **Browse jobs** on the `Job` page, filter, view details, and save interesting jobs.
  - **Apply to jobs** with `ApplyPage`, which creates `Applied_Jobs` records and optionally uploads documents.
  - **Review saved jobs** (`SavedJobs`) and unsave them.
  - **Review previously applied jobs** (`MyJobs`).
  - **Post new jobs** (`PostJobs`), which immediately appear in the global job list (`Posted_Jobs`).
- **Supabase** ensures data integrity and security via RLS and foreign keys.
- **Clerk** handles the identity and authentication layers, and its user id is used consistently as `UserId` in application tables.

This combination gives you a complete, end‑to‑end job portal with a clear separation of concerns: React for UI and UX, Clerk for auth, and Supabase for persistent storage and security.
