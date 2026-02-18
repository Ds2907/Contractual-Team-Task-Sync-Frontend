import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"

import Register from "./pages/Register"

import UserDashboard from "./pages/UserDashboard"
import DeveloperDashboard from "./pages/DeveloperDashboard"
import AdminDashboard from "./pages/AdminDashboard"

import ProtectedRoute from "./components/ProtectedRoute"
import AdminProjectDetails from "./pages/ProjectDetails"

function App() {
  return (
    <Routes>

      {/* Landing Page */}
      <Route path="/" element={<Home />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Role Dashboards */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserDashboard />
           </ProtectedRoute> 
        }
      />

      <Route
        path="/developer"
        element={
          <ProtectedRoute>
            <DeveloperDashboard />
          </ProtectedRoute> 
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute> 
        }
      />

      {/* 🔥 Admin Project Details Page */}
      <Route
        path="/admin/project/:id"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminProjectDetails />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}

export default App
