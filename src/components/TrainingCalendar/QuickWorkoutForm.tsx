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
  distance: number | null;
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
                distance: segment.distance,
                time: segment.time,
                pace: segment.pace
              } as FormRunningSegment;
            } else {
              return {
                ...segment,
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
        newFormData.segments = [{
          distance: null,
          time: null,
          pace: null
        }] as FormRunningSegment[];
        delete newFormData.exercises;
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
    const workoutData: Workout = {
      id: crypto.randomUUID(),
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
        runningSegments: (formData.segments as FormRunningSegment[]).map(s => ({
          distance: s.distance || 0,
          time: s.time || 0,
          pace: s.pace || 0,
        })),
      }),
      ...(formData.type === 'compromised-run' && {
        segments: (formData.segments as (FormStrengthExercise | FormRunningSegment)[]).map(segment => {
          if ('distance' in segment) {
            return {
              distance: segment.distance || 0,
              time: segment.time || 0,
              pace: segment.pace || 0,
            };
          } else {
            return {
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

    onSave(workoutData);
  };

  const handleAddExercise = () => {
    if (!formData.exercises) return;

    const newExercise = formData.type === 'strength'
      ? { name: '', weight: null, reps: null, sets: null, restTime: 60 }
      : { name: '', reps: null };

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

  const handleRemoveSegment = (index: number) => {
    if (!formData.segments) return;

    setFormData({
      ...formData,
      segments: formData.segments.filter((_, i) => i !== index),
    });
  };

  const handleUpdateStrengthSegment = (index: number, field: keyof FormStrengthExercise, value: string | number | null) => {
    const newSegments = [...formData.segments!];
    newSegments[index] = { ...newSegments[index], [field]: value } as FormStrengthExercise;
    setFormData({ ...formData, segments: newSegments });
  };

  const handleUpdateRunningSegment = (index: number, field: keyof FormRunningSegment, value: number | null) => {
    const newSegments = [...formData.segments!];
    newSegments[index] = { ...newSegments[index], [field]: value } as FormRunningSegment;
    setFormData({ ...formData, segments: newSegments });
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
    const newSegments = [...(formData.segments || [])];
    newSegments.push({
      distance: null,
      time: null,
      pace: null
    } as FormRunningSegment);
    setFormData({ ...formData, segments: newSegments });
    handleAddClose();
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
            spacing={2} 
            sx={{ 
              mb: 2,
              p: 2,
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              position: 'relative'
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                      type="tel"
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*"
                      }}
                      value={(exercise as FormStrengthExercise).weight || ''}
                      placeholder="0"
                      onChange={(e) => {
                        const newExercises = [...formData.exercises!];
                        newExercises[index] = { 
                          ...exercise, 
                          weight: e.target.value ? Number(e.target.value) : null 
                        } as FormStrengthExercise;
                        setFormData({ ...formData, exercises: newExercises });
                      }}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                          borderRadius: 1.5,
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'text.disabled',
                          opacity: 0.7
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
                        newExercises[index] = { 
                          ...exercise, 
                          sets: e.target.value ? Number(e.target.value) : null 
                        } as FormStrengthExercise;
                        setFormData({ ...formData, exercises: newExercises });
                      }}
                      fullWidth
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'background.paper',
                          borderRadius: 1.5,
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'text.disabled',
                          opacity: 0.7
                        }
                      }}
                    />
                  </Box>
                </>
              ) : null}
              <Box flex={formData.type === 'strength' ? 2 : 5}>
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
                    newExercises[index] = { 
                      ...exercise, 
                      reps: e.target.value ? Number(e.target.value) : null 
                    };
                    setFormData({ ...formData, exercises: newExercises });
                  }}
                  fullWidth
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'background.paper',
                      borderRadius: 1.5,
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'text.disabled',
                      opacity: 0.7
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
      {formData.segments?.map((segment, index) => {
        const runningSegment = segment as FormRunningSegment;
        const handleFieldChange = (field: keyof FormRunningSegment, value: number | null) => {
          const newSegments = [...formData.segments!];
          const updatedSegment = { ...runningSegment };
          updatedSegment[field] = value;

          // Auto-calculate the third field based on which two fields were entered
          if (field !== 'distance' && updatedSegment.distance !== null) {
            if (field === 'time' && value !== null) {
              updatedSegment.pace = value / updatedSegment.distance;
            } else if (field === 'pace' && value !== null) {
              updatedSegment.time = updatedSegment.distance * value;
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
          setFormData({ ...formData, segments: newSegments });
        };

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

        const { minutes, seconds } = timeToMinutesSeconds(runningSegment.time);

        return (
          <Stack 
            key={index} 
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
              type="number"
              inputProps={{
                step: "0.1",
                min: "0"
              }}
              value={runningSegment.distance || ''}
              placeholder="0.0"
              onChange={(e) => handleFieldChange('distance', e.target.value ? parseFloat(e.target.value) : null)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  borderRadius: 1.5,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'text.disabled',
                  opacity: 0.7
                }
              }}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                label="Minutes"
                type="number"
                inputProps={{
                  min: "0",
                  step: "1"
                }}
                value={minutes}
                placeholder="0"
                onChange={(e) => {
                  const newTime = minutesSecondsToTime(e.target.value, seconds);
                  handleFieldChange('time', newTime);
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
                type="number"
                inputProps={{
                  min: "0",
                  max: "59",
                  step: "1"
                }}
                value={seconds}
                placeholder="00"
                onChange={(e) => {
                  const newTime = minutesSecondsToTime(minutes, e.target.value);
                  handleFieldChange('time', newTime);
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
            <TextField
              label="Pace (min/km)"
              type="number"
              inputProps={{
                step: "0.1",
                min: "0"
              }}
              value={runningSegment.pace || ''}
              placeholder="0.0"
              onChange={(e) => handleFieldChange('pace', e.target.value ? parseFloat(e.target.value) : null)}
              fullWidth
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                  borderRadius: 1.5,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'text.disabled',
                  opacity: 0.7
                }
              }}
            />
            <Box 
              display="flex" 
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <IconButton
                onClick={() => {
                  const newSegments = [...formData.segments!];
                  newSegments.splice(index, 1);
                  setFormData({ ...formData, segments: newSegments });
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
        );
      })}
      <Button
        startIcon={<AddIcon />}
        onClick={() => {
          const newSegments = [...(formData.segments || [])];
          newSegments.push({
            distance: null,
            time: null,
            pace: null
          } as FormRunningSegment);
          setFormData({ ...formData, segments: newSegments });
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
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Running Segment {index + 1}
                  </Typography>
                  <TextField
                    label="Distance (km)"
                    type="tel"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*"
                    }}
                    value={(segment as FormRunningSegment).distance || ''}
                    placeholder="0"
                    onChange={(e) => handleUpdateRunningSegment(index, 'distance', e.target.value ? Number(e.target.value) : null)}
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
                    label="Time (minutes)"
                    type="tel"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*"
                    }}
                    value={(segment as FormRunningSegment).time || ''}
                    placeholder="0"
                    onChange={(e) => handleUpdateRunningSegment(index, 'time', e.target.value ? Number(e.target.value) : null)}
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
                    label="Pace (min/km)"
                    type="tel"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*"
                    }}
                    value={(segment as FormRunningSegment).pace || ''}
                    placeholder="0"
                    onChange={(e) => handleUpdateRunningSegment(index, 'pace', e.target.value ? Number(e.target.value) : null)}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                        borderRadius: 1.5,
                      }
                    }}
                  />
                </>
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