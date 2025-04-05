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
  date: Date; // Add date parameter
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
      date: date.toISOString(), // Add the date to the workout
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
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Exercises
        </Typography>
        {formData.exercises.map((exercise, index) => (
          <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
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
              />
            </Box>
            <Box flex={1} display="flex" alignItems="center" justifyContent="center">
              <IconButton
                onClick={() => handleRemoveExercise(index)}
                color="error"
                size="small"
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
        >
          Add Exercise
        </Button>
      </Box>
    );
  };

  const renderRunningFields = () => (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField
        label="Distance (km)"
        type="number"
        value={formData.distance}
        onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
        fullWidth
      />
      <TextField
        label="Time (minutes)"
        type="number"
        value={formData.time}
        onChange={(e) => setFormData({ ...formData, time: Number(e.target.value) })}
        fullWidth
      />
      <TextField
        label="Pace (min/km)"
        type="number"
        value={formData.pace}
        onChange={(e) => setFormData({ ...formData, pace: Number(e.target.value) })}
        fullWidth
      />
      <TextField
        select
        label="Effort Level"
        value={formData.effortLevel}
        onChange={(e) => setFormData({ ...formData, effortLevel: Number(e.target.value) })}
        fullWidth
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
    <Box sx={{ mt: 1 }}>
      <TextField
        label="Time Limit (minutes)"
        type="number"
        value={formData.timeLimit}
        onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
        fullWidth
        sx={{ mb: 2 }}
      />
      {renderExerciseFields()}
    </Box>
  );

  const renderEmomFields = () => (
    <Box sx={{ mt: 1 }}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Round Time (seconds)"
          type="number"
          value={formData.roundTime}
          onChange={(e) => setFormData({ ...formData, roundTime: Number(e.target.value) })}
          fullWidth
        />
        <TextField
          label="Total Time (minutes)"
          type="number"
          value={formData.totalTime}
          onChange={(e) => setFormData({ ...formData, totalTime: Number(e.target.value) })}
          fullWidth
        />
      </Stack>
      {renderExerciseFields()}
    </Box>
  );

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            label="Workout Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <TextField
            select
            label="Workout Type"
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as typeof workoutTypes[number])}
            fullWidth
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
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save Workout
        </Button>
      </DialogActions>
    </>
  );
}

export default QuickWorkoutForm;