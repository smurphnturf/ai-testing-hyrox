import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useState } from 'react';
import { TrainingProgram } from './types';
import { trainingProgramsService } from '../../services/trainingPrograms';

interface Props {
  onProgramCreated?: () => void;
  initialProgram?: TrainingProgram;
  selectedDay?: { week: number; day: number } | null;
}

export const TrainingProgramBuilder = ({ onProgramCreated, initialProgram }: Props) => {
  const [saveStatus, setSaveStatus] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const { control, handleSubmit } = useForm<TrainingProgram>({
    defaultValues: initialProgram || {
      name: '',
      workouts: [],
      eventDate: new Date().toISOString(),
    },
  });

  const onSubmit = async (data: TrainingProgram) => {
    // Validate required fields
    if (!data.name?.trim()) {
      setSaveStatus({
        open: true,
        message: 'Program name is required',
        severity: 'error'
      });
      return;
    }

    if (!data.eventDate) {
      setSaveStatus({
        open: true,
        message: 'Event date is required',
        severity: 'error'
      });
      return;
    }

    try {
      const updatedData = {
        ...data,
        workouts: initialProgram?.workouts || [] // Preserve existing workouts
      };
      console.log('Saving program:', updatedData);
      if (initialProgram?.id) {
        await trainingProgramsService.updateProgram(initialProgram.id, updatedData);
      } else {
        await trainingProgramsService.saveProgram(updatedData);
      }

      setSaveStatus({
        open: true,
        message: `Program ${initialProgram ? 'updated' : 'saved'} successfully!`,
        severity: 'success'
      });
      
      onProgramCreated?.();
    } catch (error) {
      console.error('Error saving program:', error);
      setSaveStatus({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to save program. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {initialProgram ? 'Edit Training Program' : 'Create Training Program'}
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Program name is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Program Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />

              <Controller
                name="eventDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Event Date"
                    value={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date?.toISOString())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !field.value,
                        helperText: !field.value ? 'Event date is required' : undefined,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
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
                        }
                      }
                    }}
                  />
                )}
              />
            </Box>

            <Button 
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
            >
              {initialProgram ? 'Update Program' : 'Create Program'}
            </Button>
          </Box>
        </Paper>

        <Snackbar
          open={saveStatus.open}
          autoHideDuration={6000}
          onClose={() => setSaveStatus(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setSaveStatus(prev => ({ ...prev, open: false }))} 
            severity={saveStatus.severity}
          >
            {saveStatus.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default TrainingProgramBuilder;