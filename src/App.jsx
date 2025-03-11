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
        element: <OnBoarding />
      },
      {
        path: "/job",
        element: <Job />
      },
      {
        path: "/joblisting",
        element: <JobsListing />
      },
      {
        path: "/postjobs",
        element: <PostJobs />
      },
      {
        path: "/savedjobs",
        element: <SavedJobs />
      },
      {
        path: "/myjobs",
        element: <MyJobs />
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