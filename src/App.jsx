// Dependencies
import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Styling CSS
import './App.css'

// ShadCn Ui
import { ThemeProvider } from "./components/ui/ThemeProvider"

// Layout
import AppLayout from './layouts/AppLayout'

// Pages
import LandingPage from './pages/LandingPage'
import Job from './pages/Job'
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
        path: "/job",
        element: 
        <ProtectedRoute>
          <Job />
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
        path: "/apply/:jobId",
        element: <ProtectedRoute><ApplyPage /></ProtectedRoute>
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