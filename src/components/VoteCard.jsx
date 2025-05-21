import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function VoteCard() {
  const [project, setProject] = useState(null)
  const projectName = 'Teste'

  // Fetch project data on mount
  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('title', projectName)
        .single()

      if (error) {
        console.error('Fetch error:', error)
      } else {
        setProject(data)
      }
    }

    fetchProject()

  }, [])

  // Handle voting using RPC
  async function handleVote(type) {
    const { error } = await supabase.rpc('vote_on_project', {
      target_project_name: projectName,
      vote_type: type,
    })

    if (error) {
      console.error('Vote error:', error)
    }
  }

  if (!project) return <p className="text-center mt-10">Loading...</p>

  return (

    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">{project.title}</h2>
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
