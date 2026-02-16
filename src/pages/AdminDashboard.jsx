import { useEffect, useState } from "react"
import api from "../services/api"

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState("PROJECTS")
  const [projects, setProjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch Profile
  async function loadProfile() {
    const res = await api.get("/api/admin/profile")
    setProfile(res.data)
  }

  // Fetch Projects
  async function loadProjects() {
    const res = await api.get("/api/projects")
    setProjects(res.data)
  }

  // Load Data
  useEffect(() => {
    async function load() {
      setLoading(true)

      await loadProfile()
      await loadProjects()

      setLoading(false)
    }

    load()
  }, [])

  // Filter
  function getFiltered() {

    if (activeTab === "ONGOING") {
      return projects.filter(p => p.status === "ONGOING")
    }

    if (activeTab === "COMPLETED") {
      return projects.filter(p => p.status === "COMPLETED")
    }

    return projects
  }

  const filtered = getFiltered()

  if (loading) {
    return <p className="p-6">Loading...</p>
  }

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white border-r p-4">

        <h2 className="text-xl font-bold mb-6">
          Admin Panel
        </h2>

        <ul className="space-y-2">

          <MenuItem
            label="All Projects"
            active={activeTab === "PROJECTS"}
            onClick={() => setActiveTab("PROJECTS")}
          />

          <MenuItem
            label="Current Projects"
            active={activeTab === "ONGOING"}
            onClick={() => setActiveTab("ONGOING")}
          />

          <MenuItem
            label="Completed Projects"
            active={activeTab === "COMPLETED"}
            onClick={() => setActiveTab("COMPLETED")}
          />

          <MenuItem
            label="All Clients"
            active={activeTab === "CLIENTS"}
            onClick={() => setActiveTab("CLIENTS")}
          />

          <MenuItem
            label="All Developers"
            active={activeTab === "DEVS"}
            onClick={() => setActiveTab("DEVS")}
          />

        </ul>

      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <div className="h-14 bg-white border-b flex justify-between items-center px-6">

          <h1 className="font-bold text-lg">
            Admin Dashboard
          </h1>

          <div className="flex items-center gap-3">

            <span>{profile?.name}</span>

            <div className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center">
              {profile?.name[0]}
            </div>

          </div>

        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">

            <Stat title="Projects" value={profile.totalProjects} />
            <Stat title="Clients" value={profile.totalClients} />
            <Stat title="Developers" value={profile.totalDevelopers} />
            <Stat title="Completed" value={profile.completedProjects} />

          </div>

          {/* Add Button */}
          <div className="flex justify-end mb-4">

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              + Add Project
            </button>

          </div>

          {/* Projects */}
          <div className="grid grid-cols-2 gap-4">

            {filtered.map(p => (

              <ProjectCard
                key={p.id}
                project={p}
                reload={loadProjects}
              />

            ))}

          </div>

        </div>

      </div>

    </div>
  )
}

/* Sidebar Button */
function MenuItem({ label, active, onClick }) {

  return (
    <li
      onClick={onClick}
      className={`
        p-2 rounded cursor-pointer select-none

        ${active
          ? "bg-blue-100 text-blue-600 font-semibold"
          : "hover:bg-gray-200"}
      `}
    >
      {label}
    </li>
  )
}

/* Stat Card */
function Stat({ title, value }) {

  return (
    <div className="bg-white p-4 rounded shadow">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h3 className="text-2xl font-bold">
        {value}
      </h3>

    </div>
  )
}

/* Project Card */
function ProjectCard({ project, reload }) {

  async function handleDelete() {

    if (!window.confirm("Delete project?")) return

    await api.delete(`/api/projects/${project.id}`)

    reload()
  }

  return (
    <div className="bg-white p-4 rounded shadow">

      <h3 className="font-bold text-lg">
        {project.title}
      </h3>

      <p className="text-gray-600 text-sm mb-2">
        {project.description}
      </p>

      <div className="flex justify-between items-center">

        <span
          className={`
            px-2 py-1 text-xs rounded

            ${project.status === "ONGOING"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"}
          `}
        >
          {project.status}
        </span>

        <button
          onClick={handleDelete}
          className="text-red-500 text-sm"
        >
          Delete
        </button>

      </div>

    </div>
  )
}
