import { useEffect, useState } from "react"
import api from "../services/Api"

export default function UserDashboard() {

  const [projects, setProjects] = useState([])
  const [activeTab, setActiveTab] = useState("ALL")
  const [loading, setLoading] = useState(true)

  /* ================= LOAD PROJECTS ================= */

  useEffect(() => {

    async function loadProjects() {

      try {

        const res = await api.get("/api/projects")

        setProjects(res.data)

      } catch (err) {

        console.log("Project Load Error:", err)

      }

      setLoading(false)
    }

    loadProjects()

  }, [])

  /* ================= FILTER ================= */

  function getFilteredProjects() {

    if (activeTab === "ONGOING") {
      return projects.filter(p => p.status === "ONGOING")
    }

    if (activeTab === "COMPLETED") {
      return projects.filter(p => p.status === "COMPLETED")
    }

    return projects
  }

  const filteredProjects = getFilteredProjects()

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <p className="p-6 text-lg">
        Loading user dashboard...
      </p>
    )
  }

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* ========== SIDEBAR ========== */}
      <div className="w-64 bg-white border-r p-4">

        <h2 className="text-xl font-bold mb-6">
          User Panel
        </h2>

        <ul className="space-y-2">

          <MenuItem
            label="All Projects"
            active={activeTab === "ALL"}
            onClick={() => setActiveTab("ALL")}
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

        </ul>

      </div>

      {/* ========== MAIN ========== */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        <div className="h-14 bg-white border-b flex items-center px-6">

          <h1 className="font-bold text-lg">
            User Dashboard
          </h1>

        </div>

        {/* CONTENT */}
        <div className="p-6 flex-1 overflow-auto">

          {/* HEADER */}
          <div className="mb-6">

            <h2 className="text-2xl font-bold mb-1">

              {activeTab === "ALL" && "All Projects"}
              {activeTab === "ONGOING" && "Ongoing Projects"}
              {activeTab === "COMPLETED" && "Completed Projects"}

            </h2>

            <p className="text-gray-600">

              {activeTab === "ALL" && "View all assigned projects"}
              {activeTab === "ONGOING" && "Currently active projects"}
              {activeTab === "COMPLETED" && "Finished projects"}

            </p>

          </div>

          {/* PROJECT LIST */}
          {filteredProjects.length === 0 ? (

            <p className="text-gray-500 text-center mt-20">
              No projects found
            </p>

          ) : (

            <div className="grid grid-cols-3 gap-4">

              {filteredProjects.map(project => (

                <ProjectCard
                  key={project.id}
                  project={project}
                />

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  )
}

/* ================= MENU ITEM ================= */

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

/* ================= PROJECT CARD ================= */

function ProjectCard({ project }) {

  return (

    <div className="bg-white p-4 rounded shadow hover:shadow-lg transition">

      <h3 className="font-bold text-lg mb-1">
        {project.title}
      </h3>

      <p className="text-gray-600 text-sm mb-3">
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

        <span className="text-sm text-gray-500">

          Client: {project.client?.name || "N/A"}

        </span>

      </div>

    </div>

  )
}
