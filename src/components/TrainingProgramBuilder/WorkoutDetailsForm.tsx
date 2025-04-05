import { Control, Controller, UseFormRegister } from 'react-hook-form';
import {
  Box,
  TextField,
  MenuItem,
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
}

export const WorkoutDetailsForm = ({ control, index, workout, onRemoveExercise, onAddExercise }: Props) => {
  const renderStrengthForm = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Exercises</Typography>
      {workout.type === 'strength' && (workout as StrengthWorkout).exercises?.map((_, exerciseIndex: number) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }} key={exerciseIndex}>
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
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
        <Controller
          name={`workouts.${index}.distance`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Distance (km)"
              type="number"
              fullWidth
            />
          )}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
        <Controller
          name={`workouts.${index}.time`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Time (minutes)"
              type="number"
              fullWidth
            />
          )}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
        <Controller
          name={`workouts.${index}.pace`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Pace (min/km)"
              type="number"
              fullWidth
            />
          )}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
        <Controller
          name={`workouts.${index}.effortLevel`}
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Effort Level"
              fullWidth
            >
              {[1, 2, 3, 4, 5].map((level) => (
                <MenuItem key={level} value={level}>
                  Level {level}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Box>
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