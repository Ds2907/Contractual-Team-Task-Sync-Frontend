import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/Api"

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState("PROJECTS")
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [developers, setDevelopers] = useState([])
  const [showDevModal, setShowDevModal] = useState(false)
  const [editingDeveloper, setEditingDeveloper] = useState(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white w-full max-w-[400px] p-6 sm:p-8 rounded-2xl shadow-2xl transform transition-all">
          <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">Update Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name" value={form.name} onChange={handleChange} placeholder="Name"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base"
            />
            <input
              name="phone" value={form.phone} onChange={handleChange} placeholder="Phone"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base"
            />
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
              <button type="button" onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition">
                Cancel
              </button>
              <button type="submit"
                className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition">
                Save Changes
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
    if (activeTab === "ONGOING") return projects.filter(p => p.status === "ONGOING")
    if (activeTab === "COMPLETED") return projects.filter(p => p.status === "COMPLETED")
    return projects
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">

      {/* SIDEBAR - BECOMES BOTTOM NAVIGATION ON MOBILE */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:h-screen w-full md:w-64 bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 p-2 md:p-6 flex flex-row md:flex-col shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] md:shadow-xl z-50 items-center md:items-stretch overflow-x-auto md:overflow-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Sync<span className="text-indigo-400">Admin</span></h2>
        </div>

        <ul className="flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-2 flex-1 w-full m-0 items-center md:items-stretch">
          <div className="hidden md:block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 mt-4">Projects</div>
          <MenuItem label="All Projects" active={activeTab === "PROJECTS"} onClick={() => setActiveTab("PROJECTS")} />
          <MenuItem label="Current Projects" active={activeTab === "ONGOING"} onClick={() => setActiveTab("ONGOING")} />
          <MenuItem label="Completed Projects" active={activeTab === "COMPLETED"} onClick={() => setActiveTab("COMPLETED")} />
          
          <div className="hidden md:block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2 mt-8">People</div>
          {/* Subtle divider for mobile to separate projects from people */}
          <div className="w-px h-6 bg-slate-700 mx-1 md:hidden"></div>
          <MenuItem label="All Clients" active={activeTab === "CLIENTS"} onClick={() => setActiveTab("CLIENTS")} />
          <MenuItem label="All Developers" active={activeTab === "DEVS"} onClick={() => setActiveTab("DEVS")} />
        </ul>
      </div>

      {/* MAIN CONTENT */}
      {/* pb-[72px] adds padding at bottom on mobile to ensure content isn't hidden behind the fixed bottom nav */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden pb-[60px] md:pb-0 w-full">

        {/* TOP NAVBAR */}
        <div className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-4 sm:px-8 shadow-sm shrink-0 z-10 sticky top-0">
          <div className="flex flex-col justify-center min-w-0 pr-4">
            <h1 className="font-bold text-lg sm:text-2xl text-slate-800 tracking-tight truncate">
              {activeTab === "PROJECTS" ? "Dashboard" : 
               activeTab === "ONGOING" ? "Active Projects" :
               activeTab === "COMPLETED" ? "Completed Projects" :
               activeTab === "CLIENTS" ? "Clients" : "Developers"}
            </h1>
            <p className="hidden sm:block text-sm text-slate-500 truncate">Welcome back, {profile?.name?.split(' ')[0] || 'Admin'}</p>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="flex items-center gap-2 sm:gap-3 hover:bg-slate-50 p-1 sm:p-1.5 rounded-full transition border border-transparent hover:border-slate-200"
            >
              <div className="hidden sm:flex flex-col items-end pr-1">
                <span className="font-semibold text-sm text-slate-700 leading-tight">{profile?.name}</span>
                <span className="text-xs text-slate-500 font-medium">Administrator</span>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 text-indigo-700 font-bold text-base sm:text-lg rounded-full flex items-center justify-center shadow-inner">
                {profile?.name?.[0]?.toUpperCase()}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 sm:mt-3 w-48 sm:w-56 bg-white shadow-2xl rounded-2xl border border-slate-100 py-2 z-50 transform transition-all">
                <div className="px-4 py-3 border-b border-slate-100 mb-1 bg-slate-50/50 rounded-t-2xl">
                  <p className="text-sm font-semibold text-slate-800 truncate">{profile?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{profile?.ph}</p>
                </div>
                <button onClick={() => setShowProfileModal(true)} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition">
                  Update Profile
                </button>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 mt-1 text-sm text-red-600 hover:bg-red-50 font-medium transition">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="p-4 sm:p-8 flex-1 overflow-auto">

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <Stat title="Projects" value={profile.totalProjects} color="bg-indigo-500" />
            <Stat title="Completed" value={profile.completedProjects} color="bg-emerald-500" />
            <Stat title="Clients" value={profile.totalClients} color="bg-amber-500" />
            <Stat title="Developers" value={profile.totalDevelopers} color="bg-blue-500" />
          </div>

          {/* HEADER & ADD BUTTON */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">
              {["PROJECTS", "ONGOING", "COMPLETED"].includes(activeTab) ? "Recent Projects" : "Directory Listing"}
            </h2>

            {["PROJECTS", "ONGOING", "COMPLETED"].includes(activeTab) && (
              <button onClick={() => { setEditingProject(null); setShowModal(true); }}
                className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 sm:py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 flex items-center gap-2">
                <span>+ Create Project</span>
              </button>
            )}
            
            {activeTab === "CLIENTS" && (
              <button onClick={() => { setEditingClient(null); setShowClientModal(true); }}
                className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 sm:py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                + Add Client
              </button>
            )}

            {activeTab === "DEVS" && (
              <button onClick={() => { setEditingDeveloper(null); setShowDevModal(true); }}
                className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-3 sm:py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                + Add Developer
              </button>
            )}
          </div>

          {/* RENDER GRIDS */}
          {["PROJECTS", "ONGOING", "COMPLETED"].includes(activeTab) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 pb-8">
              {getFilteredProjects().map(p => (
                <ProjectCard key={p.id} project={p} reload={loadProjects} onEdit={(proj) => { setEditingProject(proj); setShowModal(true); }} />
              ))}
              {getFilteredProjects().length === 0 && (
                <div className="col-span-full text-center py-12 sm:py-16 text-slate-500 bg-white rounded-2xl border-2 border-slate-200 border-dashed px-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-2xl text-slate-400">📋</span>
                  </div>
                  <p className="font-medium text-base sm:text-lg text-slate-700">No projects found</p>
                  <p className="text-xs sm:text-sm mt-1">Get started by creating a new project.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "CLIENTS" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 pb-8">
              {clients.map(c => <ClientCard key={c.id} client={c} reload={loadClients} onEdit={(client) => { setEditingClient(client); setShowClientModal(true); }} />)}
            </div>
          )}

          {activeTab === "DEVS" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 pb-8">
              {developers.map(d => <DeveloperCard key={d.id} developer={d} reload={loadDevelopers} onEdit={(dev) => { setEditingDeveloper(dev); setShowDevModal(true); }} />)}
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      <ProjectModal show={showModal} onClose={() => setShowModal(false)} reload={loadProjects} clients={clients} developers={developers} editingProject={editingProject} />
      <DeveloperModal show={showDevModal} onClose={() => setShowDevModal(false)} reload={loadDevelopers} editingDeveloper={editingDeveloper} />
      <ClientModal show={showClientModal} onClose={() => setShowClientModal(false)} reload={loadClients} editingClient={editingClient} />
      <ProfileModal show={showProfileModal} onClose={() => setShowProfileModal(false)} profile={profile} reload={loadProfile} />

    </div>
  )
}

/* ================= MODALS ================= */

function ProjectModal({ show, onClose, reload, clients, developers, editingProject }) {
  const [form, setForm] = useState({ title: "", description: "", status: "ONGOING", clientId: "", developerIds: [] })

  useEffect(() => {
    if (editingProject) {
      setForm({
        title: editingProject.title, description: editingProject.description, status: editingProject.status,
        clientId: editingProject.client?.id || "", developerIds: editingProject.developers?.map(d => d.id) || []
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
      developerIds: prev.developerIds.includes(id) ? prev.developerIds.filter(d => d !== id) : [...prev.developerIds, id]
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingProject) await api.put(`/api/projects/${editingProject.id}`, form)
    else await api.post("/api/projects", form)
    reload()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">
          {editingProject ? "Edit Project" : "Create Project"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          
          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Project Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. E-Commerce Redesign" 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Brief details about the project..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none text-sm sm:text-base" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer text-sm sm:text-base">
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Client</label>
              <select name="clientId" value={form.clientId} onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer text-sm sm:text-base" required>
                <option value="">Select a Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-bold text-slate-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Assign Developers</label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50 space-y-1">
              {developers.length === 0 && <p className="text-sm text-slate-500 italic p-3">No developers available.</p>}
              {developers.map(d => (
                <label key={d.id} className="flex items-center text-sm cursor-pointer hover:bg-white p-3 rounded-lg border border-transparent hover:border-slate-200 hover:shadow-sm transition-all">
                  <input type="checkbox" checked={form.developerIds.includes(d.id)} onChange={() => toggleDeveloper(d.id)} 
                    className="mr-3 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                  <span className="font-medium sm:font-semibold text-slate-700">{d.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition">
              Cancel
            </button>
            <button type="submit"
              className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition">
              {editingProject ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeveloperModal({ show, onClose, reload, editingDeveloper }) {
  const [form, setForm] = useState({ name: "", email: "", ph: "", password: "" })

  useEffect(() => {
    if (editingDeveloper) setForm({ name: editingDeveloper.name || "", email: editingDeveloper.email || "", ph: editingDeveloper.ph || "" })
    else setForm({ name: "", email: "", ph: "", password: "" })
  }, [editingDeveloper])

  if (!show) return null

  function handleChange(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingDeveloper) await api.put(`/api/admin/developers/${editingDeveloper.id}`, form)
    else await api.post("/api/admin/developers", form)
    reload()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">{editingDeveloper ? "Edit Developer" : "Add Developer"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" type="email" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          <input name="ph" value={form.ph} onChange={handleChange} placeholder="Phone Number" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          {!editingDeveloper && <input name="password" value={form.password} onChange={handleChange} placeholder="Assign Password" type="password" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition">Cancel</button>
            <button type="submit" className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition">Save Developer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClientModal({ show, onClose, reload, editingClient }) {
  const [form, setForm] = useState({ name: "", email: "", ph: "", password: "" })

  useEffect(() => {
    if (editingClient) setForm({ name: editingClient.name || "", email: editingClient.email || "", ph: editingClient.ph || "" })
    else setForm({ name: "", email: "", ph: "", password: "" })
  }, [editingClient])

  if (!show) return null

  function handleChange(e) { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingClient) await api.put(`/api/admin/clients/${editingClient.id}`, form)
    else await api.post("/api/admin/clients", form)
    reload()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-slate-800">{editingClient ? "Edit Client" : "Add Client"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Client Name / Company" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" type="email" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          <input name="ph" value={form.ph} onChange={handleChange} placeholder="Phone Number" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />
          {!editingClient && <input name="password" value={form.password} onChange={handleChange} placeholder="Assign Password" type="password" className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-3 sm:p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm sm:text-base" required />}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-5 py-3 sm:py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition">Cancel</button>
            <button type="submit" className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition">Save Client</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ================= UI COMPONENTS ================= */

function MenuItem({ label, active, onClick }) {
  return (
    <li onClick={onClick}
      className={`flex-shrink-0 px-3.5 py-2 md:px-4 md:py-3 rounded-xl cursor-pointer text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap
      ${active 
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
      {label}
    </li>
  )
}

function Stat({ title, value, color }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${color}`}></div>
      <p className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 ml-2 sm:ml-2">{title}</p>
      <h3 className="text-2xl sm:text-4xl font-black text-slate-800 ml-2 tracking-tight">{value}</h3>
    </div>
  )
}

function ProjectCard({ project, reload, onEdit }) {
  const navigate = useNavigate()
  const [completion, setCompletion] = useState(0)

  useEffect(() => {
    async function loadCompletion() {
      try { const res = await api.get(`/api/tasks/project/${project.id}/completion`); setCompletion(res.data) } 
      catch { setCompletion(0) }
    }
    loadCompletion()
  }, [project.id])

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this project?")) return
    await api.delete(`/api/projects/${project.id}`)
    reload()
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      
      <div className="flex justify-between items-start gap-3 mb-3 sm:mb-4">
        <h3 onClick={() => navigate(`/admin/project/${project.id}`)}
          className="font-extrabold text-lg sm:text-xl text-slate-800 cursor-pointer group-hover:text-indigo-600 transition-colors leading-tight min-w-0">
          <span className="truncate block">{project.title}</span>
        </h3>
        <span className={`flex-shrink-0 px-2.5 py-1 text-[9px] sm:text-[10px] uppercase rounded-full font-extrabold tracking-wider border
            ${project.status === "ONGOING" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-emerald-50 text-emerald-600 border-emerald-200"}`}>
          {project.status}
        </span>
      </div>

      <p className="text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6 line-clamp-2 leading-relaxed flex-1">
        {project.description}
      </p>

      <div className="bg-slate-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-slate-100 space-y-2.5 sm:space-y-3">
        <div className="flex items-center text-xs sm:text-sm min-w-0">
          <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-2 sm:mr-3 text-[10px] sm:text-xs font-bold">C</span>
          <span className="font-semibold text-slate-700 truncate">{project.client?.name || "No Client Assigned"}</span>
        </div>
        <div className="flex items-center text-xs sm:text-sm min-w-0">
          <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mr-2 sm:mr-3 text-[10px] sm:text-xs font-bold">D</span>
          <span className="text-slate-600 truncate">
            {project.developers?.length > 0 ? project.developers.map(d => d.name).join(", ") : "No Developers Assigned"}
          </span>
        </div>
      </div>

      <div className="mb-5 sm:mb-6">
        <div className="flex justify-between text-xs sm:text-sm mb-1.5 sm:mb-2">
          <span className="text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">Progress</span>
          <span className="text-indigo-600 font-extrabold">{completion}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 sm:h-2">
          <div className="bg-indigo-600 h-1.5 sm:h-2 rounded-full transition-all duration-700 ease-out" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="flex flex-row gap-2 pt-4 border-t border-slate-100 mt-auto">
        <button onClick={() => onEdit(project)} className="flex-1 sm:flex-none px-4 py-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl sm:rounded-lg text-sm font-bold transition">Edit</button>
        <button onClick={handleDelete} className="flex-1 sm:flex-none px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl sm:rounded-lg text-sm font-bold transition">Delete</button>
      </div>
    </div>
  )
}

function DeveloperCard({ developer, reload, onEdit }) {
  async function handleDelete() {
    if (!window.confirm("Delete developer?")) return
    await api.delete(`/api/admin/developers/${developer.id}`)
    reload()
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md text-white font-bold text-xl sm:text-2xl">
        {developer.name[0].toUpperCase()}
      </div>
      <h3 className="font-bold text-base sm:text-lg text-slate-800 mb-0.5 sm:mb-1 truncate">{developer.name}</h3>
      <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{developer.email}</p>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">{developer.ph}</p>

      <div className="flex flex-row justify-center gap-2 mt-5 sm:mt-6 pt-4 border-t border-slate-100">
        <button onClick={() => onEdit(developer)} className="flex-1 sm:flex-none text-indigo-600 text-xs sm:text-sm font-bold transition px-3 py-2 sm:py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 sm:bg-transparent">Edit</button>
        <button onClick={handleDelete} className="flex-1 sm:flex-none text-red-500 text-xs sm:text-sm font-bold transition px-3 py-2 sm:py-1.5 rounded-lg bg-red-50 hover:bg-red-100 sm:bg-transparent">Remove</button>
      </div>
    </div>
  )
}

function ClientCard({ client, reload, onEdit }) {
  async function handleDelete() {
    if (!window.confirm("Delete client?")) return
    await api.delete(`/api/admin/clients/${client.id}`)
    reload()
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md text-white font-bold text-xl sm:text-2xl">
        {client.name[0].toUpperCase()}
      </div>
      <h3 className="font-bold text-base sm:text-lg text-slate-800 mb-0.5 sm:mb-1 truncate">{client.name}</h3>
      <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{client.email}</p>
      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1">{client.ph}</p>

      <div className="flex flex-row justify-center gap-2 mt-5 sm:mt-6 pt-4 border-t border-slate-100">
        <button onClick={() => onEdit(client)} className="flex-1 sm:flex-none text-indigo-600 text-xs sm:text-sm font-bold transition px-3 py-2 sm:py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 sm:bg-transparent">Edit</button>
        <button onClick={handleDelete} className="flex-1 sm:flex-none text-red-500 text-xs sm:text-sm font-bold transition px-3 py-2 sm:py-1.5 rounded-lg bg-red-50 hover:bg-red-100 sm:bg-transparent">Remove</button>
      </div>
    </div>
  )
}