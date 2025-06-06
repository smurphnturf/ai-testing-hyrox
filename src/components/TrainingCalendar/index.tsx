import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TimerIcon from '@mui/icons-material/Timer';
import SpeedIcon from '@mui/icons-material/Speed';
import RestoreIcon from '@mui/icons-material/Restore';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import type { TrainingProgram, Workout, WorkoutResult, StrengthExercise, RunningSegment } from '../TrainingProgramBuilder/types';
import { styled } from '@mui/material/styles';
import QuickWorkoutForm from './QuickWorkoutForm';
import { trainingProgramsService } from '../../services/trainingPrograms';

interface Props {
  program: TrainingProgram;
  onEditProgram: () => void;
  onUpdateProgram: (program: TrainingProgram) => void;
}

const CalendarContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'ref',
})(({ theme }) => ({
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 200px)',
  marginTop: theme.spacing(2),
  padding: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} 0`,
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(0,0,0,0.02)',
  marginLeft: 0,
  [theme.breakpoints.up('sm')]: {
    padding: `${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} 0`,
  }
}));

const CalendarGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(0.5),
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    gap: theme.spacing(1),
  }
}));

const DayCell = styled(Paper)(({ theme }) => ({
  minHeight: '80px',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  cursor: 'pointer',
  position: 'relative',
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: '80px',
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    borderRadius: theme.spacing(1.5),
  }
}));

const DateHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const DateNumber = styled(Typography)(() => ({
  fontSize: '0.875rem',
  fontWeight: 600,
}));

const WorkoutDot = styled('div')<{ hasIcon?: boolean }>(({ theme, hasIcon }) => ({
  width: hasIcon ? 'auto' : '6px',
  height: hasIcon ? 'auto' : '6px',
  borderRadius: hasIcon ? '0' : '50%',
  backgroundColor: hasIcon ? 'transparent' : theme.palette.primary.main,
  margin: '2px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.2)',
  },
}));

const WorkoutDotsContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  justifyContent: 'center',
  padding: '8px 0',
});

const MonthContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const MonthHeader = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingLeft: 0,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  textAlign: 'center',
  boxShadow: '0 4px 12px rgba(62,207,142,0.2)',
}));

const WeekDayHeader = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '& > *': {
    textAlign: 'center',
    padding: theme.spacing(1),
    fontWeight: 600,
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
}));

const getWorkoutIcon = (type: string) => {
  switch (type) {
    case 'strength':
      return <FitnessCenterIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />;
    case 'running':
      return <DirectionsRunIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />;
    case 'compromised-run':
      return <SwapHorizIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />;
    case 'amrap':
      return <SpeedIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />;
    case 'emom':
      return <TimerIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />;
    case 'recovery':
      return <RestoreIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />;
    default:
      return null;
  }
};

export function TrainingCalendar({ program, onEditProgram, onUpdateProgram }: Props) {
  const [selectedWorkouts, setSelectedWorkouts] = useState<{workouts: Workout[], date: Date} | null>(null);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workoutsData, setWorkoutsData] = useState<Workout[]>([]);
  const [workoutResults, setWorkoutResults] = useState<WorkoutResult[]>([]);
  // Update logResultWorkout state to include result
  const [logResultWorkout, setLogResultWorkout] = useState<{workout: Workout, date: Date, result?: WorkoutResult} | null>(null);
  const [logResultStatus, setLogResultStatus] = useState<'complete' | 'missed'>('complete');
  const [logResultSegments, setLogResultSegments] = useState<StrengthExercise[] | RunningSegment[] | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();

  const getMonthHeight = () => {
    return 48 + 40 + (6 * 80) + 32;  // MonthHeader + WeekDayHeader + (6 rows * cell height) + bottom margin
  };

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const data = await trainingProgramsService.getPrograms();
        if (data && data.length > 0) {
          const allWorkouts = data.flatMap(p => p.workouts || []);
          setWorkoutsData(allWorkouts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workouts');
      }
    };

    loadWorkouts();
  }, [program]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!program.id) return;
      try {
        const results = await trainingProgramsService.getWorkoutResults(program.id);
        setWorkoutResults(results);
      } catch (err) {
        setError('Failed to load workout results');
      }
    };
    fetchResults();
  }, [program.id]);

  useEffect(() => {
    if (calendarContainerRef.current) {
      const currentDate = new Date(today);
      const monthIndex = currentDate.getMonth();
      const scrollPosition = monthIndex * getMonthHeight();
      
      calendarContainerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [today]);

  const getMonthData = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const start = new Date(firstDay);
    const dayOfWeek = start.getDay() || 7;
    start.setDate(start.getDate() - (dayOfWeek - 1));
    
    const end = new Date(lastDay);
    const endDayOfWeek = end.getDay() || 7;
    end.setDate(end.getDate() + (7 - endDayOfWeek));
    
    const days: Date[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getWorkoutsForDate = (date: Date): Workout[] => {
    const programWorkouts = program.workouts.filter((w: Workout) => {
      if (w.date) {
        const workoutDate = new Date(w.date);
        return workoutDate.toDateString() === date.toDateString();
      }
      if (!program.eventDate) return false;
      const programEvent = new Date(program.eventDate);
      const diffTime = Math.abs(date.getTime() - programEvent.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const week = Math.floor(diffDays / 7) + 1;
      const day = date.getDay() || 7;
      return w.week === week && w.day === day;
    });

    const supabaseWorkouts = workoutsData.filter((w: Workout) => {
      if (w.date) {
        const workoutDate = new Date(w.date);
        return workoutDate.toDateString() === date.toDateString();
      }
      return false;
    });

    const allWorkouts = [...programWorkouts, ...supabaseWorkouts];
    const uniqueWorkouts = Array.from(new Map(allWorkouts.map(w => [w.id, w])).values());
    
    return uniqueWorkouts;
  };

  const isEventDate = (date: Date) => {
    if (!program.eventDate) return false;
    const eventDate = new Date(program.eventDate);
    return date.toDateString() === eventDate.toDateString();
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsAddingWorkout(true);
  };

  const handleAddWorkout = (workout: Workout) => {
    try {
      console.log('Adding workout to program:', workout);
      const updatedProgram = {
        ...program,
        workouts: editingWorkout 
          ? program.workouts.map(w => w.id === editingWorkout.id ? workout : w)
          : [...program.workouts, workout],
      };
      console.log('Updated program:', updatedProgram);
      onUpdateProgram(updatedProgram);
      setIsAddingWorkout(false);
      setEditingWorkout(null);
      if (selectedWorkouts) {
        setSelectedWorkouts({
          ...selectedWorkouts,
          workouts: [workout]
        });
      }
    } catch (err) {
      console.error('Error adding workout:', err);
      console.error('Program state:', program);
      console.error('Workout being added:', workout);
    }
  };

  const handleDayClick = (date: Date) => {
    const workouts = getWorkoutsForDate(date);
    setSelectedWorkouts({ workouts, date });
  };

  const getDayResult = (date: Date) => {
    const iso = date.toISOString().slice(0, 10);
    const results = workoutResults.filter(r => r.date === iso);
    if (results.some(r => r.status === 'complete')) return 'complete';
    if (results.some(r => r.status === 'missed')) return 'missed';
    return null;
  };

  // Add this effect to initialize segment state when opening the log dialog
  useEffect(() => {
    if (logResultWorkout) {
      const w = logResultWorkout.workout;
      if (w.type === 'strength') setLogResultSegments([...w.exercises]);
      else if (w.type === 'running') setLogResultSegments([...w.runningSegments]);
      else setLogResultSegments(null);
    }
  }, [logResultWorkout]);

  return (
    <Box sx={{ width: '100%', margin: 0, padding: 0 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pr: 2,
        pl: 0
      }}>
        <Typography 
          variant="h5"
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {program.name}
        </Typography>
        <Button 
          startIcon={<EditIcon />}
          onClick={onEditProgram}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Edit Program
        </Button>
      </Box>

      <CalendarContainer ref={calendarContainerRef}>
        {Array.from({ length: 12 }, (_, monthIndex) => {
          const days = getMonthData(currentYear, monthIndex);
          return (
            <MonthContainer key={monthIndex}>
              <MonthHeader variant="h6">
                {months[monthIndex]} {currentYear}
              </MonthHeader>
              <WeekDayHeader>
                {weekDays.map(day => (
                  <Typography key={day}>{day}</Typography>
                ))}
              </WeekDayHeader>
              <CalendarGrid>
                {days.map((date, i) => {
                  const workouts = getWorkoutsForDate(date);
                  const isCurrentMonth = date.getMonth() === monthIndex;
                  const isToday = date.toDateString() === today.toDateString();
                  const isEvent = isEventDate(date);
                  const dayResult = getDayResult(date);
                  let bgColor = isToday ? 'rgba(62,207,142,0.05)' : 'background.paper';
                  if (dayResult === 'complete') bgColor = '#e6f9ed';
                  else if (dayResult === 'missed') bgColor = '#ffeaea';
                  return (
                    <DayCell 
                      key={i} 
                      elevation={0}
                      onClick={() => handleDayClick(date)}
                      sx={{
                        opacity: isCurrentMonth ? 1 : 0.3,
                        border: isToday ? '2px solid' : isEvent ? '2px solid black' : 'none',
                        borderColor: isToday ? 'primary.main' : isEvent ? 'black' : 'transparent',
                        backgroundColor: bgColor,
                        position: 'relative'
                      }}
                    >
                      <DateHeader>
                        <DateNumber>
                          {date.getDate()}
                        </DateNumber>
                        {isEvent && (
                          <StarIcon 
                            sx={{ 
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, 60%)',
                              color: 'primary.main',
                              opacity: 1.0,
                              fontSize: '1.2rem',
                              pointerEvents: 'none'
                            }} 
                          />
                        )}
                      </DateHeader>
                      {workouts.length > 0 && (
                        <WorkoutDotsContainer>
                          {workouts.map((workout, i) => (
                            <Tooltip
                              key={i}
                              title={workout.type.replace('-', ' ')}
                              arrow
                              placement="top"
                            >
                              <WorkoutDot hasIcon={!!getWorkoutIcon(workout.type)}>
                                {getWorkoutIcon(workout.type)}
                              </WorkoutDot>
                            </Tooltip>
                          ))}
                        </WorkoutDotsContainer>
                      )}
                    </DayCell>
                  );
                })}
              </CalendarGrid>
            </MonthContainer>
          );
        })}
      </CalendarContainer>

      <Dialog open={!!selectedWorkouts} onClose={() => {
        setSelectedWorkouts(null);
        setIsAddingWorkout(false);
        setEditingWorkout(null);
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        }
      }}
      >
        {selectedWorkouts && (
          <>
            <DialogTitle sx={{
              p: 3,
              backgroundColor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" pr={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, pr: 2 }}>
                  {selectedWorkouts.date.toLocaleDateString('default', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <IconButton 
                  onClick={() => {
                    setSelectedWorkouts(null);
                    setIsAddingWorkout(false);
                    setEditingWorkout(null);
                  }}
                  size="small"
                  sx={{
                    p: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </DialogTitle>
            {!isAddingWorkout ? (
              <DialogContent sx={{ p: 3 }}>
                {selectedWorkouts.workouts.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: 2,
                  }}>
                    <Typography 
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      No workouts scheduled for this day
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setIsAddingWorkout(true)}
                      startIcon={<AddIcon />}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                      }}
                    >
                      Add Workout
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      mb: 3
                    }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsAddingWorkout(true)}
                        startIcon={<AddIcon />}
                        size="small"
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 2,
                          width: '100%',
                        }}
                      >
                        Add Another Workout
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedWorkouts.workouts.map((workout) => {
                        // Robustly find result for this workout and date
                        const workoutResult = workoutResults.find(r => (
                          r.workout_id === workout.id
                        ));
                        console.log('Training Calendar selectedworkouts:', selectedWorkouts);
                        console.log('Training Calendar workoutResults:', workoutResults);
                        console.log('Training Calendar workoutResult:', workoutResult);
                        return (
                          <Paper
                            key={workout.id}
                            sx={{ 
                              p: 3,
                              borderRadius: 2,
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '4px',
                                backgroundColor: 'primary.main',
                                borderRadius: '4px 0 0 4px',
                              }
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              mb: 2
                            }}>
                              <Typography variant="subtitle1" sx={{ 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                {getWorkoutIcon(workout.type)}
                                {workout.name || `${workout.type} Workout`}
                              </Typography>
                              <IconButton 
                                onClick={() => handleEditWorkout(workout)}
                                size="small"
                                sx={{
                                  color: 'primary.main',
                                  padding: 1,
                                  '&:hover': {
                                    backgroundColor: 'rgba(62,207,142,0.1)',
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            <Box sx={{ pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
                              {workout.type === 'strength' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {workout.exercises.map((exercise, i) => (
                                    <Typography key={i} variant="body2" color="text.secondary">
                                      {exercise.name}: {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                                      {workoutResult?.segments?.[i] &&
                                        'sets' in workoutResult.segments[i] &&
                                        'reps' in workoutResult.segments[i] &&
                                        'weight' in workoutResult.segments[i] && (
                                          <span style={{ color: '#43a047', marginLeft: 8 }}>
                                            (Result: {String(workoutResult.segments[i].sets)} sets × {String(workoutResult.segments[i].reps)} reps @ {String(workoutResult.segments[i].weight)}kg)
                                          </span>
                                      )}
                                    </Typography>
                                  ))}
                                </Box>
                              )}

                              {workout.type === 'compromised-run' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {workout.segments.map((segment, i) => (
                                    <Typography key={i} variant="body2" color="text.secondary">
                                      {segment.type === 'strength'
                                        ? `${segment.name}: ${segment.sets} sets x ${segment.reps} reps @ ${segment.weight}kg`
                                        : `Distance: ${segment.distance}km, Time: ${segment.time} minutes, Pace: ${segment.pace} min/km`}
                                      {workoutResult?.segments?.[i] && (
                                        <span style={{ color: '#43a047', marginLeft: 8 }}>
                                          (Result: {segment.type === 'strength'
                                            ? ('sets' in workoutResult.segments[i] && 'reps' in workoutResult.segments[i] && 'weight' in workoutResult.segments[i]
                                                ? `${String((workoutResult.segments[i] as any).sets)} sets x ${String((workoutResult.segments[i] as any).reps)} reps @ ${String((workoutResult.segments[i] as any).weight)}kg`
                                                : '')
                                            : ('distance' in workoutResult.segments[i] && 'time' in workoutResult.segments[i] && 'pace' in workoutResult.segments[i]
                                                ? `${String((workoutResult.segments[i] as any).distance)}km, ${String((workoutResult.segments[i] as any).time)}min, ${String((workoutResult.segments[i] as any).pace)}min/km`
                                                : '')
                                          )}
                                        </span>
                                      )}
                                    </Typography>
                                  ))}
                                </Box>
                              )}

                              {workout.type === 'running' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {workout.runningSegments.map((segment, i) => (
                                    <Typography key={i} variant="body2" color="text.secondary">
                                      Distance: {segment.distance}km, Time: {segment.time} minutes, Pace: {segment.pace} min/km
                                      {workoutResult?.segments?.[i] &&
                                        'distance' in workoutResult.segments[i] &&
                                        'time' in workoutResult.segments[i] &&
                                        'pace' in workoutResult.segments[i] && (
                                          <span style={{ color: '#43a047', marginLeft: 8 }}>
                                            (Result: {String((workoutResult.segments[i] as any).distance)}km, {String((workoutResult.segments[i] as any).time)}min, {String((workoutResult.segments[i] as any).pace)}min/km)
                                          </span>
                                      )}
                                    </Typography>
                                  ))}
                                </Box>
                              )}

                              {(workout.type === 'amrap' || workout.type === 'emom') && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Typography 
                                    variant="body2"
                                    sx={{
                                      color: 'primary.main',
                                      backgroundColor: 'rgba(62,207,142,0.1)',
                                      py: 0.5,
                                      px: 1,
                                      borderRadius: 1,
                                      display: 'inline-block',
                                      mb: 1,
                                    }}
                                  >
                                    {workout.type === 'amrap' ? (
                                      `Time Limit: ${workout.timeLimit} minutes`
                                    ) : (
                                      `Round Time: ${workout.roundTime}s / Total: ${workout.totalTime} minutes`
                                    )}
                                  </Typography>
                                  {workout.exercises.map((exercise, i) => (
                                    <Typography key={i} variant="body2" color="text.secondary">
                                      {exercise.name}: {exercise.reps} reps
                                      {workoutResult?.segments?.[i] &&
                                        'reps' in workoutResult.segments[i] && (
                                          <span style={{ color: '#43a047', marginLeft: 8 }}>
                                            (Result: {String(workoutResult.segments[i].reps)} reps)
                                          </span>
                                      )}
                                    </Typography>
                                  ))}
                                </Box>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => setLogResultWorkout({ workout, date: selectedWorkouts.date, result: workoutResult })}
                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                              >
                                {workoutResult ? 'Edit Result' : 'Log Result'}
                              </Button>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </DialogContent>
            ) : (
              <QuickWorkoutForm
                week={selectedWorkouts.date.getDay()}
                day={selectedWorkouts.date.getDate()}
                date={selectedWorkouts.date}
                onSave={handleAddWorkout}
                onCancel={() => {
                  setIsAddingWorkout(false);
                  setEditingWorkout(null);
                }}
                initialWorkout={editingWorkout || undefined}
              />
            )}
          </>
        )}
      </Dialog>

      {/* Log Result Dialog */}
      <Dialog open={!!logResultWorkout} onClose={() => setLogResultWorkout(null)} maxWidth="sm" fullWidth>
        {logResultWorkout && (
          <>
            <DialogTitle>{logResultWorkout.result ? 'Edit Workout Result' : 'Log Workout Result'}</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant={logResultStatus === 'complete' ? 'contained' : 'outlined'}
                  onClick={() => setLogResultStatus('complete')}
                  sx={{ mr: 2 }}
                >
                  Complete
                </Button>
                <Button
                  variant={logResultStatus === 'missed' ? 'contained' : 'outlined'}
                  onClick={() => setLogResultStatus('missed')}
                >
                  Missed
                </Button>
              </Box>
              {/* Segment editing UI with result comparison */}
              {logResultWorkout.workout.type === 'strength' && Array.isArray(logResultSegments) && (
                <Box>
                  {(logResultSegments as StrengthExercise[]).map((ex, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Typography variant="body2">{ex.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="Sets"
                          value={ex.sets}
                          onChange={e => {
                            const segs = (logResultSegments as StrengthExercise[]).map((seg, idx) => idx === i ? { ...seg, sets: Number(e.target.value) } : seg);
                            setLogResultSegments(segs);
                          }}
                          style={{ width: 60 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Planned: {logResultWorkout.workout.type === 'strength' ? logResultWorkout.workout.exercises[i]?.sets : ''}
                        </Typography>
                        <input
                          type="number"
                          placeholder="Reps"
                          value={ex.reps}
                          onChange={e => {
                            const segs = (logResultSegments as StrengthExercise[]).map((seg, idx) => idx === i ? { ...seg, reps: Number(e.target.value) } : seg);
                            setLogResultSegments(segs);
                          }}
                          style={{ width: 60 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Planned: {logResultWorkout.workout.type === 'strength' ? logResultWorkout.workout.exercises[i]?.reps : ''}
                        </Typography>
                        <input
                          type="number"
                          placeholder="Weight"
                          value={ex.weight}
                          onChange={e => {
                            const segs = (logResultSegments as StrengthExercise[]).map((seg, idx) => idx === i ? { ...seg, weight: Number(e.target.value) } : seg);
                            setLogResultSegments(segs);
                          }}
                          style={{ width: 60 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Planned: {logResultWorkout.workout.type === 'strength' ? logResultWorkout.workout.exercises[i]?.weight : ''}
                        </Typography>
                      </Box>
                      {logResultWorkout.result?.segments?.[i] && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="success.main">
                            Last Result: {logResultWorkout.result.segments[i].sets} sets, {logResultWorkout.result.segments[i].reps} reps, {logResultWorkout.result.segments[i].weight}kg
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
              {logResultWorkout.workout.type === 'running' && Array.isArray(logResultSegments) && (
                <Box>
                  {(logResultSegments as RunningSegment[]).map((seg, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                      <Typography variant="body2">Segment {i + 1}</Typography>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="Distance (km)"
                          value={seg.distance}
                          onChange={e => {
                            const segs = (logResultSegments as RunningSegment[]).map((s, idx) => idx === i ? { ...s, distance: Number(e.target.value) } : s);
                            setLogResultSegments(segs);
                          }}
                          style={{ width: 80 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Planned: {logResultWorkout.workout.type === 'running' ? logResultWorkout.workout.runningSegments[i]?.distance : ''}
                        </Typography>
                        <input
                          type="number"
                          placeholder="Time (min)"
                          value={seg.time}
                          onChange={e => {
                            const segs = (logResultSegments as RunningSegment[]).map((s, idx) => idx === i ? { ...s, time: Number(e.target.value) } : s);
                            setLogResultSegments(segs);
                          }}
                          style={{ width: 80 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Planned: {logResultWorkout.workout.type === 'running' ? logResultWorkout.workout.runningSegments[i]?.time : ''}
                        </Typography>
                        <input
                          type="number"
                          placeholder="Pace (min/km)"
                          value={seg.pace}
                          onChange={e => {
                            const segs = (logResultSegments as RunningSegment[]).map((s, idx) => idx === i ? { ...s, pace: Number(e.target.value) } : s);
                            setLogResultSegments(segs);
                          }}
                          style={{ width: 80 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Planned: {logResultWorkout.workout.type === 'running' ? logResultWorkout.workout.runningSegments[i]?.pace : ''}
                        </Typography>
                      </Box>
                      {logResultWorkout.result?.segments?.[i] && (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="success.main">
                            Last Result: {logResultWorkout.result.segments[i].distance}km, {logResultWorkout.result.segments[i].time}min, {logResultWorkout.result.segments[i].pace}min/km
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
              {/* Add similar UI for other types as needed */}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={async () => {
                    if (!program.id) return;
                    await trainingProgramsService.saveWorkoutResult(program.id, {
                      workoutId: logResultWorkout.workout.id,
                      date: logResultWorkout.date.toISOString().slice(0, 10),
                      status: logResultStatus,
                      segments: logResultSegments,
                    });
                    setLogResultWorkout(null);
                    // Refresh results
                    const results = await trainingProgramsService.getWorkoutResults(program.id);
                    setWorkoutResults(results);
                  }}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Save Result
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ borderRadius: 2 }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TrainingCalendar;