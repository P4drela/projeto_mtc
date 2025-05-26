import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function VoteCard() {
  const [project, setProject] = useState(null)
  const [status, setStatus] = useState(null)
  const projectName = 'Teste'
  

  useEffect(() => {
    
    let intervalId

    async function fetchProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*, status_projs(*)')
        .eq('title', projectName)
        .single()

      if (error) {
        console.error('Polling error:', error)
      } else {
        setProject(data)
        setStatus(data.status_projs?.status_projs || 'Unknown')
      }
    }

    fetchProject()

    intervalId = setInterval(fetchProject, 2000)

    return () => clearInterval(intervalId)

  }, [])

  async function handleVote(type) {
    const { error } = await supabase.rpc('vote_on_project', {
      target_project_name: projectName,
      vote_type: type,
    })

    if (error) {
      console.error('Vote error:', error)
    }
  }

  if (!project) return <div className='rounded-xl shadow-2xl m-auto h-20 w-60 bg-amber-50 text-center '><p className="p-7 font-bold">Loading...</p></div>

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg text-center z-50">
      <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
      <p className="text-sm text-gray-500 mb-4">Status: <strong>{status}</strong></p>
      <p className="mb-4 text-lg">
        👍 {project.votes_a} | 👎 {project.votes_b}
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleVote('positive')}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
        >
          Vote Positive
        </button>
        <button
          onClick={() => handleVote('negative')}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
        >
          Vote Negative
        </button>
      </div>
    </div>
  )
}
