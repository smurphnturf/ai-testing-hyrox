import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  IconButton,
  DialogActions,
  DialogContent,
  Typography,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Workout, Exercise, StrengthExercise } from '../TrainingProgramBuilder/types';

const workoutTypes = [
  'strength',
  'running',
  'compromised-run',
  'amrap',
  'emom',
  'recovery',
] as const;

interface Props {
  week: number;
  day: number;
  date: Date;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

interface WorkoutFormState {
  name: string;
  type: typeof workoutTypes[number];
  exercises?: (Exercise | StrengthExercise)[];
  distance?: number;
  time?: number;
  pace?: number;
  effortLevel?: number;
  timeLimit?: number;
  roundTime?: number;
  totalTime?: number;
}

export function QuickWorkoutForm({ week, day, date, onSave, onCancel }: Props) {
  const [formData, setFormData] = useState<WorkoutFormState>({
    name: '',
    type: 'strength',
    exercises: [{ name: '', weight: 0, reps: 0, sets: 0, restTime: 60 }],
  });

  const handleTypeChange = (type: typeof workoutTypes[number]) => {
    const newFormData: WorkoutFormState = {
      ...formData,
      type,
    };

    // Reset form based on type
    switch (type) {
      case 'strength':
        newFormData.exercises = [{ name: '', weight: 0, reps: 0, sets: 0, restTime: 60 }];
        break;
      case 'running':
        newFormData.distance = 0;
        newFormData.time = 0;
        newFormData.pace = 0;
        newFormData.effortLevel = 3;
        delete newFormData.exercises;
        break;
      case 'amrap':
        newFormData.timeLimit = 20;
        newFormData.exercises = [{ name: '', reps: 0 }];
        break;
      case 'emom':
        newFormData.roundTime = 60;
        newFormData.totalTime = 20;
        newFormData.exercises = [{ name: '', reps: 0 }];
        break;
    }

    setFormData(newFormData);
  };

  const handleSubmit = () => {
    const workoutData: Workout = {
      id: crypto.randomUUID(),
      name: formData.name || `${formData.type} Workout`,
      type: formData.type,
      week,
      day,
      date: date.toISOString(),
      ...(formData.type === 'strength' && {
        exercises: formData.exercises as StrengthExercise[],
      }),
      ...(formData.type === 'running' && {
        distance: formData.distance!,
        time: formData.time!,
        pace: formData.pace!,
        effortLevel: formData.effortLevel!,
      }),
      ...(formData.type === 'amrap' && {
        timeLimit: formData.timeLimit!,
        exercises: formData.exercises as Exercise[],
      }),
      ...(formData.type === 'emom' && {
        roundTime: formData.roundTime!,
        totalTime: formData.totalTime!,
        exercises: formData.exercises as Exercise[],
      }),
    } as Workout;

    onSave(workoutData);
  };

  const handleAddExercise = () => {
    if (!formData.exercises) return;

    const newExercise = formData.type === 'strength'
      ? { name: '', weight: 0, reps: 0, sets: 0, restTime: 60 }
      : { name: '', reps: 0 };

    setFormData({
      ...formData,
      exercises: [...formData.exercises, newExercise],
    });
  };

  const handleRemoveExercise = (index: number) => {
    if (!formData.exercises) return;

    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index),
    });
  };

  const renderExerciseFields = () => {
    if (!formData.exercises) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography 
          variant="subtitle2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 2
          }}
        >
          Exercises
        </Typography>
        {formData.exercises.map((exercise, index) => (
          <Stack 
            key={index} 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ 
              mb: 2,
              p: 2,
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              position: 'relative'
            }}
          >
            <Box flex={formData.type === 'strength' ? 3 : 6}>
              <TextField
                label="Exercise Name"
                value={exercise.name}
                onChange={(e) => {
                  const newExercises = [...formData.exercises!];
                  newExercises[index] = { ...exercise, name: e.target.value };
                  setFormData({ ...formData, exercises: newExercises });
                }}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: 1.5,
                  }
                }}
              />
            </Box>
            {formData.type === 'strength' ? (
              <>
                <Box flex={2}>
                  <TextField
                    label="Weight (kg)"
                    type="number"
                    value={(exercise as StrengthExercise).weight}
                    onChange={(e) => {
                      const newExercises = [...formData.exercises!];
                      newExercises[index] = { 
                        ...exercise, 
                        weight: Number(e.target.value) 
                      } as StrengthExercise;
                      setFormData({ ...formData, exercises: newExercises });
                    }}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 1.5,
                      }
                    }}
                  />
                </Box>
                <Box flex={2}>
                  <TextField
                    label="Sets"
                    type="number"
                    value={(exercise as StrengthExercise).sets}
                    onChange={(e) => {
                      const newExercises = [...formData.exercises!];
                      newExercises[index] = { 
                        ...exercise, 
                        sets: Number(e.target.value) 
                      } as StrengthExercise;
                      setFormData({ ...formData, exercises: newExercises });
                    }}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 1.5,
                      }
                    }}
                  />
                </Box>
              </>
            ) : null}
            <Box flex={formData.type === 'strength' ? 2 : 5}>
              <TextField
                label="Reps"
                type="number"
                value={exercise.reps}
                onChange={(e) => {
                  const newExercises = [...formData.exercises!];
                  newExercises[index] = { ...exercise, reps: Number(e.target.value) };
                  setFormData({ ...formData, exercises: newExercises });
                }}
                fullWidth
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                    borderRadius: 1.5,
                  }
                }}
              />
            </Box>
            <Box 
              flex={1} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              sx={{
                position: { xs: 'absolute', sm: 'static' },
                right: { xs: 8, sm: 'auto' },
                top: { xs: 8, sm: 'auto' },
              }}
            >
              <IconButton
                onClick={() => handleRemoveExercise(index)}
                color="error"
                size="small"
                sx={{
                  backgroundColor: 'rgba(211,47,47,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(211,47,47,0.2)',
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Stack>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddExercise}
          variant="outlined"
          size="small"
          sx={{ 
            mt: 1,
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Add Exercise
        </Button>
      </Box>
    );
  };

  const renderRunningFields = () => (
    <Stack spacing={2.5} sx={{ mt: 3 }}>
      <TextField
        label="Distance (km)"
        type="number"
        value={formData.distance}
        onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
          }
        }}
      />
      <TextField
        label="Time (minutes)"
        type="number"
        value={formData.time}
        onChange={(e) => setFormData({ ...formData, time: Number(e.target.value) })}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
          }
        }}
      />
      <TextField
        label="Pace (min/km)"
        type="number"
        value={formData.pace}
        onChange={(e) => setFormData({ ...formData, pace: Number(e.target.value) })}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
          }
        }}
      />
      <TextField
        select
        label="Effort Level"
        value={formData.effortLevel}
        onChange={(e) => setFormData({ ...formData, effortLevel: Number(e.target.value) })}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
          }
        }}
      >
        {[1, 2, 3, 4, 5].map((level) => (
          <MenuItem key={level} value={level}>
            Level {level}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );

  const renderAmrapFields = () => (
    <Box sx={{ mt: 3 }}>
      <TextField
        label="Time Limit (minutes)"
        type="number"
        value={formData.timeLimit}
        onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
        fullWidth
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
          }
        }}
      />
      {renderExerciseFields()}
    </Box>
  );

  const renderEmomFields = () => (
    <Box sx={{ mt: 3 }}>
      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <TextField
          label="Round Time (seconds)"
          type="number"
          value={formData.roundTime}
          onChange={(e) => setFormData({ ...formData, roundTime: Number(e.target.value) })}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
            }
          }}
        />
        <TextField
          label="Total Time (minutes)"
          type="number"
          value={formData.totalTime}
          onChange={(e) => setFormData({ ...formData, totalTime: Number(e.target.value) })}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
            }
          }}
        />
      </Stack>
      {renderExerciseFields()}
    </Box>
  );

  return (
    <>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <TextField
            label="Workout Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              }
            }}
          />
          <TextField
            select
            label="Workout Type"
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as typeof workoutTypes[number])}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              }
            }}
          >
            {workoutTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type.replace('-', ' ')}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {formData.type === 'strength' && renderExerciseFields()}
        {formData.type === 'running' && renderRunningFields()}
        {formData.type === 'amrap' && renderAmrapFields()}
        {formData.type === 'emom' && renderEmomFields()}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onCancel}
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary'
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ 
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(62,207,142,0.2)'
            }
          }}
        >
          Save Workout
        </Button>
      </DialogActions>
    </>
  );
}

export default QuickWorkoutForm;