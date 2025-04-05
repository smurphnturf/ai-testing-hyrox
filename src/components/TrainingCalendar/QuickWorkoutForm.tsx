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
  Divider,
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
  strengthExercises?: FormStrengthExercise[];
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
  distance: number | null;
  time: number | null;
  pace: number | null;
}

interface FormExercise extends Omit<Exercise, 'reps'> {
  reps: number | null;
}

export function QuickWorkoutForm({ week, day, date, onSave, onCancel, initialWorkout }: Props) {
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
          distance: initialWorkout.distance,
          time: initialWorkout.time,
          pace: initialWorkout.pace,
          effortLevel: initialWorkout.effortLevel,
        }),
        ...(initialWorkout.type === 'compromised-run' && {
          strengthExercises: initialWorkout.strengthExercises.map(e => ({
            ...e,
            weight: e.weight,
            reps: e.reps,
            sets: e.sets
          })),
          runningSegments: initialWorkout.runningSegments.map(s => ({
            ...s,
            distance: s.distance,
            time: s.time,
            pace: s.pace
          })),
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
        delete newFormData.strengthExercises;
        delete newFormData.runningSegments;
        break;
      case 'running':
        newFormData.distance = null;
        newFormData.time = null;
        newFormData.pace = null;
        newFormData.effortLevel = 3;
        delete newFormData.exercises;
        delete newFormData.strengthExercises;
        delete newFormData.runningSegments;
        break;
      case 'compromised-run':
        newFormData.strengthExercises = [{ name: '', weight: null, reps: null, sets: null, restTime: 60 }] as FormStrengthExercise[];
        newFormData.runningSegments = [{
          distance: null,
          time: null,
          pace: null,
          effortLevel: 3
        }];
        delete newFormData.exercises;
        break;
      case 'amrap':
        newFormData.timeLimit = null;
        newFormData.exercises = [{ name: '', reps: null }] as FormExercise[];
        delete newFormData.strengthExercises;
        delete newFormData.runningSegments;
        break;
      case 'emom':
        newFormData.roundTime = null;
        newFormData.totalTime = null;
        newFormData.exercises = [{ name: '', reps: null }] as FormExercise[];
        delete newFormData.strengthExercises;
        delete newFormData.runningSegments;
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
        distance: formData.distance || 0,
        time: formData.time || 0,
        pace: formData.pace || 0,
        effortLevel: formData.effortLevel!,
      }),
      ...(formData.type === 'compromised-run' && {
        strengthExercises: (formData.strengthExercises as FormStrengthExercise[]).map(e => ({
          name: e.name,
          weight: e.weight || 0,
          reps: e.reps || 0,
          sets: e.sets || 0,
          restTime: e.restTime
        })),
        runningSegments: (formData.runningSegments as FormRunningSegment[]).map(s => ({
          distance: s.distance || 0,
          time: s.time || 0,
          pace: s.pace || 0,
          effortLevel: s.effortLevel
        })),
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

  const handleAddStrengthExercise = () => {
    if (!formData.strengthExercises) return;
    
    setFormData({
      ...formData,
      strengthExercises: [...formData.strengthExercises, { 
        name: '', 
        weight: null, 
        reps: null, 
        sets: null, 
        restTime: 60 
      }],
    });
  };

  const handleRemoveStrengthExercise = (index: number) => {
    if (!formData.strengthExercises) return;

    setFormData({
      ...formData,
      strengthExercises: formData.strengthExercises.filter((_, i) => i !== index),
    });
  };

  const handleAddRunningSegment = () => {
    if (!formData.runningSegments) return;
    
    setFormData({
      ...formData,
      runningSegments: [...formData.runningSegments, {
        distance: null,
        time: null,
        pace: null,
        effortLevel: 3
      }],
    });
  };

  const handleRemoveRunningSegment = (index: number) => {
    if (!formData.runningSegments) return;

    setFormData({
      ...formData,
      runningSegments: formData.runningSegments.filter((_, i) => i !== index),
    });
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
    <Stack spacing={2.5} sx={{ mt: 3 }}>
      <TextField
        label="Distance (km)"
        type="tel"
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*"
        }}
        value={formData.distance || ''}
        placeholder="0"
        onChange={(e) => setFormData({ ...formData, distance: e.target.value ? Number(e.target.value) : null })}
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
        label="Time (minutes)"
        type="tel"
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*"
        }}
        value={formData.time || ''}
        placeholder="0"
        onChange={(e) => setFormData({ ...formData, time: e.target.value ? Number(e.target.value) : null })}
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
        label="Pace (min/km)"
        type="tel"
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*"
        }}
        value={formData.pace || ''}
        placeholder="0"
        onChange={(e) => setFormData({ ...formData, pace: e.target.value ? Number(e.target.value) : null })}
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

  const renderCompromisedRunFields = () => (
    <Box sx={{ mt: 3 }}>
      {/* Strength Exercises Section */}
      <Typography 
        variant="subtitle1" 
        gutterBottom
        sx={{ 
          fontWeight: 600,
          color: 'text.primary',
          mb: 2
        }}
      >
        Strength Exercises
      </Typography>
      {formData.strengthExercises?.map((exercise, index) => (
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
          <Box flex={3}>
            <TextField
              label="Exercise Name"
              value={exercise.name}
              onChange={(e) => {
                const newExercises = [...formData.strengthExercises!];
                newExercises[index] = { ...exercise, name: e.target.value };
                setFormData({ ...formData, strengthExercises: newExercises });
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
              label="Weight (kg)"
              type="tel"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*"
              }}
              value={exercise.weight || ''}
              placeholder="0"
              onChange={(e) => {
                const newExercises = [...formData.strengthExercises!];
                newExercises[index] = { ...exercise, weight: e.target.value ? Number(e.target.value) : null };
                setFormData({ ...formData, strengthExercises: newExercises });
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
              value={exercise.sets || ''}
              placeholder="0"
              onChange={(e) => {
                const newExercises = [...formData.strengthExercises!];
                newExercises[index] = { ...exercise, sets: e.target.value ? Number(e.target.value) : null };
                setFormData({ ...formData, strengthExercises: newExercises });
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
              label="Reps"
              type="tel"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*"
              }}
              value={exercise.reps || ''}
              placeholder="0"
              onChange={(e) => {
                const newExercises = [...formData.strengthExercises!];
                newExercises[index] = { ...exercise, reps: e.target.value ? Number(e.target.value) : null };
                setFormData({ ...formData, strengthExercises: newExercises });
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
          <Box 
            flex={1} 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
          >
            <IconButton
              onClick={() => handleRemoveStrengthExercise(index)}
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
        onClick={handleAddStrengthExercise}
        variant="outlined"
        size="small"
        sx={{ 
          mt: 1,
          mb: 4,
          borderRadius: 1.5,
          textTransform: 'none',
          fontWeight: 600
        }}
      >
        Add Strength Exercise
      </Button>

      <Divider sx={{ my: 4 }} />

      {/* Running Segments Section */}
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
        <Stack 
          key={index} 
          spacing={2.5} 
          sx={{ 
            mb: 3,
            p: 2,
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 2,
            position: 'relative'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <IconButton
              onClick={() => handleRemoveRunningSegment(index)}
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
            value={segment.distance || ''}
            placeholder="0"
            onChange={(e) => {
              const newSegments = [...formData.runningSegments!];
              newSegments[index] = { ...segment, distance: e.target.value ? Number(e.target.value) : null };
              setFormData({ ...formData, runningSegments: newSegments });
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
          <TextField
            label="Time (minutes)"
            type="tel"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*"
            }}
            value={segment.time || ''}
            placeholder="0"
            onChange={(e) => {
              const newSegments = [...formData.runningSegments!];
              newSegments[index] = { ...segment, time: e.target.value ? Number(e.target.value) : null };
              setFormData({ ...formData, runningSegments: newSegments });
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
          <TextField
            label="Pace (min/km)"
            type="tel"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*"
            }}
            value={segment.pace || ''}
            placeholder="0"
            onChange={(e) => {
              const newSegments = [...formData.runningSegments!];
              newSegments[index] = { ...segment, pace: e.target.value ? Number(e.target.value) : null };
              setFormData({ ...formData, runningSegments: newSegments });
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
          <TextField
            select
            label="Effort Level"
            value={segment.effortLevel}
            onChange={(e) => {
              const newSegments = [...formData.runningSegments!];
              newSegments[index] = { ...segment, effortLevel: Number(e.target.value) };
              setFormData({ ...formData, runningSegments: newSegments });
            }}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
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