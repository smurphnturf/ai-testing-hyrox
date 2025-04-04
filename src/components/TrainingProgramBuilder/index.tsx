import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Container,
  Grid as MuiGrid,
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
import { useState } from 'react';
import { TrainingProgram, Workout } from './types';
import WorkoutDetailsForm from './WorkoutDetailsForm';
import { trainingProgramsService } from '../../services/trainingPrograms';

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

export const TrainingProgramBuilder = () => {
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

  const { control, handleSubmit, watch } = useForm<TrainingProgram>({
    defaultValues: {
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

  const onSubmit = async (data: TrainingProgram) => {
    try {
      await trainingProgramsService.saveProgram(data);
      setSaveStatus({
        open: true,
        message: 'Program saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving program:', error);
      setSaveStatus({
        open: true,
        message: 'Failed to save program. Please try again.',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create Training Program
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <MuiGrid container spacing={3} component="div">
            <MuiGrid item xs={12} md={6} component="div">
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
            </MuiGrid>

            <MuiGrid item xs={12} md={3} component="div">
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
            </MuiGrid>

            <MuiGrid item xs={12} md={3} component="div">
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
            </MuiGrid>

            <MuiGrid item xs={12} component="div">
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
            </MuiGrid>
          </MuiGrid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Workouts
          </Typography>

          {Array.from({ length: programDuration }).map((_, weekIndex) => (
            <Accordion key={weekIndex}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Week {weekIndex + 1}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <MuiGrid container spacing={2} component="div">
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <MuiGrid item xs={12} key={dayIndex} component="div">
                      <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
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
                    </MuiGrid>
                  ))}
                </MuiGrid>
              </AccordionDetails>
            </Accordion>
          ))}

          <Button 
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Create Program
          </Button>
        </Box>
      </Paper>

      <Dialog open={isWorkoutDialogOpen} onClose={() => setIsWorkoutDialogOpen(false)}>
        <DialogTitle>Select Workout Type</DialogTitle>
        <DialogContent>
          <MuiGrid container spacing={2} sx={{ mt: 1 }} component="div">
            {workoutTypes.map((type) => (
              <MuiGrid item xs={12} sm={6} key={type} component="div">
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleWorkoutSubmit(type)}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {type.replace('-', ' ')}
                </Button>
              </MuiGrid>
            ))}
          </MuiGrid>
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