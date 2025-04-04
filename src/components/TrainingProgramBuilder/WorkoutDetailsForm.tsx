import { Control, Controller, UseFormRegister } from 'react-hook-form';
import {
  Box,
  TextField,
  MenuItem,
  Grid as MuiGrid,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TrainingProgram, Workout, StrengthWorkout, AmrapWorkout, EmomWorkout } from '../types';

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
        <MuiGrid container spacing={2} key={exerciseIndex}>
          <MuiGrid item xs={12} sm={3}>
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
          </MuiGrid>
          <MuiGrid item xs={6} sm={2}>
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
          </MuiGrid>
          <MuiGrid item xs={6} sm={2}>
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
          </MuiGrid>
          <MuiGrid item xs={6} sm={2}>
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
          </MuiGrid>
          <MuiGrid item xs={6} sm={2}>
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
          </MuiGrid>
          <MuiGrid item xs={12} sm={1}>
            <IconButton
              onClick={() => onRemoveExercise?.(exerciseIndex)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </MuiGrid>
        </MuiGrid>
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
    <MuiGrid container spacing={2}>
      <MuiGrid item xs={12} sm={6}>
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
      </MuiGrid>
      <MuiGrid item xs={12} sm={6}>
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
      </MuiGrid>
      <MuiGrid item xs={12} sm={6}>
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
      </MuiGrid>
      <MuiGrid item xs={12} sm={6}>
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
      </MuiGrid>
    </MuiGrid>
  );

  const renderAmrapForm = () => (
    <Box>
      <MuiGrid container spacing={2} sx={{ mb: 2 }}>
        <MuiGrid item xs={12} sm={6}>
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
        </MuiGrid>
      </MuiGrid>
      <Typography variant="subtitle2" gutterBottom>Exercises</Typography>
      {workout.type === 'amrap' && (workout as AmrapWorkout).exercises?.map((_, exerciseIndex: number) => (
        <MuiGrid container spacing={2} key={exerciseIndex}>
          <MuiGrid item xs={12} sm={6}>
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
          </MuiGrid>
          <MuiGrid item xs={12} sm={5}>
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
          </MuiGrid>
          <MuiGrid item xs={12} sm={1}>
            <IconButton
              onClick={() => onRemoveExercise?.(exerciseIndex)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </MuiGrid>
        </MuiGrid>
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
      <MuiGrid container spacing={2} sx={{ mb: 2 }}>
        <MuiGrid item xs={12} sm={6}>
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
        </MuiGrid>
        <MuiGrid item xs={12} sm={6}>
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
        </MuiGrid>
      </MuiGrid>
      <Typography variant="subtitle2" gutterBottom>Exercises</Typography>
      {workout.type === 'emom' && (workout as EmomWorkout).exercises?.map((_, exerciseIndex: number) => (
        <MuiGrid container spacing={2} key={exerciseIndex}>
          <MuiGrid item xs={12} sm={6}>
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
          </MuiGrid>
          <MuiGrid item xs={12} sm={5}>
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
          </MuiGrid>
          <MuiGrid item xs={12} sm={1}>
            <IconButton
              onClick={() => onRemoveExercise?.(exerciseIndex)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </MuiGrid>
        </MuiGrid>
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