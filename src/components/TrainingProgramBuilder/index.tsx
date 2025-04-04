import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useState } from 'react';
import { TrainingProgram, Workout } from './types';
import WorkoutDetailsForm from './WorkoutDetailsForm';
import { trainingProgramsService } from '../../services/trainingPrograms';

interface Props {
  onProgramCreated?: () => void;
  initialProgram?: TrainingProgram;
}

const workoutTypes = [
  'strength',
  'running',
  'compromised-run',
  'amrap',
  'emom',
  'recovery',
] as const;

const getDefaultWorkoutData = (type: typeof workoutTypes[number], week: number, day: number): Partial<Workout> => {
  const base = {
    id: crypto.randomUUID(),
    name: '',
    day,
    week,
    type,
  };

  switch (type) {
    case 'strength':
      return {
        ...base,
        type: 'strength',
        exercises: [{ name: '', weight: 0, reps: 0, sets: 0, restTime: 60 }],
      };
    case 'running':
      return {
        ...base,
        type: 'running',
        distance: 0,
        pace: 0,
        time: 0,
        effortLevel: 3,
      };
    case 'amrap':
      return {
        ...base,
        type: 'amrap',
        timeLimit: 20,
        exercises: [{ name: '', reps: 0 }],
      };
    case 'emom':
      return {
        ...base,
        type: 'emom',
        roundTime: 60,
        totalTime: 20,
        exercises: [{ name: '', reps: 0 }],
      };
    default:
      return base;
  }
};

export const TrainingProgramBuilder = ({ onProgramCreated, initialProgram }: Props) => {
  const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [editingWorkoutIndex, setEditingWorkoutIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const { control, handleSubmit, watch, setValue } = useForm<TrainingProgram>({
    defaultValues: initialProgram || {
      name: '',
      duration: 12,
      type: 'hyrox',
      description: '',
      workouts: [],
    },
  });

  const { fields: workouts, append: appendWorkout, remove: removeWorkout, update: updateWorkout } = useFieldArray({
    control,
    name: 'workouts',
  });

  const programDuration = watch('duration');

  const handleAddWorkout = () => {
    setIsWorkoutDialogOpen(true);
  };

  const handleWorkoutSubmit = (workoutType: typeof workoutTypes[number]) => {
    const workoutData = getDefaultWorkoutData(workoutType, selectedWeek, selectedDay);
    appendWorkout(workoutData as Workout);
    setIsWorkoutDialogOpen(false);
  };

  const handleEditWorkout = (index: number) => {
    setEditingWorkoutIndex(index);
    setIsEditDialogOpen(true);
  };

  const handleAddExercise = () => {
    if (editingWorkoutIndex === null) return;

    const workout = workouts[editingWorkoutIndex];
    if (!workout) return;

    const updatedWorkout = { ...workout };
    
    switch (workout.type) {
      case 'strength': {
        const typedWorkout = updatedWorkout as Extract<Workout, { type: 'strength' }>;
        typedWorkout.exercises = [
          ...typedWorkout.exercises || [],
          { name: '', weight: 0, reps: 0, sets: 0, restTime: 60 },
        ];
        break;
      }
      case 'amrap':
      case 'emom': {
        const typedWorkout = updatedWorkout as Extract<Workout, { type: 'amrap' | 'emom' }>;
        typedWorkout.exercises = [
          ...typedWorkout.exercises || [],
          { name: '', reps: 0 },
        ];
        break;
      }
    }

    updateWorkout(editingWorkoutIndex, updatedWorkout);
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    if (editingWorkoutIndex === null) return;

    const workout = workouts[editingWorkoutIndex];
    if (!workout) return;

    const updatedWorkout = { ...workout };
    if ('exercises' in updatedWorkout) {
      const exercises = [...updatedWorkout.exercises];
      exercises.splice(exerciseIndex, 1);
      updatedWorkout.exercises = exercises;
      updateWorkout(editingWorkoutIndex, updatedWorkout);
    }
  };

  const handleAddWeek = () => {
    const currentDuration = watch('duration');
    setValue('duration', currentDuration + 1);
  };

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

    if (!data.workouts?.length) {
      setSaveStatus({
        open: true,
        message: 'At least one workout is required',
        severity: 'error'
      });
      return;
    }

    try {
      // Ensure all workouts have names
      const validatedWorkouts = data.workouts.map(workout => ({
        ...workout,
        name: workout.name?.trim() || `${workout.type} Workout - Week ${workout.week} Day ${workout.day}`
      }));

      const updatedData = {
        ...data,
        workouts: validatedWorkouts
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
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' } }}>
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
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Program Type"
                  fullWidth
                >
                  <MenuItem value="hyrox">Hyrox</MenuItem>
                  <MenuItem value="triathlon">Triathlon</MenuItem>
                  <MenuItem value="crossfit">CrossFit</MenuItem>
                </TextField>
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

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Program Description"
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
            <Typography variant="h6">
              Workouts
            </Typography>
            <Button
              startIcon={<AddCircleIcon />}
              onClick={handleAddWeek}
              variant="outlined"
            >
              Add Week
            </Button>
          </Box>

          {Array.from({ length: programDuration }).map((_, weekIndex) => (
            <Accordion key={weekIndex}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Week {weekIndex + 1}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <Paper variant="outlined" sx={{ p: 2, width: '100%' }} key={dayIndex}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1">
                          Day {dayIndex + 1}
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() => {
                            setSelectedWeek(weekIndex + 1);
                            setSelectedDay(dayIndex + 1);
                            handleAddWorkout();
                          }}
                        >
                          Add Workout
                        </Button>
                      </Box>
                      {workouts
                        .filter(w => w.week === weekIndex + 1 && w.day === dayIndex + 1)
                        .map((workout) => {
                          const globalIndex = workouts.findIndex(w => w.id === workout.id);
                          return (
                            <Box 
                              key={workout.id} 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                bgcolor: 'background.paper',
                                p: 1,
                                mb: 1,
                                borderRadius: 1
                              }}
                            >
                              <Controller
                                name={`workouts.${globalIndex}.name`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    size="small"
                                    label="Workout Name"
                                    sx={{ mr: 2, flexGrow: 1 }}
                                  />
                                )}
                              />
                              <Typography sx={{ mx: 2, color: 'text.secondary' }}>
                                {workout.type.replace('-', ' ')}
                              </Typography>
                              <IconButton 
                                onClick={() => handleEditWorkout(globalIndex)}
                                size="small"
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                onClick={() => removeWorkout(globalIndex)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          );
                        })}
                    </Paper>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

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

      <Dialog open={isWorkoutDialogOpen} onClose={() => setIsWorkoutDialogOpen(false)}>
        <DialogTitle>Select Workout Type</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mt: 1 }}>
            {workoutTypes.map((type) => (
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleWorkoutSubmit(type)}
                sx={{ textTransform: 'capitalize' }}
                key={type}
              >
                {type.replace('-', ' ')}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsWorkoutDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Workout Details</DialogTitle>
        <DialogContent>
          {editingWorkoutIndex !== null && workouts[editingWorkoutIndex] && (
            <Box sx={{ mt: 2 }}>
              <WorkoutDetailsForm
                control={control}
                register={control.register}
                index={editingWorkoutIndex}
                workout={workouts[editingWorkoutIndex]}
                onRemoveExercise={handleRemoveExercise}
                onAddExercise={handleAddExercise}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>

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