import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <header className="header">
        <h1>Mobile-First Yay React App</h1>
      </header>
      
      <main className="content">
        <div className="card">
          <p>Count is: {count}</p>
          <button onClick={() => setCount(count + 1)}>
            Increment
          </button>
          <button onClick={() => setCount(0)}>
            Reset
          </button>
        </div>

        <div className="card">
          <h2>Getting Started</h2>
          <p>Edit <code>src/App.tsx</code> and save to test HMR</p>
        </div>
      </main>
    </div>
  )
}

export default App
