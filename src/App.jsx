import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import VoteCard from './components/VoteCard';
import AdminPanel from './components/AdminPanel';
import './App.css';
import { CookiesProvider } from 'react-cookie';
import LoginForm from './login/login';
import { supabase } from './supabaseClient';

function Home() {
  const [view, setView] = useState('vote');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('vote');
  };

  return (
    <div className="min-h-screen p-4">
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView('vote')}
          className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors"
        >
          Vote
        </button>

        {!user && (
          <button
            onClick={() => setView('admin')}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors"
          >
            Login
          </button>
        )}

        
        {user && (
          <>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors"
            >
              Admin Panel
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>

      {view === 'vote' ? (
        <VoteCard />
      ) : !user ? (
        <LoginForm />
      ) : null}
    </div>
  );
}

function AdminDashboardPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/');
      else setUser(user);
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return user ? (
    <div className="min-h-screen p-4">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors"
        >
          Back to Main
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl cursor-pointer transition-colors"
        >
          Logout
        </button>
      </div>
      <AdminPanel />
    </div>
  ) : null;
}

function App() {
  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;
