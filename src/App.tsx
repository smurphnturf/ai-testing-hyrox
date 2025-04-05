import { CssBaseline, AppBar, Toolbar, Button, Box, Snackbar, Alert, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import './App.css'
import TrainingProgramBuilder from './components/TrainingProgramBuilder'
import TrainingCalendar from './components/TrainingCalendar'
import { Auth } from './components/Auth'
import { AuthProvider, useAuth } from './context/AuthContext'
import { trainingProgramsService } from './services/trainingPrograms'
import { TrainingProgram } from './components/TrainingProgramBuilder/types'

function AppContent() {
  const { user, signOut } = useAuth()
  const [showBuilder, setShowBuilder] = useState(false)
  const [selectedDay, setSelectedDay] = useState<{week: number, day: number} | null>(null)
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(true)
  const [program, setProgram] = useState<TrainingProgram | null>(null)

  useEffect(() => {
    if (user) {
      loadUserProgram()
    }
  }, [user])

  const loadUserProgram = async () => {
    try {
      const program = await trainingProgramsService.getUserProgram()
      setProgram(program)
      setShowBuilder(!program) // Show builder if no program exists
    } catch (error) {
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to load program',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProgramCreated = () => {
    loadUserProgram()
    setShowBuilder(false)
    setSelectedDay(null)
    setNotification({ message: 'Program created successfully!', severity: 'success' })
  }

  const handleUpdateProgram = async (updatedProgram: TrainingProgram) => {
    try {
      if (!updatedProgram.id) {
        throw new Error('Program ID is required for updates')
      }

      await trainingProgramsService.updateProgram(updatedProgram.id, updatedProgram)
      setProgram(updatedProgram)
      setNotification({ message: 'Workout added successfully!', severity: 'success' })
    } catch (error) {
      setNotification({
        message: error instanceof Error ? error.message : 'Failed to update program',
        severity: 'error'
      })
    }
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {user && (
            <>
              <Button 
                color="inherit" 
                onClick={() => {
                  setShowBuilder(!showBuilder)
                  setSelectedDay(null)
                }}
                sx={{ mr: 2 }}
              >
                {showBuilder ? 'View Program' : 'Edit Program'}
              </Button>
              <Button color="inherit" onClick={signOut}>
                Sign Out
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        {!user ? (
          <Auth />
        ) : loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : showBuilder ? (
          <TrainingProgramBuilder 
            onProgramCreated={handleProgramCreated}
            initialProgram={program || undefined}
            selectedDay={selectedDay}
          />
        ) : program ? (
          <TrainingCalendar 
            program={program}
            onEditProgram={() => setShowBuilder(true)}
            onUpdateProgram={handleUpdateProgram}
          />
        ) : (
          <TrainingProgramBuilder onProgramCreated={handleProgramCreated} />
        )}
      </Box>

      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
      >
        {notification && (
          <Alert 
            onClose={() => setNotification(null)} 
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <AppContent />
    </AuthProvider>
  )
}

export default App
