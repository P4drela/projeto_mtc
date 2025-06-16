import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useCookies } from 'react-cookie'

export default function VoteCard() {
  const [project, setProject] = useState(null)
  const [questions, setQuestions] = useState([])
  const [cookies, setCookie] = useCookies(['votes'])

  const currentTitleRef = useRef(null)
  const currentStatusRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: activeData, error: activeError } = await supabase
          .from('active_project')
          .select('project_title')
          .eq('id', 1)
          .single()

        if (activeError) throw activeError
        const activeTitle = activeData?.project_title

        if (!activeTitle) return

        let shouldUpdateProject = false

        if (activeTitle !== currentTitleRef.current) {
          currentTitleRef.current = activeTitle
          shouldUpdateProject = true
        }

        if (shouldUpdateProject) {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*, status_projs(*)')
            .eq('title', activeTitle)
            .single()

          if (projectError) throw projectError
          setProject(projectData)
          currentStatusRef.current = projectData.status_projs?.id_status_projs

          const { data: questionsData, error: questionsError } = await supabase
            .from('proj_has_questions')
            .select('*, questions(*)')
            .eq('ref_id_projects', projectData.id_projects)
            .order('ref_id_questions', { ascending: true })

          if (questionsError) throw questionsError
          setQuestions(questionsData || [])
        } else if (project) {
          const { data: updatedProject, error: statusError } = await supabase
            .from('projects')
            .select('*, status_projs(*)')
            .eq('id_projects', project.id_projects)
            .single()

          if (statusError) throw statusError

          const newStatusId = updatedProject.status_projs?.id_status_projs

          if (newStatusId !== currentStatusRef.current) {
            currentStatusRef.current = newStatusId
            setProject(prev => ({ ...prev, status_projs: updatedProject.status_projs }))
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [project])

  function hasVoted(questionId) {
    return cookies.votes?.[`project_${project?.id_projects}_question_${questionId}`]
  }

  async function handleVote(questionId, voteType) {
    if (hasVoted(questionId)) {
      alert('You have already voted on this question!')
      return
    }

    try {
      const { error } = await supabase.rpc('vote_on_question', {
        project_id: project.id_projects,
        question_id: questionId,
        vote_type: voteType
      })

      if (error) throw error

      const newVotes = { ...(cookies.votes || {}) }
      newVotes[`project_${project.id_projects}_question_${questionId}`] = true
      setCookie('votes', newVotes, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'strict'
      })

      setQuestions(prev => prev.map(q =>
        q.ref_id_questions === questionId
          ? {
              ...q,
              votes_a: voteType === 'positive' ? q.votes_a + 1 : q.votes_a,
              votes_b: voteType === 'negative' ? q.votes_b + 1 : q.votes_b
            }
          : q
      ))
    } catch (error) {
      console.error('Vote failed:', error)
      alert('Vote failed. Please try again.')
    }
  }

  if (!project) {
    return (
      <div className='rounded-xl shadow-2xl m-auto h-20 w-60 bg-amber-50 text-center'>
        <p className="p-7 font-bold">Loading...</p>
      </div>
    )
  }

  
  const isPresenting = project.status_projs?.status_projs === 'Presenting'
  const votingDisabled = ['Presenting', 'Voting Closed'].includes(project.status_projs?.status_projs)

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-lg text-center z-50">
      <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        Status: <strong>{project.status_projs?.status_projs || 'Unknown'}</strong>
      </p>

      {!isPresenting && (
        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.ref_id_questions} className="border-b pb-4 last:border-b-0">
              <p className="mb-3 font-medium">{question.questions?.text}</p>

              <div className="flex justify-between items-center mb-2">
                <span className="text-green-600 font-bold">
                  👍 {question.votes_a || 0}
                </span>
                <span className="text-red-600 font-bold">
                  👎 {question.votes_b || 0}
                </span>
              </div>

              {votingDisabled ? (
                <p className="text-xs text-gray-500 mt-2 italic">
                  Voting closed.
                </p>
              ) : !hasVoted(question.ref_id_questions) ? (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleVote(question.ref_id_questions, 'positive')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Vote A
                  </button>
                  <button
                    onClick={() => handleVote(question.ref_id_questions, 'negative')}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Vote B
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">✓ Vote submitted</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
