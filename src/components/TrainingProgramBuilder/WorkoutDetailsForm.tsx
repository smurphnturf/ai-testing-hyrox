import { Control, Controller, UseFormRegister } from 'react-hook-form';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TrainingProgram, Workout, StrengthWorkout, AmrapWorkout, EmomWorkout } from './types';

interface Props {
  control: Control<TrainingProgram>;
  register: UseFormRegister<TrainingProgram>;
  index: number;
  workout: Workout;
  onRemoveExercise?: (exerciseIndex: number) => void;
  onAddExercise?: () => void;
  result?: import('./types').WorkoutResult;
}

export const WorkoutDetailsForm = ({ control, index, workout, onRemoveExercise, onAddExercise, result }: Props) => {
  const renderStrengthForm = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Exercises</Typography>
      {workout.type === 'strength' && (workout as StrengthWorkout).exercises?.map((_, exerciseIndex: number) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }} key={exerciseIndex}>
          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <Controller
              name={`workouts.${index}.exercises.${exerciseIndex}.name`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Exercise"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '50%', sm: '16.66%' } }}>
            <Controller
              name={`workouts.${index}.exercises.${exerciseIndex}.weight`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Weight (kg)"
                  type="number"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '50%', sm: '16.66%' } }}>
            <Controller
              name={`workouts.${index}.exercises.${exerciseIndex}.reps`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Reps"
                  type="number"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '50%', sm: '16.66%' } }}>
            <Controller
              name={`workouts.${index}.exercises.${exerciseIndex}.sets`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sets"
                  type="number"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '50%', sm: '16.66%' } }}>
            <Controller
              name={`workouts.${index}.exercises.${exerciseIndex}.restTime`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Rest (sec)"
                  type="number"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '8.33%' } }}>
            <IconButton
              onClick={() => onRemoveExercise?.(exerciseIndex)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
          {/* Show result values if present */}
          {result?.segments?.[exerciseIndex] && (
            <Box sx={{ ml: 2 }}>
              <Typography variant="caption" color="success.main">
                Result: {result.segments[exerciseIndex].sets} sets, {result.segments[exerciseIndex].reps} reps, {result.segments[exerciseIndex].weight}kg
              </Typography>
            </Box>
          )}
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={onAddExercise}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        Add Exercise
      </Button>
    </Box>
  );

  const renderRunningForm = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Running Segments</Typography>
      {workout.type === 'running' && workout.runningSegments?.map((_, segmentIndex: number) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }} key={segmentIndex}>
          <Box sx={{ width: { xs: '100%', sm: '25%' } }}>
            <Controller
              name={`workouts.${index}.runningSegments.${segmentIndex}.distance`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Distance (km)"
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(',', '.');
                    if (/^\d*\.?\d*$/.test(value) || value === '') {
                      field.onChange(value ? parseFloat(value) : null);
                    }
                  }}
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '50%', sm: '25%' } }}>
            <Controller
              name={`workouts.${index}.runningSegments.${segmentIndex}.time`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Time (minutes)"
                  type="number"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '50%', sm: '25%' } }}>
            <Controller
              name={`workouts.${index}.runningSegments.${segmentIndex}.pace`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Pace (min/km)"
                  type="number"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '8.33%' } }}>
            <IconButton
              onClick={() => onRemoveExercise?.(segmentIndex)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
          {result?.segments?.[segmentIndex] && (
            <Box sx={{ ml: 2 }}>
              <Typography variant="caption" color="success.main">
                Result: {result.segments[segmentIndex].distance}km, {result.segments[segmentIndex].time}min, {result.segments[segmentIndex].pace}min/km
              </Typography>
            </Box>
          )}
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={onAddExercise}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        Add Segment
      </Button>
    </Box>
  );

  const renderAmrapForm = () => (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
          <Controller
            name={`workouts.${index}.timeLimit`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Time Limit (minutes)"
                type="number"
                fullWidth
              />
            )}
          />
        </Box>
      </Box>
      <Typography variant="subtitle2" gutterBottom>Exercises</Typography>
      {workout.type === 'amrap' && (workout as AmrapWorkout).exercises?.map((_, exerciseIndex: number) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }} key={exerciseIndex}>
          <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
            <Controller
              name={`workouts.${index}.exercises.${exerciseIndex}.name`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Exercise"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '41.66%' } }}>
            <Controller
              name={`workouts.${index}.exercises.${exerciseIndex}.reps`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Reps"
                  type="number"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '8.33%' } }}>
            <IconButton
              onClick={() => onRemoveExercise?.(exerciseIndex)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={onAddExercise}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        Add Exercise
      </Button>
    </Box>
  );

  const renderEmomForm = () => (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
          <Controller
            name={`workouts.${index}.roundTime`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Round Time (seconds)"
                type="number"
                fullWidth
              />
            )}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
          <Controller
            name={`workouts.${index}.totalTime`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Total Time (minutes)"
                type="number"
                fullWidth
              />
            )}
          />
        </Box>
      </Box>
      <Typography variant="subtitle2" gutterBottom>Exercises</Typography>
      {workout.type === 'emom' && (workout as EmomWorkout).exercises?.map((_, exerciseIndex: number) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }} key={exerciseIndex}>
          <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
            <Controller
              name={`workouts.${index}.exercises.${exerciseIndex}.name`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Exercise"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '41.66%' } }}>
            <Controller
              name={`workouts.${index}.exercises.${exerciseIndex}.reps`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Reps"
                  type="number"
                  size="small"
                  fullWidth
                />
              )}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '8.33%' } }}>
            <IconButton
              onClick={() => onRemoveExercise?.(exerciseIndex)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={onAddExercise}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        Add Exercise
      </Button>
    </Box>
  );

  switch (workout.type) {
    case 'strength':
      return renderStrengthForm();
    case 'running':
      return renderRunningForm();
    case 'amrap':
      return renderAmrapForm();
    case 'emom':
      return renderEmomForm();
    default:
      return (
        <Typography color="text.secondary">
          Detailed form for {workout.type} workouts coming soon...
        </Typography>
      );
  }
};

export default WorkoutDetailsForm;