import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminDashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const statusMap = {
    0: 'APRESENTAÇÃO',
    1: 'VOTAÇÃO',
    2: 'TERMINADO',
  }

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('id_projects, title, ref_id_status_projs')
        .order('id_projects', { ascending: true })
      if (data) setProjects(data)
    }

    fetchProjects()
  }, [])

  const handleRadioChange = async (project, statusId) => {
    setLoading(true)
    setMessage('')

    
    const { error: statusError } = await supabase
      .from('projects')
      .update({ ref_id_status_projs: statusId })
      .eq('id_projects', project.id_projects)

    
    const { error: activeError } = await supabase
      .from('active_project')
      .update({ project_title: project.title })
      .eq('id', 1)

    if (statusError || activeError) {
      setMessage('❌ Failed to update project or set active project.')
      console.error(statusError || activeError)
    } else {
      setProjects((prev) =>
        prev.map((p) =>
          p.id_projects === project.id_projects
            ? { ...p, ref_id_status_projs: statusId }
            : p
        )
      )
      setMessage('✅ Status and active project updated.')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#fdf5f5] rounded-xl shadow-xl">
      <h1 className="text-2xl font-bold text-center mb-4">Dashboard Geral - Votações</h1>
      <p className="text-sm text-center text-gray-500 mb-6">
        Última atualização: {new Date().toLocaleString('pt-PT')}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">PROJETOS</th>
              {Object.values(statusMap).map((label) => (
                <th key={label} className="px-4 py-2 text-center">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={project.id_projects} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">
                  #{String(index + 1).padStart(2, '0')} {project.title}
                </td>
                {Object.entries(statusMap).map(([statusId, _]) => (
                  <td key={statusId} className="text-center px-4 py-2">
                    <input
                      type="radio"
                      name={`status-${project.id_projects}`}
                      checked={project.ref_id_status_projs === Number(statusId)}
                      onChange={() => handleRadioChange(project, Number(statusId))}
                      disabled={loading}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message && (
        <p className="mt-4 text-center text-sm font-semibold text-blue-600">
          {message}
        </p>
      )}
    </div>
  )
}
