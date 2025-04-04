import { CssBaseline, AppBar, Toolbar, Typography, Button, Box, Snackbar, Alert } from '@mui/material'
import { useState } from 'react'
import './App.css'
import TrainingProgramBuilder from './components/TrainingProgramBuilder'
import { TrainingProgramList } from './components/TrainingProgramList'
import { Auth } from './components/Auth'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const { user, signOut } = useAuth()
  const [showBuilder, setShowBuilder] = useState(false)
  const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const handleProgramCreated = () => {
    setShowBuilder(false)
    setNotification({ message: 'Program created successfully!', severity: 'success' })
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Training Programs
          </Typography>
          {user && (
            <>
              <Button 
                color="inherit" 
                onClick={() => setShowBuilder(!showBuilder)}
                sx={{ mr: 2 }}
              >
                {showBuilder ? 'View Programs' : 'Create Program'}
              </Button>
              <Button color="inherit" onClick={signOut}>
                Sign Out
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        {user ? (
          showBuilder ? (
            <TrainingProgramBuilder onProgramCreated={handleProgramCreated} />
          ) : (
            <TrainingProgramList />
          )
        ) : (
          <Auth />
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
