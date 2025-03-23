// Dependencies
import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Styling CSS
import './App.css'

// ShadCn Ui
import { ThemeProvider } from "./components/ui/ThemeProvider"

// Layout
import AppLayout from './layouts/Applayout'

// Pages
import LandingPage from './pages/LandingPage'
import OnBoarding from './pages/OnBoarding'
import Job from './pages/Job'
import JobsListing from './pages/JobsListing'
import PostJobs from './pages/PostJobs'
import SavedJobs from './pages/SavedJobs'
import MyJobs from './pages/MyJobs'
import ProtectedRoute from './components/ui/ProtectedRoute'
import ApplyPage from './pages/ApplyPage'





const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children:[
      {
        path: "/",
        element: <LandingPage />
      },
      {
        path: "/onboarding",
        element: 
        <ProtectedRoute>
          <OnBoarding />
        </ProtectedRoute>
      },
      {
        path: "/job",
        element: 
        <ProtectedRoute>
          <Job />
        </ProtectedRoute>
      },
      {
        path: "/joblisting",
        element: 
        <ProtectedRoute>
          <JobsListing />
        </ProtectedRoute>
      },
      {
        path: "/postjobs",
        element: 
        <ProtectedRoute>
          <PostJobs />
        </ProtectedRoute>
      },
      {
        path: "/savedjobs",
        element: 
        <ProtectedRoute>
          <SavedJobs />
        </ProtectedRoute>
      },
      {
        path: "/myjobs",
        element: 
        <ProtectedRoute>
          <MyJobs />
        </ProtectedRoute>
      },
      {
        path: "/apply/:jobId/:userId",
        element:
        <ProtectedRoute>
          <ApplyPage />
        </ProtectedRoute>
      }
    ]
  }
])

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App