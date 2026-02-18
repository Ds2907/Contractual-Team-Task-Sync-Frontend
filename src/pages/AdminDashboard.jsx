import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/Api"

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState("PROJECTS")
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [developers, setDevelopers] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
const [showProfileModal, setShowProfileModal] = useState(false)
const navigate = useNavigate()



  /* ================= LOADERS ================= */

  async function loadProfile() {
    const res = await api.get("/api/admin/profile")
    setProfile(res.data)
  }

  async function loadProjects() {
    const res = await api.get("/api/admin/projects")
    setProjects(res.data)
  }

  async function loadClients() {
    const res = await api.get("/api/admin/clients")
    setClients(res.data)
  }

  async function loadDevelopers() {
    const res = await api.get("/api/admin/developers")
    setDevelopers(res.data)
  }

  useEffect(() => {
    async function load() {
      setLoading(true)

      await Promise.all([
        loadProfile(),
        loadProjects(),
        loadClients(),
        loadDevelopers()
      ])

      setLoading(false)
    }

    load()
  }, [])

  function ProfileModal({ show, onClose, profile, reload }) {

  const [form, setForm] = useState({
    name: profile?.name || "",
    phone: profile?.ph || ""
  })

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        phone: profile.ph
      })
    }
  }, [profile])

  if (!show) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    await api.put("/api/profile/update", form)

    reload()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white w-[400px] p-6 rounded shadow-lg">

        <h2 className="text-lg font-bold mb-4">
          Update Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full border p-2 rounded"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}

function handleLogout() {
  localStorage.removeItem("token")
  window.location.href = "/"
}

  function getFilteredProjects() {
    if (activeTab === "ONGOING")
      return projects.filter(p => p.status === "ONGOING")

    if (activeTab === "COMPLETED")
      return projects.filter(p => p.status === "COMPLETED")

    return projects
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <ul className="space-y-2">
          <MenuItem label="All Projects" active={activeTab === "PROJECTS"} onClick={() => setActiveTab("PROJECTS")} />
          <MenuItem label="Current Projects" active={activeTab === "ONGOING"} onClick={() => setActiveTab("ONGOING")} />
          <MenuItem label="Completed Projects" active={activeTab === "COMPLETED"} onClick={() => setActiveTab("COMPLETED")} />
          <MenuItem label="All Clients" active={activeTab === "CLIENTS"} onClick={() => setActiveTab("CLIENTS")} />
          <MenuItem label="All Developers" active={activeTab === "DEVS"} onClick={() => setActiveTab("DEVS")} />
        </ul>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
<div className="h-14 bg-white border-b flex justify-between items-center px-6 relative">

  <h1 className="font-bold text-lg">Admin Dashboard</h1>

  <div className="relative">

    <button
      onClick={() => setShowProfileMenu(prev => !prev)}
      className="flex items-center gap-3"
    >
      <span>{profile?.name}</span>

      <div className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center">
        {profile?.name?.[0]}
      </div>
    </button>

    {showProfileMenu && (
      <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded border">

        <button
          onClick={() => setShowProfileModal(true)}
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Update Profile
        </button>

        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
        >
          Logout
        </button>

      </div>
    )}

  </div>
</div>


        {/* CONTENT */}
        <div className="p-6 flex-1 overflow-auto">

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Stat title="Projects" value={profile.totalProjects} />
            <Stat title="Clients" value={profile.totalClients} />
            <Stat title="Developers" value={profile.totalDevelopers} />
            <Stat title="Completed" value={profile.completedProjects} />
          </div>

          {/* ADD BUTTON */}
          {["PROJECTS", "ONGOING", "COMPLETED"].includes(activeTab) && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setEditingProject(null)
                  setShowModal(true)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                + Add Project
              </button>
            </div>
          )}

          {/* PROJECTS */}
          {["PROJECTS", "ONGOING", "COMPLETED"].includes(activeTab) && (
            <div className="grid grid-cols-2 gap-4">
              {getFilteredProjects().map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  reload={loadProjects}
                  onEdit={(proj) => {
                    setEditingProject(proj)
                    setShowModal(true)
                  }}
                />
              ))}
            </div>
          )}

          {/* CLIENTS */}
          {activeTab === "CLIENTS" && (
            <div className="grid grid-cols-2 gap-4">
              {clients.map(c => <UserCard key={c.id} user={c} />)}
            </div>
          )}

          {/* DEVELOPERS */}
          {activeTab === "DEVS" && (
            <div className="grid grid-cols-2 gap-4">
              {developers.map(d => <UserCard key={d.id} user={d} />)}
            </div>
          )}

        </div>
      </div>

      {/* MODAL */}
      <ProjectModal
        show={showModal}
        onClose={() => setShowModal(false)}
        reload={loadProjects}
        clients={clients}
        developers={developers}
        editingProject={editingProject}
      />

      <ProfileModal
  show={showProfileModal}
  onClose={() => setShowProfileModal(false)}
  profile={profile}
  reload={loadProfile}
/>

    </div>
  )
}

/* ================= PROJECT MODAL ================= */

function ProjectModal({ show, onClose, reload, clients, developers, editingProject }) {

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "ONGOING",
    clientId: "",
    developerIds: []
  })

  useEffect(() => {
    if (editingProject) {
      setForm({
        title: editingProject.title,
        description: editingProject.description,
        status: editingProject.status,
        clientId: editingProject.client?.id,
        developerIds: editingProject.developers.map(d => d.id)
      })
    }
  }, [editingProject])

  if (!show) return null

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function toggleDeveloper(id) {
    setForm(prev => ({
      ...prev,
      developerIds: prev.developerIds.includes(id)
        ? prev.developerIds.filter(d => d !== id)
        : [...prev.developerIds, id]
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (editingProject)
      await api.put(`/api/projects/${editingProject.id}`, form)
    else
      await api.post("/api/projects", form)

    reload()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white w-[500px] p-6 rounded shadow-lg">

        <h2 className="text-lg font-bold mb-4">
          {editingProject ? "Edit Project" : "Add Project"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input name="title" value={form.title} onChange={handleChange}
            placeholder="Title" className="w-full border p-2 rounded" required />

          <textarea name="description" value={form.description}
            onChange={handleChange}
            placeholder="Description" className="w-full border p-2 rounded" required />

          <select name="status" value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded">
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <select name="clientId" value={form.clientId}
            onChange={handleChange}
            className="w-full border p-2 rounded" required>
            <option value="">Select Client</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div>
            <p className="text-sm mb-1">Assign Developers</p>
            {developers.map(d => (
              <label key={d.id} className="block text-sm">
                <input type="checkbox"
                  checked={form.developerIds.includes(d.id)}
                  onChange={() => toggleDeveloper(d.id)} />
                {" "} {d.name}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded">
              Cancel
            </button>

            <button type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ================= PROJECT CARD ================= */
function ProjectCard({ project, reload, onEdit }) {

  const navigate = useNavigate()
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    async function loadCompletion() {
      try {
        const res = await api.get(
          `/api/tasks/project/${project.id}/completion`
        )
        setCompletion(res.data)
      } catch {
        setCompletion(0)
      }
    }

    loadCompletion()
  }, [project.id])

  async function handleDelete() {
    if (!window.confirm("Delete project?")) return
    await api.delete(`/api/projects/${project.id}`)
    reload()
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition duration-200">

      {/* Clickable Title */}
      <h3
        onClick={() => navigate(`/admin/project/${project.id}`)}
        className="font-bold text-lg cursor-pointer hover:text-blue-600 transition"
      >
        {project.title}
      </h3>

      <p className="text-gray-600 text-sm mt-1 mb-3">
        {project.description}
      </p>

      {/* Client */}
      <p className="text-xs text-gray-500 mb-1">
        <span className="font-semibold">Client:</span>{" "}
        {project.client?.name || "Not Assigned"}
      </p>

      {/* Developers */}
      <p className="text-xs text-gray-500 mb-2">
        <span className="font-semibold">Developers:</span>{" "}
        {project.developers?.length > 0
          ? project.developers.map(d => d.name).join(", ")
          : "Not Assigned"}
      </p>

      {/* Completion Section */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Completion</span>
          <span className="text-blue-600 font-semibold">
            {completion}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">

        <span
          className={`px-3 py-1 text-xs rounded-full font-medium
            ${project.status === "ONGOING"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"}`}
        >
          {project.status}
        </span>

        <div className="flex gap-4">

          <button
            onClick={() => onEdit(project)}
            className="text-blue-600 text-sm hover:underline"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="text-red-500 text-sm hover:underline"
          >
            Delete
          </button>

        </div>
      </div>
    </div>
  )
}
/* ================= USER CARD ================= */

function UserCard({ user }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold">{user.name}</h3>
      <p className="text-sm text-gray-500">{user.email}</p>
      <p className="text-sm text-gray-500">{user.ph}</p>
      <p className="text-xs mt-2 text-blue-600">{user.role}</p>
    </div>
  )
}

function MenuItem({ label, active, onClick }) {
  return (
    <li onClick={onClick}
      className={`p-2 rounded cursor-pointer
      ${active ? "bg-blue-100 text-blue-600 font-semibold"
        : "hover:bg-gray-200"}`}>
      {label}
    </li>
  )
}

function Stat({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  )
}
