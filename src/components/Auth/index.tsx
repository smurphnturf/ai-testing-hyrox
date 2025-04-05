import { useState } from 'react'
import { Box, TextField, Button, Typography, Alert, Paper, Tab, Tabs } from '@mui/material'
import { useAuth } from '../../context/AuthContext'

interface AuthFormData {
  email: string
  password: string
}

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState<AuthFormData>({ email: '', password: '' })
  const [error, setError] = useState<string>('')
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        mx: 'auto',
        p: 2,
        mt: 8
      }}
    >
      <Paper 
        sx={{ 
          width: '100%', 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: 'primary.main'
          }
        }}
      >
        <Tabs
          value={isLogin ? 0 : 1}
          onChange={(_, newValue) => setIsLogin(newValue === 0)}
          variant="fullWidth"
          sx={{ 
            borderBottom: 1,
            borderColor: 'divider',
            '.MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.95rem',
              textTransform: 'none',
              py: 2
            }
          }}
        >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        <Box sx={{ p: 4 }}>
          <Typography 
            variant="h5" 
            component="h1" 
            gutterBottom 
            textAlign="center"
            sx={{ 
              fontWeight: 700,
              mb: 3,
              color: 'text.primary'
            }}
          >
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5
            }}
          >
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.03)'
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                    boxShadow: '0 0 0 2px rgba(62,207,142,0.2)'
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.03)'
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                    boxShadow: '0 0 0 2px rgba(62,207,142,0.2)'
                  }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ 
                mt: 2,
                height: 48,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(62,207,142,0.2)'
                }
              }}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}