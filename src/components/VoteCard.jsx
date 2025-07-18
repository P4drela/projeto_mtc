import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useCookies } from 'react-cookie';
import logo from '../assets/logo.png';

export default function VoteCard() {
  const [project, setProject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [cookies, setCookie] = useCookies(['votes']);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const [votingAllowed, setVotingAllowed] = useState(true);
  const timerRef = useRef(null);

  const getImageUrl = (imageName) => {
    try {
      return new URL(`../assets/${imageName}`, import.meta.url).href;
    } catch (err) {
      console.error('Error loading image:', err);
      return '/placeholder.png';
    }
  };

  const fetchData = async () => {
    const { data: activeData } = await supabase
      .from('active_project')
      .select('project_title')
      .eq('id', 1)
      .single();

    const activeTitle = activeData?.project_title;
    if (!activeTitle) return;

    const { data: projectData } = await supabase
      .from('projects')
      .select('*, status_projs(*)')
      .eq('title', activeTitle)
      .single();

    const { data: questionsData } = await supabase
      .from('proj_has_questions')
      .select('*, questions(*)')
      .eq('ref_id_projects', projectData.id_projects)
      .order('ref_id_questions');

    setProject(projectData);
    setQuestions(questionsData || []);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (project?.status_projs?.status_projs === 'Voting') {
      const projectKey = `vote_timer_${project.id_projects}`;
      const storedStart = localStorage.getItem(projectKey);

      let startTime = storedStart ? parseInt(storedStart) : Date.now();
      if (!storedStart) localStorage.setItem(projectKey, startTime.toString());

      const updateCountdown = () => {
        const now = Date.now();
        const secondsElapsed = Math.floor((now - startTime) / 1000);
        const remaining = 30 - secondsElapsed;

        if (remaining <= 0) {
          setTimeLeft(0);
          setVotingAllowed(false);
          clearInterval(timerRef.current);
        } else {
          setTimeLeft(remaining);
        }
      };

      updateCountdown();
      timerRef.current = setInterval(updateCountdown, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [project]);

  const hasVoted = (questionId) =>
    cookies.votes?.[`project_${project.id_projects}_question_${questionId}`];

  const handleOptionSelect = (questionId, option) => {
    if (!votingAllowed || hasVoted(questionId)) return;
    setSelectedVotes((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitVotes = async () => {
    const entries = Object.entries(selectedVotes);
    if (!entries.length) return;

    const newVotes = { ...(cookies.votes || {}) };

    await Promise.all(
      entries.map(async ([questionId, voteType]) => {
        const cookieKey = `project_${project.id_projects}_question_${questionId}`;
        if (!newVotes[cookieKey]) {
          await supabase.rpc('vote_on_question', {
            project_id: project.id_projects,
            question_id: parseInt(questionId),
            vote_type: voteType === 'Sim' ? 'positive' : 'negative',
          });
          newVotes[cookieKey] = true;
        }
      })
    );

    setCookie('votes', newVotes, { path: '/', maxAge: 60 * 60 * 24 * 365 });
    setSelectedVotes({});
  };

  if (!project) return <div className="p-10 text-center text-gray-600">Loading...</div>;

  const status = project.status_projs?.status_projs;

  const renderPresenting = () => {
  const imageUrl = project.img_url ? getImageUrl(project.img_url) : '/placeholder.png';
  console.log('Image URL:', imageUrl); 

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-6 text-center space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-left">
          <p className="text-sm text-gray-500">#{project.number}</p>
          <h2 className="text-xl font-bold text-blue-800">{project.title}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{project.text}</p>
        </div>
        <img src={logo} alt="Logo" className="w-24 h-20 object-contain" />
      </div>

      <div className="relative overflow-hidden rounded-md group">
        <img
          src={imageUrl}
          alt="Project"
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
        />
      </div>
    </div>
  );
};

  const renderVoting = () => (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-6 text-center space-y-5">
      <div>
        <p className="text-sm text-gray-500">#{project.number}</p>
        <h2 className="text-xl font-bold text-blue-800">{project.title}</h2>
      </div>
      {questions.map((q) => {
        const qid = q.ref_id_questions;
        return (
          <div key={qid} className="space-y-2">
            <p className="text-sm text-gray-800">{q.questions?.text}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleOptionSelect(qid, 'Sim')}
                disabled={hasVoted(qid) || !votingAllowed}
                className={`px-4 py-2 rounded-full font-medium text-white cursor-pointer ${
                  selectedVotes[qid] === 'Sim'
                    ? 'bg-blue-700'
                    : hasVoted(qid)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 hover:bg-blue-100 text-gray-800'
                }`}
              >
                SIM
              </button>
              <button
                onClick={() => handleOptionSelect(qid, 'Nao')}
                disabled={hasVoted(qid) || !votingAllowed}
                className={`px-4 py-2 rounded-full font-medium text-white cursor-pointer ${
                  selectedVotes[qid] === 'Nao'
                    ? 'bg-blue-700'
                    : hasVoted(qid)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 hover:bg-blue-100 text-gray-800'
                }`}
              >
                NÃO
              </button>
            </div>
          </div>
        );
      })}
      <button
        onClick={handleSubmitVotes}
        disabled={!votingAllowed || Object.keys(selectedVotes).length === 0}
        className="mt-2 bg-blue-800 text-white font-bold px-6 py-2 rounded-lg disabled:bg-gray-400 cursor-pointer"
      >
        SUBMETER VOTO
      </button>
      <p className="text-sm text-gray-600">
        TEMPO RESTANTE <span className="font-bold">{String(timeLeft).padStart(2, '0')}s</span>
      </p>
    </div>
  );

  const renderVotingClosed = () => (
  <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-6 text-center space-y-5">
    <div className="mb-4">
      <p className="text-sm text-gray-500">#{project.number}</p>
      <h2 className="text-xl font-bold text-blue-800 mb-2">{project.title}</h2>
      <div className="bg-blue-50 text-blue-800 p-2 rounded-lg">
        <p className="text-sm font-medium">Votação Encerrada</p>
      </div>
    </div>
    
    {questions.map((q) => {
      const total = q.votes_a + q.votes_b;
      const percentA = total ? Math.round((q.votes_a / total) * 100) : 0;
      const percentB = 100 - percentA;
      
      return (
        <div key={q.ref_id_questions} className="space-y-3 group">
          <p className="text-sm font-medium text-gray-800 px-2">
            {q.questions?.text}
          </p>
          
          <div className="space-y-1">

            <div className="flex h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 flex items-center justify-center text-xs font-bold text-white 
                          transition-all duration-300 ease-out 
                          group-hover:scale-y-125 group-hover:shadow-md origin-bottom cursor-pointer"
                style={{ width: `${percentA}%` }}
              >
                <span className="transition-opacity duration-300 group-hover:opacity-100 opacity-90">
                  {percentA}%
                </span>
              </div>
              <div 
                className="bg-red-500 flex items-center justify-center text-xs font-bold text-white 
                          transition-all duration-300 ease-out 
                          group-hover:scale-y-125 group-hover:shadow-md origin-bottom cursor-pointer"
                style={{ width: `${percentB}%` }}
              >
                <span className="transition-opacity duration-300 group-hover:opacity-100 opacity-90">
                  {percentB}%
                </span>
              </div>
            </div>
          
            <div className="text-xs text-center text-gray-500 opacity-0
            group-hover:opacity-100 transition-opacity duration-200">
              Total: {total} votos
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

  return (
    <>
      {status === 'Presenting' && renderPresenting()}
      {status === 'Voting' && renderVoting()}
      {status === 'Voting Closed' && renderVotingClosed()}
    </>
  );
}