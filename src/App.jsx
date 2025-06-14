import { useState } from 'react'
import VoteCard from './components/VoteCard'
import AdminPanel from './components/AdminPanel'
import './App.css'
import { CookiesProvider } from 'react-cookie'
import LoginForm from './components/login'


function App() {
  const [view, setView] = useState('vote')

  return (
  <CookiesProvider>
    <>
    
   
       
      <div className="min-h-screen p-4">
      <div className="flex gap-4 mb-20">
        <button onClick={() =>  setView('vote')} className="bg-blue-500 text-white px-4 py-2 rounded-xl">
          Vote View
        </button>
        <button onClick={() => setView('admin')} className="bg-gray-800 text-white px-4 py-2 rounded-xl">
          Admin View
        </button>
      </div>

      

      {view === 'vote' ? <VoteCard /> : <LoginForm />}
    </div>

    
    </>
  </CookiesProvider>
  )
}

export default App