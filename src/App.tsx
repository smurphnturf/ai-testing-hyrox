import { CssBaseline } from '@mui/material'
import './App.css'
import TrainingProgramBuilder from './components/TrainingProgramBuilder'

function App() {
  return (
    <>
      <CssBaseline />
      <div className="container">
        <header className="header">
          <h1>Training Program Builder</h1>
        </header>
        
        <main className="content">
          <TrainingProgramBuilder />
        </main>
      </div>
    </>
  )
}

export default App
