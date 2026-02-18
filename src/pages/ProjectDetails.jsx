import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"

export default function ProjectDetails() {

  const { id } = useParams()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [completion, setCompletion] = useState(0)
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)

  /* ================= LOAD DATA ================= */

  async function loadData() {
    try {
      setLoading(true)

      const projRes = await api.get("/api/admin/projects")
      const current = projRes.data.find(p => p.id === Number(id))
      setProject(current)

      const taskRes = await api.get(`/api/tasks/project/${id}`)
      setTasks(taskRes.data)

      const compRes = await api.get(`/api/tasks/project/${id}/completion`)
      setCompletion(compRes.data)

      setLoading(false)

    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  /* ================= TOGGLE ================= */

  async function toggleTask(task) {
    await api.put(`/api/tasks/${task.id}`, {
      title: task.title,
      completed: !task.completed
    })
    loadData()
  }

  /* ================= DELETE ================= */

  async function deleteTask(taskId) {
    await api.delete(`/api/tasks/${taskId}`)
    loadData()
  }

  if (loading) return <p className="p-6">Loading...</p>
  if (!project) return <p className="p-6">Project not found</p>

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <p className="text-sm text-gray-500">
            Completion: {completion}%
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Task
        </button>

      </div>

      {/* ===== TASK LIST ===== */}
      <div className="space-y-3">

        {tasks.length === 0 && (
          <p className="text-gray-400 text-sm">
            No tasks yet.
          </p>
        )}

        {tasks.map(task => (
          <div
            key={task.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center hover:shadow-md transition"
          >
            <div
              onClick={() => toggleTask(task)}
              className={`cursor-pointer ${task.completed ? "line-through text-gray-400" : ""}`}
            >
              <p className="font-medium">{task.title}</p>
              <p className="text-xs text-gray-500">{task.description}</p>
              <p className="text-xs text-blue-600 mt-1">
                Assigned: {task.developer?.name || "N/A"}
              </p>
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 text-sm"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

      {/* ===== MODAL ===== */}
      <AddTaskModal
        show={showModal}
        onClose={() => setShowModal(false)}
        project={project}
        reload={loadData}
      />

    </div>
  )
}

/* ================= ADD TASK MODAL ================= */

function AddTaskModal({ show, onClose, project, reload }) {

  const { id } = useParams()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [developerId, setDeveloperId] = useState("")

  if (!show) return null

  async function handleSubmit(e) {
    e.preventDefault()

    if (!title || !description || !developerId) {
      alert("Fill all fields")
      return
    }

    await api.post("/api/tasks", {
      title,
      description,
      projectId: Number(id),
      developerId: Number(developerId)
    })

    setTitle("")
    setDescription("")
    setDeveloperId("")
    reload()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white w-[450px] p-6 rounded shadow-lg">

        <h3 className="text-lg font-bold mb-4">
          Add New Task
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full border p-2 rounded"
          />

          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Task description"
            className="w-full border p-2 rounded"
          />

          <select
            value={developerId}
            onChange={e => setDeveloperId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Developer</option>
            {project.developers?.map(dev => (
              <option key={dev.id} value={dev.id}>
                {dev.name}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-3 mt-4">

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
              Add
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}
