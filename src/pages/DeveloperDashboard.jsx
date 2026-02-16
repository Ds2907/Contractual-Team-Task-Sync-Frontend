import { useEffect, useState } from "react"
import api from "../services/api"

export default function DeveloperDashboard() {

  const [profile, setProfile] = useState(null)

  useEffect(() => {

    api.get("/api/developer/profile")
      .then(res => setProfile(res.data))

  }, [])

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-4">
        Developer Dashboard
      </h1>

      {profile && (

        <div className="bg-white p-4 rounded shadow w-96">

          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
          <p>Ongoing: {profile.ongoingProjects}</p>

        </div>

      )}

    </div>
  )
}
