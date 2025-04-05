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
      duration: 1,
      workouts: [],
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

    try {
      const updatedData = {
        ...data,
        workouts: [] // Empty workouts array as we're not handling workouts here
      };

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
              name="startDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Start Date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Duration (weeks)"
                  fullWidth
                  InputProps={{ inputProps: { min: 1, max: 52 } }}
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
  );
};

export default TrainingProgramBuilder;