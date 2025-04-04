import { CssBaseline, AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import './App.css'
import TrainingProgramBuilder from './components/TrainingProgramBuilder'
import { Auth } from './components/Auth'
import { AuthProvider, useAuth } from './context/AuthContext'

function AppContent() {
  const { user, signOut } = useAuth()

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Training Program Builder
          </Typography>
          {user && (
            <Button color="inherit" onClick={signOut}>
              Sign Out
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        {user ? <TrainingProgramBuilder /> : <Auth />}
      </Box>
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
