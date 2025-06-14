import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminPanel() {
  const [projects, setProjects] = useState([])
  const [statuses, setStatuses] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: projData, error: projError } = await supabase.from('projects').select('title')
      const { data: statusData, error: statusError } = await supabase.from('status_projs').select('*')

      if (projError || statusError) {
        console.error(projError || statusError)
      } else {
        setProjects(projData)
        setStatuses(statusData)
      }
    }

    fetchData()
  }, [])

  const handleChangeStatus = async () => {
    if (!selectedProject || !selectedStatus) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase.rpc('set_project_status_by_name', {
      target_title: selectedProject,
      new_status: selectedStatus,
    })

    if (error) {
      console.error('Status update error:', error)
      setMessage('❌ Failed to update status')
    } else {
      setMessage('✅ Status updated successfully')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto mt-10bg-gray-100 p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Panel</h2>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select Project</label>
        <select
          className="w-full p-2 rounded border"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">-- Choose a project --</option>
          {projects.map((proj) => (
            <option key={proj.title} value={proj.title}>
              {proj.title}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Set Status</label>
        <select
          className="w-full p-2 rounded border"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">-- Choose status --</option>
          {statuses.map((s) => (
            <option key={s.id_status_projs} value={s.status_projs}>
              {s.status_projs}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleChangeStatus}
        disabled={loading || !selectedProject || !selectedStatus}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        {loading ? 'Updating...' : 'Update Status'}
      </button>

      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  )
}
