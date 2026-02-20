import { useEffect, useState } from "react"
import api from "../services/Api"

export default function DeveloperDashboard() {

  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)

  const [tasks, setTasks] = useState([])
  const [completion, setCompletion] = useState(0)

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")

  const [loading, setLoading] = useState(true)

  /* ================= LOAD DATA ================= */

  useEffect(() => {

    async function loadData() {

      try {

        const profileRes =
          await api.get("/api/developer/profile")

        const projectRes =
          await api.get("/api/projects/developer")

        setProfile(profileRes.data)
        setProjects(projectRes.data)

      } catch (err) {
        console.log("Load Error:", err)
      }

      setLoading(false)
    }

    loadData()

  }, [])

  /* ================= OPEN PROJECT ================= */

  async function openProject(project) {

    try {

      setActiveProject(project)

      const taskRes =
        await api.get(`/api/tasks/project/${project.id}`)

      setTasks(taskRes.data || [])

      const compRes =
        await api.get(`/api/tasks/project/${project.id}/completion`)

      setCompletion(compRes.data || 0)

    } catch (err) {
      console.log("Project Open Error:", err)
    }
  }

  /* ================= ADD TASK ================= */

  async function addTask(e) {

    e.preventDefault()

    if (!title || !desc || !activeProject) {
      alert("Fill all fields")
      return
    }

    try {

      // ✅ NO developerId (backend uses token)
      await api.post("/api/tasks", {
        title: title,
        description: desc,
        projectId: activeProject.id
      })

      setTitle("")
      setDesc("")

      openProject(activeProject)

    } catch (err) {

      console.log("Add Task Error:", err)
      alert("Task add failed")

    }
  }

  /* ================= COMPLETE TASK ================= */

  async function toggleTask(task) {

    try {

      await api.post(`/api/tasks/${task.id}/complete`)

      openProject(activeProject)

    } catch (err) {
      console.log("Update Error:", err)
    }
  }

  /* ================= DELETE TASK ================= */

  async function deleteTask(id) {

    if (!window.confirm("Delete task?")) return

    try {

      await api.delete(`/api/tasks/${id}`)

      openProject(activeProject)

    } catch (err) {
      console.log("Delete Error:", err)
    }
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-indigo-600 text-white text-xl">
        Loading Dashboard...
      </div>
    )
  }

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">

      {/* SIDEBAR */}
      <div className="w-72 bg-gradient-to-b from-indigo-700 to-purple-700 text-white p-6 shadow-xl">

        <h2 className="text-2xl font-bold mb-6">
          👨‍💻 Developer
        </h2>

        <p className="text-sm mb-3 opacity-80">
          My Projects
        </p>

        <ul className="space-y-2">

          {projects.map(p => (

            <li
              key={p.id}
              onClick={() => openProject(p)}
              className={`
                p-3 rounded-lg cursor-pointer transition
                ${activeProject?.id === p.id
                  ? "bg-white text-indigo-700 font-bold"
                  : "hover:bg-white/20"}
              `}
            >
              {p.title}
            </li>

          ))}

        </ul>

      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">

          <h1 className="text-3xl font-bold text-indigo-700">
            Developer Dashboard
          </h1>

          {profile && (

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow">

              <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                {profile.name[0]}
              </div>

              <span className="font-semibold">
                {profile.name}
              </span>

            </div>

          )}

        </div>

        {/* STATS */}
        {profile && (

          <div className="grid grid-cols-3 gap-6 mb-8">

            <InfoCard label="Email" value={profile.email} color="indigo" />
            <InfoCard label="Ongoing" value={profile.ongoingProjects} color="yellow" />
            <InfoCard label="Completed" value={profile.completedProjects} color="green" />

          </div>

        )}

        {!activeProject && (

          <div className="text-center mt-24 text-gray-500 text-lg">
            Select a project
          </div>

        )}

        {activeProject && (

          <>

            {/* PROJECT INFO */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">

              <h2 className="text-2xl font-bold">
                {activeProject.title}
              </h2>

              <p className="text-gray-600">
                {activeProject.description}
              </p>

            </div>

            {/* PROGRESS */}
            <div className="bg-white p-6 rounded-xl shadow mb-6">

              <p className="font-semibold mb-2">
                Progress: {completion}%
              </p>

              <div className="w-full bg-gray-200 h-3 rounded">

                <div
                  className="bg-green-500 h-3 rounded"
                  style={{ width: `${completion}%` }}
                />

              </div>

            </div>

            <div className="grid grid-cols-12 gap-8">

              {/* ADD */}
              <div className="col-span-5">

                <form
                  onSubmit={addTask}
                  className="bg-white p-6 rounded-xl shadow"
                >

                  <h3 className="font-bold mb-4 text-indigo-700">
                    ➕ Add Task
                  </h3>

                  <input
                    className="w-full border p-2 rounded mb-3"
                    placeholder="Task Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />

                  <textarea
                    className="w-full border p-2 rounded mb-3"
                    rows="4"
                    placeholder="Description"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                  />

                  <button className="w-full bg-indigo-600 text-white py-2 rounded">
                    Add Task
                  </button>

                </form>

              </div>

              {/* LIST */}
              <div className="col-span-7">

                <div className="bg-white rounded-xl shadow">

                  <div className="p-4 border-b font-bold text-indigo-700 flex justify-between">
                    <span>📋 Tasks</span>
                    <span>{tasks.length}</span>
                  </div>

                  <div className="p-4 space-y-2">

                    {tasks.length === 0 && (
                      <p className="text-gray-500">No tasks yet</p>
                    )}

                    {tasks.map(t => (

                      <div
                        key={t.id}
                        className="flex justify-between items-center border p-3 rounded hover:bg-gray-50"
                      >

                        <div className="flex items-center gap-2">

                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => toggleTask(t)}
                          />

                          <span className={t.completed ? "line-through text-gray-500" : ""}>
                            {t.title}
                          </span>

                        </div>

                        <button
                          onClick={() => deleteTask(t.id)}
                          className="text-red-500 text-sm"
                        >
                          Delete
                        </button>

                      </div>

                    ))}

                  </div>

                </div>

              </div>

            </div>

          </>

        )}

      </div>

    </div>
  )
}

/* INFO CARD */

function InfoCard({ label, value, color }) {

  const colors = {
    indigo: "border-indigo-500 text-indigo-600",
    yellow: "border-yellow-500 text-yellow-600",
    green: "border-green-500 text-green-600"
  }

  return (

    <div className={`bg-white p-5 rounded-xl shadow border-l-4 ${colors[color]}`}>

      <p className="text-sm text-gray-500 mb-1">
        {label}
      </p>

      <h3 className="text-xl font-bold">
        {value}
      </h3>

    </div>
  )
}