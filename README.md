<h1 align="center">JobNest – Full‑Stack Job Portal</h1>

<p align="center">
   Modern hiring platform for job seekers and recruiters, built with React, Vite, Supabase, and Clerk.
</p>

---

## 1. What This Project Is

JobNest is a full‑stack job portal that connects candidates with companies.

- Job seekers can:
   - Browse and filter live job postings
   - View rich job details in a modal
   - Save jobs for later
   - Apply to jobs with an application form
   - See all their applied jobs in one place
- Recruiters can:
   - Post new job opportunities
   - Publish detailed role descriptions using a rich‑text editor

Authentication is handled by Clerk, data is stored in Supabase PostgreSQL with Row Level Security (RLS), and resumes can be uploaded to Supabase Storage.

For deeper backend details and SQL, see:

- COMPLETE_SUPABASE_SETUP.sql – complete schema and policies
- DATABASE_SETUP_README.md – database setup guide
- CLERK_JWT_SETUP_GUIDE.md – Clerk ↔ Supabase JWT integration
- ARCHITECTURE_DIAGRAMS.md – architecture and flow diagrams
- QUICK_REFERENCE.md – shortcuts and troubleshooting

---

## 2. Technology Stack

- Frontend: React + Vite
- Routing: react-router-dom
- Auth: Clerk
- Backend & DB: Supabase (PostgreSQL + RLS)
- File Storage: Supabase Storage (applications bucket)
- UI: Custom CSS + Shadcn‑style components
- Animations: Framer Motion
- Rich Text Editor: TinyMCE

---

## 3. High‑Level Workflow

### 3.1 User Types

- **Guest** – Can see the landing page but must sign in to access jobs and posting.
- **Authenticated user (via Clerk)** – Can view jobs, save jobs, apply, and post jobs.

### 3.2 Main Flows

1. **Sign‑in / Sign‑up**
    - main.jsx wraps the app with ClerkProvider.
    - LandingPage opens a sign‑in modal automatically for unsigned users.
    - ProtectedRoute gates all protected routes (`/job`, `/postjobs`, `/savedjobs`, `/myjobs`, `/apply/:jobId`).

2. **Browsing Jobs**
    - Job page reads from the Supabase table Posted_Jobs.
    - Users can search, filter, and open a detailed job modal.

3. **Saving Jobs**
    - SaveJobBtn upserts into Saved_Jobs with a composite (UserId, JobId) constraint.
    - SavedJobs page joins Saved_Jobs with Posted_Jobs to show full job details for the current user.

4. **Applying to Jobs**
    - ApplyPage loads the job by id from Posted_Jobs.
    - User fills an application form and can attach resume/cover letter files.
    - On submit, an entry is created in Applied_Jobs for (JobId, UserId).
    - File upload is wired to the Supabase bucket applications and can be extended to persist metadata.

5. **Posting Jobs**
    - PostJobs page lets recruiters create a posting.
    - A rich‑text description is written via TinyMCE, converted to plain text, and stored in Posted_Jobs.

6. **Viewing My Activity**
    - MyJobs lists all jobs the current user has applied for, via a join on Applied_Jobs → Posted_Jobs.
    - SavedJobs lists all jobs the user has saved, via Saved_Jobs → Posted_Jobs.

Supabase Row Level Security ensures each user only sees their own rows in Applied_Jobs and Saved_Jobs, while everyone can read Posted_Jobs.

---

## 4. Frontend Architecture

### 4.1 Entry and Routing

- main.jsx
   - Boots React with ReactDOM.
   - Wraps the app in ClerkProvider using VITE_CLERK_PUBLISHABLE_KEY.
   - Renders App.

- App.jsx
   - Creates the router with createBrowserRouter.
   - Defines routes:
      - `/` → LandingPage
      - `/job` → Job (protected)
      - `/postjobs` → PostJobs (protected)
      - `/savedjobs` → SavedJobs (protected)
      - `/myjobs` → MyJobs (protected)
      - `/apply/:jobId` → ApplyPage (protected)
   - Wraps everything in ThemeProvider for light/dark theme support.

- AppLayout.jsx
   - Global layout: header, footer, and a central Outlet for current page.

### 4.2 Key Pages and Features

#### LandingPage

- Shows the primary marketing hero with CTA buttons to "Find Jobs" and "Post Jobs".
- Imports static company logos from data/companiesData.json for a marquee of trusted companies.
- Renders a dynamic FAQ section from data/faq.json.
- Uses Clerk’s useUser to detect signed‑in state.
- Automatically shows a SignInModal for guests and closes it after a short delay.
- CTA buttons to `/job` and `/postjobs` are guarded: clicking them while signed out triggers the sign‑in modal instead of navigation.

#### Job (Job listing and discovery)

- Pulls job records from the Supabase table Posted_Jobs via supabase.from('Posted_Jobs').select().order('created_at', { ascending: false }).
- Client‑side filtering:
   - Free‑text search on CompanyName.
   - Filter by JobType (Full‑Time, Part‑Time, Contract, Intern).
   - Filter by LocationType (Onsite, Remote, Hybrid).
   - Text filter by Location.
- Defensive defaults: if any field is null, it substitutes human‑friendly placeholders.
- UI:
   - Animated job cards via Framer Motion.
   - "View Details" opens a full‑screen modal with complete description and meta.
   - "Apply" button navigates to `/apply/:jobId`.
- SaveJobBtn:
   - When clicked, upserts into Saved_Jobs: { UserId: current Clerk user id, JobId }.
   - Alerts on success or logs errors.

#### PostJobs (Recruiter job posting)

- Uses TinyMCE Editor for the job description.
- Collects:
   - CompanyName
   - Role
   - State + Country (combined into Location with proper casing via lodash.startCase)
   - JobType (Full‑Time, Part‑Time, Contract, Intern)
   - LocationType (Remote, Hybrid, Onsite)
   - Description (rich text converted to plain text before saving)
- On submit:
   - Parses TinyMCE HTML into plain text via DOMParser.
   - Inserts a new row into Posted_Jobs with CompanyName, Location, Role, JobType, LocationType, Description.
   - Shows a SuccessPopup and clears the form/editor.

#### SavedJobs (Saved/bookmarked jobs)

- Uses Clerk’s useUser to get the current user id.
- Fetches all saved jobs via:
   - SELECT JobId, Posted_Jobs(...) FROM Saved_Jobs WHERE UserId = current user id.
   - Maps the result to the nested Posted_Jobs rows.
- UI:
   - Card layout of each saved job with company initial, job meta, and description.
   - "View Details" opens a detailed modal similar to the Job page.
   - Trash icon (FaTrashAlt) removes a saved job by deleting from Saved_Jobs and updating local state.

#### MyJobs (Jobs the user has applied to)

- Uses useUser to get the current Clerk user.
- Queries Supabase:
   - SELECT JobId, Posted_Jobs(...) FROM Applied_Jobs WHERE UserId = current user id.
   - Maps to the nested Posted_Jobs objects.
- Displays a simple card list showing role, company, location, job type and work type, and description.

#### ApplyPage (Job application workflow)

- Grabs jobId from the URL params and fetches the matching job from Posted_Jobs.
- Renders job meta (position, company, type, location, posted date, and description) at the top.
- Application form is divided into logical sections:
   - Basic Information (name, email, phone, location, LinkedIn, portfolio)
   - Education (repeatable entries)
   - Work Experience (repeatable entries)
   - Skills
   - Documents (resume and cover letter upload widgets)
   - Preferences (location, salary, notice period, references)
- Validation:
   - Minimal validation: ensures required basic fields are filled.
- On submit:
   - Inserts into Applied_Jobs with JobId and current UserId.
   - Shows a success message and redirects back to /job after a short delay.
- File Upload:
   - handleFileUpload() is prepared to upload to the Supabase bucket applications using supabase.storage.from('applications').upload(...).
   - You can wire this into the submit handler to persist file paths into a separate table or JSON column.

### 4.3 Auth Guard (ProtectedRoute)

- ProtectedRoute uses Clerk’s useUser to check:
   - isLoaded – Clerk state loaded
   - isSignedIn – whether the user is authenticated
- If the user is not signed in once the state is loaded, it redirects to a sign‑in path.
- Otherwise it simply renders its children (the protected page components).

### 4.4 Supabase Client

- src/utils/supabase.js exposes:
   - supabase – a basic Supabase client configured with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
   - supabaseClient(token) – factory that returns a client with Authorization: Bearer <Clerk JWT>, for RLS‑protected queries when using Clerk JWTs.

---

## 5. Data Model and Backend Workflow

The complete SQL for the backend lives in COMPLETE_SUPABASE_SETUP.sql. At a high level:

### 5.1 Core Tables

- Posted_Jobs
   - Stores public job postings (company, role, location, job type, work mode, description, timestamps).
- Applied_Jobs
   - Tracks applications for a job.
   - Fields: id, JobId (FK → Posted_Jobs), UserId (Clerk user id), applied_at.
   - Unique constraint on (JobId, UserId) to prevent duplicate applications.
- Saved_Jobs
   - Stores bookmarked jobs for each user.
   - Fields: id, JobId (FK → Posted_Jobs), UserId, saved_at.
   - Unique constraint on (JobId, UserId) to prevent duplicate saves.
- Storage bucket: applications
   - Private bucket for storing resumes and cover letters.

### 5.2 Row Level Security (RLS)

- Posted_Jobs
   - SELECT: open (anyone can read jobs).
   - INSERT/UPDATE/DELETE: allowed only for authenticated users.
- Applied_Jobs
   - SELECT: user can only see rows where UserId = auth.jwt() →> 'sub'.
   - INSERT/DELETE: user can create and delete their own application rows.
- Saved_Jobs
   - SELECT/INSERT/UPDATE/DELETE are restricted to rows where UserId matches the JWT subject.
- Storage (applications bucket)
   - Users can only access files they uploaded (folder prefix or metadata checks).

ARCHITECTURE_DIAGRAMS.md contains detailed ASCII diagrams of these relationships and flows.

---

## 6. Project Structure

Simplified view of the actual structure:

```text
JobNest/
├─ public/
│  └─ companies/        # Company logos for landing page carousel
├─ src/
│  ├─ components/
│  │  └─ ui/            # Header, Footer, buttons, inputs, SaveJobBtn, etc.
│  ├─ data/
│  │  ├─ companiesData.json
│  │  └─ faq.json
│  ├─ layouts/
│  │  └─ AppLayout.jsx  # Global layout shell
│  ├─ lib/
│  │  └─ utils.js       # Shared utilities
│  ├─ pages/
│  │  ├─ LandingPage.*
│  │  ├─ Job.*
│  │  ├─ PostJobs.*
│  │  ├─ SavedJobs.*
│  │  ├─ MyJobs.*
│  │  └─ ApplyPage.*
│  ├─ utils/
│  │  └─ supabase.js    # Supabase client(s)
│  ├─ App.jsx           # Router definition
│  ├─ main.jsx          # React + Clerk bootstrapping
│  ├─ App.css, index.css
│  └─ ...
├─ supabase/            # Supabase‑related files (optional tooling)
├─ *.md                 # Setup, architecture, and quick‑reference docs
└─ vite.config.js
```

---

## 7. Setup and Running Locally

### 7.1 Prerequisites

- Node.js 18+ (recommended)
- npm or pnpm
- Supabase project
- Clerk account

### 7.2 Backend (Supabase + Clerk)

1. **Create a Supabase project**.
2. **Run the schema script**:
    - Open the Supabase SQL Editor.
    - Paste and run the contents of COMPLETE_SUPABASE_SETUP.sql.
3. **Configure Clerk JWT template** (see CLERK_JWT_SETUP_GUIDE.md):
    - Create a JWT template named exactly supabase.
    - Configure claims to include the user id in sub.
    - Use the JWKS URL in Supabase JWT settings if you’re enforcing JWT verification.

### 7.3 Environment Variables

Create a .env file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
```

You can use .env.example (if present) as a reference.

### 7.4 Install and Run

```bash
npm install
npm run dev
```

The dev server will typically start at http://localhost:5173/.

To build for production:

```bash
npm run build
```

---

## 8. How to Extend the Project

- Persist full application details:
   - Add a JSON or structured table to store the entire ApplyPage form payload and uploaded file paths.
- Recruiter dashboards:
   - Add pages to list all applicants per job using joins on Applied_Jobs.
- Notifications:
   - Integrate email or webhook notifications for new applications.
- Role‑based access:
   - Add roles (candidate/recruiter/admin) and extend RLS + UI accordingly.

---

## 9. Summary

JobNest provides a complete end‑to‑end workflow:

- Authenticated users browse and discover jobs.
- They save and apply to positions with secure, per‑user data isolation.
- Recruiters publish opportunities with rich descriptions.
- Supabase, backed by RLS and indexes, powers secure and performant data access.

Use the additional markdown files in the root for database, auth, and architecture deep dives.
