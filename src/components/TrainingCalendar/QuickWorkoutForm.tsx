import React, { useState } from 'react';
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
  Menu,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  Workout, 
  Exercise, 
  StrengthExercise, 
  RunningSegment
} from '../TrainingProgramBuilder/types';

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
  initialWorkout?: Workout;
}

interface WorkoutFormState {
  name: string;
  type: typeof workoutTypes[number];
  exercises?: (FormExercise | FormStrengthExercise)[];
  segments?: (FormStrengthExercise | FormRunningSegment)[];
  runningSegments?: FormRunningSegment[];
  distance?: number | null;
  time?: number | null;
  pace?: number | null;
  effortLevel?: number;
  timeLimit?: number | null;
  roundTime?: number | null;
  totalTime?: number | null;
}

interface FormStrengthExercise extends Omit<StrengthExercise, 'weight' | 'reps' | 'sets'> {
  weight: number | null;
  reps: number | null;
  sets: number | null;
}

interface FormRunningSegment extends Omit<RunningSegment, 'distance' | 'time' | 'pace'> {
  distance: string | number | null;
  time: number | null;
  pace: number | null;
}

interface FormExercise extends Omit<Exercise, 'reps'> {
  reps: number | null;
}

export function QuickWorkoutForm({ week, day, date, onSave, onCancel, initialWorkout }: Props) {
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState<WorkoutFormState>(() => {
    if (initialWorkout) {
      return {
        name: initialWorkout.name,
        type: initialWorkout.type,
        ...(initialWorkout.type === 'strength' && {
          exercises: initialWorkout.exercises.map(e => ({
            ...e,
            weight: e.weight,
            reps: e.reps,
            sets: (e as StrengthExercise).sets
          }))
        }),
        ...(initialWorkout.type === 'running' && {
          runningSegments: initialWorkout.runningSegments.map(s => ({
            ...s,
            distance: s.distance,
            time: s.time,
            pace: s.pace
          })),
        }),
        ...(initialWorkout.type === 'compromised-run' && {
          segments: initialWorkout.segments.map(segment => {
            if ('distance' in segment) {
              return {
                ...segment,
                type: 'running',
                distance: segment.distance,
                time: segment.time,
                pace: segment.pace
              } as FormRunningSegment;
            } else {
              return {
                ...segment,
                type: 'strength',
                weight: segment.weight,
                reps: segment.reps,
                sets: segment.sets,
                restTime: segment.restTime
              } as FormStrengthExercise;
            }
          })
        }),
        ...(initialWorkout.type === 'amrap' && {
          timeLimit: initialWorkout.timeLimit,
          exercises: initialWorkout.exercises.map(e => ({
            ...e,
            reps: e.reps
          })),
        }),
        ...(initialWorkout.type === 'emom' && {
          roundTime: initialWorkout.roundTime,
          totalTime: initialWorkout.totalTime,
          exercises: initialWorkout.exercises.map(e => ({
            ...e,
            reps: e.reps
          })),
        }),
      };
    }
    
    return {
      name: '',
      type: 'strength',
      exercises: [{ name: '', weight: null, reps: null, sets: null, restTime: 60 }] as FormStrengthExercise[],
    };
  });

  const handleTypeChange = (type: typeof workoutTypes[number]) => {
    const newFormData: WorkoutFormState = {
      ...formData,
      type,
    };

    // Reset form based on type
    switch (type) {
      case 'strength':
        newFormData.exercises = [{ name: '', weight: null, reps: null, sets: null, restTime: 60 }] as FormStrengthExercise[];
        delete newFormData.segments;
        break;
      case 'running':
        newFormData.runningSegments = [{
          distance: null,
          time: null,
          pace: null
        }] as FormRunningSegment[];
        delete newFormData.segments;
        break;
      case 'compromised-run':
        newFormData.segments = [];
        delete newFormData.exercises;
        break;
      case 'amrap':
        newFormData.timeLimit = null;
        newFormData.exercises = [{ name: '', reps: null }] as FormExercise[];
        delete newFormData.segments;
        break;
      case 'emom':
        newFormData.roundTime = null;
        newFormData.totalTime = null;
        newFormData.exercises = [{ name: '', reps: null }] as FormExercise[];
        delete newFormData.segments;
        break;
    }

    setFormData(newFormData);
  };

  const handleSubmit = () => {
    try {
      const workoutData: Workout = {
        id: initialWorkout?.id || crypto.randomUUID(),
        name: formData.name || `${formData.type} Workout`,
        type: formData.type,
        week,
        day,
        date: date.toISOString(),
        ...(formData.type === 'strength' && {
          exercises: (formData.exercises as FormStrengthExercise[]).map(e => ({
            name: e.name,
            weight: e.weight || 0,
            reps: e.reps || 0,
            sets: e.sets || 0,
            restTime: e.restTime
          })),
        }),
        ...(formData.type === 'running' && {
          runningSegments: (formData.runningSegments || []).map(s => ({
            distance: s.distance || 0,
            time: s.time || 0,
            pace: s.pace || 0,
          })),
        }),
        ...(formData.type === 'compromised-run' && {
          segments: (formData.segments as (FormStrengthExercise | FormRunningSegment)[]).map(segment => {
            if ('distance' in segment) {
              return {
                type: 'running',
                distance: segment.distance || 0,
                time: segment.time || 0,
                pace: segment.pace || 0,
              };
            } else {
              return {
                type: 'strength',
                name: segment.name,
                weight: segment.weight || 0,
                reps: segment.reps || 0,
                sets: segment.sets || 0,
                restTime: segment.restTime
              };
            }
          }),
        }),
        ...(formData.type === 'amrap' && {
          timeLimit: formData.timeLimit || 0,
          exercises: (formData.exercises as FormExercise[]).map(e => ({
            name: e.name,
            reps: e.reps || 0
          })),
        }),
        ...(formData.type === 'emom' && {
          roundTime: formData.roundTime || 0,
          totalTime: formData.totalTime || 0,
          exercises: (formData.exercises as FormExercise[]).map(e => ({
            name: e.name,
            reps: e.reps || 0
          })),
        }),
      } as Workout;

      console.log('Submitting workout:', workoutData);
      onSave(workoutData);
    } catch (err) {
      console.error('Error creating workout:', err);
      console.error('Form data state:', formData);
    }
  };

  const handleAddClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddClose = () => {
    setAddMenuAnchor(null);
  };

  const handleAddStrengthSegment = () => {
    const newSegments = [...(formData.segments || [])];
    newSegments.push({
      name: '',
      weight: null,
      reps: null,
      sets: null,
      restTime: 60
    } as FormStrengthExercise);
    setFormData({ ...formData, segments: newSegments });
    handleAddClose();
  };

  const handleAddRunningSegment = () => {
    if (formData.type === 'running') {
      const newRunningSegments = [...(formData.runningSegments || [])];
      newRunningSegments.push({
        distance: null,
        time: null,
        pace: null
      } as FormRunningSegment);
      setFormData({ ...formData, runningSegments: newRunningSegments });
    } else if (formData.type === 'compromised-run') {
      const newSegments = [...(formData.segments || [])];
      newSegments.push({
        type: 'running',
        distance: null,
        time: null,
        pace: null
      } as FormRunningSegment);
      setFormData({ ...formData, segments: newSegments });
    }
    handleAddClose(); // Close the menu after adding
  };

  const handleUpdateRunningSegment = (index: number, field: keyof FormRunningSegment, value: string | number | null) => {
    const newSegments = [...formData.runningSegments!];
    const segment = newSegments[index] as FormRunningSegment;
    const updatedSegment = { ...segment };
    if (typeof value === 'string') {
      console.log('value is string run:', value);
      value = parseFloat(value);
    }
    updatedSegment[field] = value;

    // Auto-calculate logic same as renderRunningSegmentFields
    if (field !== 'distance' && updatedSegment.distance !== null) {
      if (field === 'time' && value !== null) {
        updatedSegment.pace = updatedSegment.distance ? value / Number(updatedSegment.distance) : null;
      } else if (field === 'pace' && value !== null) {
        updatedSegment.time = Number(updatedSegment.distance) * value;
      }
    } else if (field !== 'time' && updatedSegment.time !== null) {
      if (field === 'distance' && value !== null) {
        updatedSegment.pace = updatedSegment.time / value;
      } else if (field === 'pace' && value !== null) {
        updatedSegment.distance = updatedSegment.time / value;
      }
    } else if (field !== 'pace' && updatedSegment.pace !== null) {
      if (field === 'distance' && value !== null) {
        updatedSegment.time = value * updatedSegment.pace;
      } else if (field === 'time' && value !== null) {
        updatedSegment.distance = value / updatedSegment.pace;
      }
    }

    newSegments[index] = updatedSegment;
    setFormData({ ...formData, runningSegments: newSegments });
  };

  const handleUpdateCompromisedRunningSegment = (index: number, field: keyof FormRunningSegment, value: string | number | null) => {
    const newSegments = [...formData.segments!];
    const segment = { ...newSegments[index] } as FormRunningSegment;

    // Special handling for distance field when it contains a decimal point
    if (field === 'distance' && typeof value === 'string') {
      if (value === '' || value.endsWith('.') || /^\d*\.?\d*$/.test(value)) {
        newSegments[index] = { ...segment, distance: value };
        setFormData({ ...formData, segments: newSegments });
        return;
      }
      value = parseFloat(value);
    } else if (typeof value === 'string') {
      value = parseFloat(value);
    }

    // Only proceed with calculations if we have a numeric value
    if (typeof value === 'number' || value === null) {
      (segment as any)[field] = value;

      if (field !== 'distance' && segment.distance !== null) {
        if (field === 'time' && value !== null) {
          segment.pace = value / (typeof segment.distance === 'string' ? parseFloat(segment.distance) : segment.distance);
        } else if (field === 'pace' && value !== null) {
          segment.time = (typeof segment.distance === 'string' ? parseFloat(segment.distance) : segment.distance) * value;
        }
      } else if (field !== 'time' && segment.time !== null) {
        if (field === 'distance' && value !== null) {
          segment.pace = segment.time / value;
        } else if (field === 'pace' && value !== null) {
          segment.distance = segment.time / value;
        }
      } else if (field !== 'pace' && segment.pace !== null) {
        if (field === 'distance' && value !== null) {
          segment.time = value * segment.pace;
        } else if (field === 'time' && value !== null) {
          segment.distance = value / segment.pace;
        }
      }

      newSegments[index] = segment;
      setFormData({ ...formData, segments: newSegments });
    }
  };

  const handleRemoveRunningSegment = (index: number) => {
    const newSegments = [...formData.runningSegments!];
    newSegments.splice(index, 1);
    setFormData({ ...formData, runningSegments: newSegments });
  };

  const handleUpdateStrengthSegment = (
    index: number, 
    field: keyof FormStrengthExercise, 
    value: string | number | null
  ) => {
    const newSegments = [...formData.segments!];
    const segment = { ...newSegments[index] } as FormStrengthExercise;
    if (typeof value === 'string' && field === 'name') {
      segment.name = value;
    } else if ((typeof value === 'number' || value === null) && field !== 'name') {
      if (field === 'weight') segment.weight = value;
      else if (field === 'reps') segment.reps = value;
      else if (field === 'sets') segment.sets = value;
      else if (field === 'restTime') segment.restTime = value ?? 60;
    }
    newSegments[index] = segment;
    setFormData({ ...formData, segments: newSegments });
  };

  const handleRemoveSegment = (index: number) => {
    const newSegments = [...formData.segments!];
    newSegments.splice(index, 1);
    setFormData({ ...formData, segments: newSegments });
  };

  const renderExerciseFields = () => (
    <Box sx={{ mt: 3 }}>
      <Typography 
        variant="subtitle1" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: 'text.primary',
          mb: 2
        }}
      >
        Exercises
      </Typography>
      {formData.exercises?.map((exercise, index) => (
        <Stack 
          key={index} 
          spacing={2} 
          sx={{ 
            mb: 3,
            p: 2,
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 2
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box flex={3}>
              <TextField
                label="Exercise Name"
                value={exercise.name}
                onChange={(e) => {
                  const newExercises = [...formData.exercises!];
                  newExercises[index] = { ...newExercises[index], name: e.target.value };
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
                    type="tel"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*"
                    }}
                    value={(exercise as FormStrengthExercise).weight || ''}
                    placeholder="0"
                    onChange={(e) => {
                      const newExercises = [...formData.exercises!];
                      newExercises[index] = { ...newExercises[index], weight: e.target.value ? Number(e.target.value) : null };
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
                    type="tel"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*"
                    }}
                    value={(exercise as FormStrengthExercise).sets || ''}
                    placeholder="0"
                    onChange={(e) => {
                      const newExercises = [...formData.exercises!];
                      newExercises[index] = { ...newExercises[index], sets: e.target.value ? Number(e.target.value) : null };
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
            <Box flex={2}>
              <TextField
                label="Reps"
                type="tel"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*"
                }}
                value={exercise.reps || ''}
                placeholder="0"
                onChange={(e) => {
                  const newExercises = [...formData.exercises!];
                  newExercises[index] = { ...newExercises[index], reps: e.target.value ? Number(e.target.value) : null };
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
          </Stack>
          <Box 
            display="flex" 
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 1 }}
          >
            <IconButton
              onClick={() => {
                const newExercises = [...formData.exercises!];
                newExercises.splice(index, 1);
                setFormData({ ...formData, exercises: newExercises });
              }}
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
        onClick={() => {
          if (!formData.exercises) return;
          const newExercise = formData.type === 'strength'
            ? { name: '', weight: null, reps: null, sets: null, restTime: 60 }
            : { name: '', reps: null };
          setFormData({
            ...formData,
            exercises: [...formData.exercises, newExercise],
          });
        }}
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

  const renderRunningSegmentFields = (
    segment: FormRunningSegment,
    index: number,
    onUpdate: (field: keyof FormRunningSegment, value: string | number | null) => void,
    onDelete: () => void
  ) => {
    const timeToMinutesSeconds = (time: number | null) => {
      if (time === null) return { minutes: '', seconds: '' };
      const minutes = Math.floor(time);
      const seconds = Math.round((time - minutes) * 60);
      return { minutes: minutes.toString(), seconds: seconds.toString().padStart(2, '0') };
    };

    const minutesSecondsToTime = (minutes: string, seconds: string) => {
      const mins = minutes ? parseFloat(minutes) : 0;
      const secs = seconds ? parseFloat(seconds) : 0;
      return mins + (secs / 60);
    };

    const { minutes: timeMinutes, seconds: timeSeconds } = timeToMinutesSeconds(segment.time);
    const { minutes: paceMinutes, seconds: paceSeconds } = timeToMinutesSeconds(segment.pace);

    return (
      <Stack 
        spacing={2.5} 
        sx={{ 
          mb: 3,
          p: 2,
          backgroundColor: 'rgba(0,0,0,0.02)',
          borderRadius: 2
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Running Segment {index + 1}
        </Typography>
        <TextField
          label="Distance (km)"
          value={segment.distance}
          placeholder="0.0"
          onChange={(e) => {
            console.log('Distance changed:', e.target.value);
            const value = e.target.value.replace(',', '.');
            // Only allow numbers and one decimal point
            if (/^\d*\.?\d*$/.test(value) || value === '') {
              if (value.endsWith('.')) {
                console.log('distance is value:', value);
                onUpdate('distance', value);
              } else {
                const numValue = value ? parseFloat(value) : null;
                console.log('distance is numvalue:', numValue);
                onUpdate('distance', numValue);
                // Auto-calculate pace if time is available
                if (numValue !== null && segment.time !== null) {
                  console.log('pace is numvalue:', segment.time / numValue);
                  onUpdate('pace', segment.time / numValue);
                }
              }
            }
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
        <Typography variant="subtitle2" gutterBottom>
          Time
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            label="Minutes"
            type="tel"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*"
            }}
            value={timeMinutes}
            placeholder="0"
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              const newTime = minutesSecondsToTime(value, timeSeconds);
              onUpdate('time', newTime);
              
              // Auto-calculate pace if distance is available
              if (segment.distance !== null) {
                onUpdate('pace', newTime / Number(segment.distance));
              }
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
          <TextField
            label="Seconds"
            type="tel"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*"
            }}
            value={timeSeconds}
            placeholder="00"
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                const newTime = minutesSecondsToTime(timeMinutes, value);
                onUpdate('time', newTime);
                
                // Auto-calculate pace if distance is available
                if (segment.distance !== null) {
                  onUpdate('pace', newTime / Number(segment.distance));
                }
              }
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
        </Stack>
        <Typography variant="subtitle2" gutterBottom>
          Pace (min/km)
        </Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            label="Minutes"
            type="tel"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*"
            }}
            value={paceMinutes}
            placeholder="0"
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              const newPace = minutesSecondsToTime(value, paceSeconds);
              onUpdate('pace', newPace);
              
              // Auto-calculate time if distance is available
              if (segment.distance !== null) {
                onUpdate('time', Number(segment.distance) * newPace);
              }
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
          <TextField
            label="Seconds"
            type="tel"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*"
            }}
            value={paceSeconds}
            placeholder="00"
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                const newPace = minutesSecondsToTime(paceMinutes, value);
                onUpdate('pace', newPace);
                
                // Auto-calculate time if distance is available
                if (segment.distance !== null) {
                  onUpdate('time', Number(segment.distance) * newPace);
                }
              }
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
        </Stack>
        <Box 
          display="flex" 
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 1 }}
        >
          <IconButton
            onClick={onDelete}
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
    );
  };

  const renderRunningFields = () => (
    <Box sx={{ mt: 3 }}>
      <Typography 
        variant="subtitle1" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: 'text.primary',
          mb: 2
        }}
      >
        Running Segments
      </Typography>
      {formData.runningSegments?.map((segment, index) => (
        <React.Fragment key={`segment-${index}`}>
          {renderRunningSegmentFields(
            segment,
            index,
            (field, value) => handleUpdateRunningSegment(index, field, typeof value === 'number' ? value : null),
            () => handleRemoveRunningSegment(index)
          )}
        </React.Fragment>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddRunningSegment}
        variant="outlined"
        size="small"
        sx={{ 
          mt: 1,
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        Add Running Segment
      </Button>
    </Box>
  );

  const renderAmrapFields = () => (
    <Box sx={{ mt: 3 }}>
      <TextField
        label="Time Limit (minutes)"
        type="tel"
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*"
        }}
        value={formData.timeLimit || ''}
        placeholder="0"
        onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value ? Number(e.target.value) : null })}
        fullWidth
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'text.disabled',
            opacity: 0.7
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
          type="tel"
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*"
          }}
          value={formData.roundTime || ''}
          placeholder="0"
          onChange={(e) => setFormData({ ...formData, roundTime: e.target.value ? Number(e.target.value) : null })}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'text.disabled',
              opacity: 0.7
            }
          }}
        />
        <TextField
          label="Total Time (minutes)"
          type="tel"
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*"
          }}
          value={formData.totalTime || ''}
          placeholder="0"
          onChange={(e) => setFormData({ ...formData, totalTime: e.target.value ? Number(e.target.value) : null })}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'text.disabled',
              opacity: 0.7
            }
          }}
        />
      </Stack>
      {renderExerciseFields()}
    </Box>
  );

  const renderCompromisedRunFields = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Add Segment
          </Button>
          <Menu
            anchorEl={addMenuAnchor}
            open={Boolean(addMenuAnchor)}
            onClose={handleAddClose}
          >
            <MenuItem onClick={handleAddStrengthSegment}>
              Add Strength Exercise
            </MenuItem>
            <MenuItem onClick={handleAddRunningSegment}>
              Add Running Segment
            </MenuItem>
          </Menu>
        </Stack>

        {formData.segments?.map((segment, index) => {
          const isRunningSegment = 'distance' in segment;
          
          return (
            <Stack 
              key={index} 
              spacing={2} 
              sx={{ 
                mb: 3,
                p: 2,
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderRadius: 2
              }}
            >
              {isRunningSegment ? (
                renderRunningSegmentFields(
                  segment as FormRunningSegment,
                  index,
                  (field, value) => handleUpdateCompromisedRunningSegment(index, field, value),
                  () => handleRemoveRunningSegment(index)
                )
              ) : (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Strength Exercise {index + 1}
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box flex={3}>
                      <TextField
                        label="Exercise Name"
                        value={(segment as FormStrengthExercise).name}
                        onChange={(e) => handleUpdateStrengthSegment(index, 'name', e.target.value)}
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
                        label="Weight (kg)"
                        type="tel"
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*"
                        }}
                        value={(segment as FormStrengthExercise).weight || ''}
                        placeholder="0"
                        onChange={(e) => handleUpdateStrengthSegment(index, 'weight', e.target.value ? Number(e.target.value) : null)}
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
                        type="tel"
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*"
                        }}
                        value={(segment as FormStrengthExercise).sets || ''}
                        placeholder="0"
                        onChange={(e) => handleUpdateStrengthSegment(index, 'sets', e.target.value ? Number(e.target.value) : null)}
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
                        label="Reps"
                        type="tel"
                        inputProps={{
                          inputMode: "numeric",
                          pattern: "[0-9]*"
                        }}
                        value={(segment as FormStrengthExercise).reps || ''}
                        placeholder="0"
                        onChange={(e) => handleUpdateStrengthSegment(index, 'reps', e.target.value ? Number(e.target.value) : null)}
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
                  </Stack>
                </>
              )}
              <Box 
                display="flex" 
                justifyContent="center"
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <IconButton
                  onClick={() => handleRemoveSegment(index)}
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
          );
        })}
      </Box>
    );
  };

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
        {formData.type === 'compromised-run' && renderCompromisedRunFields()}
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