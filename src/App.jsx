import { useState } from 'react'
import VoteCard from './components/VoteCard'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <body className=' bg-gradient-to-r from-blue-600 to-violet-600'>

       <div className="min-h-screen  flex items-center justify-center">
      <VoteCard />
      </div>
      
      </body>
    </>
  )
}

export default App
