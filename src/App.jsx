// App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import VoteCard from './components/VoteCard';
import AdminPanel from './components/AdminPanel';
import LoginForm from './login/login';
import BeforeView from './components/BeforeView';
import { supabase } from './supabaseClient';
import { CookiesProvider } from 'react-cookie';
import AfterView from './components/AfterView';

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

  useEffect(() => {
    const pollStatus = async () => {
      const { data, error } = await supabase
        .from('status_app')
        .select('status_app')
        .eq('id_status_app', 1)
        .single();

      if (!error && data) {
        switch (data.status_app) {
          case 'ANTES':
            setView('before');
            break;
          case 'DURANTE':
            setView('vote');
            break;
          case 'DEPOIS':
            setView('after');
            break;
          default:
            setView('vote');
        }
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('vote');
    navigate('/');
  };

  
  if (view === 'before') {
    return <BeforeView />;
  }

  if (view === 'after') {
    return <AfterView />;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex gap-4 mb-6">

        {user && (
          <>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow-xl cursor-pointer"
            >
              Admin Panel
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-xl cursor-pointer"
            >
              Logout
            </button>
          </>
        )}
      </div>

      {view === 'vote' && <VoteCard />}
      
    </div>
  );
}

function App() {
  return (
    <CookiesProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin-dashboard" element={<AdminPanel />} />
        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;
