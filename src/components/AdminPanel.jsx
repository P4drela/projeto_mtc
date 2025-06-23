import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FiLogOut } from 'react-icons/fi';
import logo from '../assets/logo.png';

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null); 
  const navigate = useNavigate();

  const statusMap = {
    0: 'APRESENTAÇÃO',
    1: 'VOTAÇÃO',
    2: 'TERMINADO',
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        navigate('/login'); 
      } else {
        setUser(data.user);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('id_projects, title, ref_id_status_projs')
        .order('id_projects', { ascending: true });
      if (data) setProjects(data);
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleRadioChange = async (project, statusId) => {
    setLoading(true);
    setMessage('');

    const { error: statusError } = await supabase
      .from('projects')
      .update({ ref_id_status_projs: statusId })
      .eq('id_projects', project.id_projects);

    const { error: activeError } = await supabase
      .from('active_project')
      .update({ project_title: project.title })
      .eq('id', 1);

    if (statusError || activeError) {
      setMessage('❌ Falha ao atualizar projeto e status.');
      console.error(statusError || activeError);
    } else {
      setProjects((prev) =>
        prev.map((p) =>
          p.id_projects === project.id_projects
            ? { ...p, ref_id_status_projs: statusId }
            : p
        )
      );
      setMessage('✅ Status e projeto ativo atualizados.');
    }

    setLoading(false);
  };

  const handleStatusAppChange = async (status) => {
    setSelectedStatus(status); 
    const { error } = await supabase
      .from('status_app')
      .update({ status_app: status })
      .eq('id_status_app', 1);

    if (error) {
      console.error('Failed to update app status:', error);
      setMessage('❌ Falha ao atualizar o status da app');
    } else {
      setMessage(`✅ App status atualizado para "${status}"`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <header className="bg-blue-950 shadow-sm py-4 px-6 flex justify-between items-center">
        
        <div 
          onClick={() => navigate('/')}
          className="flex items-center cursor-pointer"
        >
          <div className="rounded-md mb- mr-2">
            <img src={logo} alt="DigiMedia logo" className="w-24 p-0" title="Main"/>
          </div>
          <h1 className="text-xl font-semibold text-white">students</h1><h1 className="text-xl font-semibold text-blue-300">@DigiMedia</h1>
        </div>
        
        <button
          onClick={handleLogout}
          className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Logout"
        >
          <FiLogOut className="w-10 h-10 text-orange-400" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto mt-8 p-6 bg-[#fdf5f5] rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2">Dashboard Geral - Votações</h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Última atualização: {new Date().toLocaleString('pt-PT')}
        </p>

        <div className="flex justify-center gap-4 mb-6">
          {['ANTES', 'DURANTE', 'DEPOIS'].map((label) => (
            <button
              key={label}
              onClick={() => handleStatusAppChange(label)}
              className={`px-6 py-2 rounded-xs shadow-xl cursor-pointer font-semibold ${
                selectedStatus === label
                  ? label === 'ANTES'
                    ? 'bg-blue-950 text-white'
                    : label === 'DURANTE'
                    ? 'bg-blue-950 text-white'
                    : 'bg-blue-950 text-white'
                  : 'bg-white text-black'
              } hover:opacity-90 transition-all`}
            >
              {label}
            </button>
          ))}
        </div>

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
                  {Object.entries(statusMap).map(([statusId]) => (
                    <td key={statusId} className="text-center px-4 py-2">
                      <input
                        type="radio"
                        name={`status-${project.id_projects}`}
                        checked={project.ref_id_status_projs === Number(statusId)}
                        onChange={() => handleRadioChange(project, Number(statusId))}
                        disabled={loading}
                        className="w-4 h-4 accent-blue-950 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm font-semibold text-blue-950">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}