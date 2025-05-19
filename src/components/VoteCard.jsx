import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function VoteCard() {
  const [project, setProject] = useState(null)
  const projectName = 'Teste' 

  
  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('title', projectName)
        .single()
        
        

      if (error) {
        console.error('Erro:', error.message)
        return
      }

      setProject(data)
    }

    fetchProject()
  }, [])

  async function handleVote(type) {
    if (!project) return

    const updatedVotes = {
      votes_a: type === 'positive' ? project.votes_a + 1 : project.votes_a,
      votes_b: type === 'negative' ? project.votes_b + 1 : project.votes_b,
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updatedVotes)
      .eq('id_projects', project.id_projects)
      .select()
      .single()

    if (error) {
      console.error('Error voting:', error.message)
      return
    }

    setProject(data) 
  }

  if (!project) return <p className="text-center text-7xl">Loading...</p>

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">{project.title}</h2>
      <p className="mb-4">👍 Positive: {project.votes_a} | 👎 Negative: {project.votes_b}</p>

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
