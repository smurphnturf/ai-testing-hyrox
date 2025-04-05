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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import type { TrainingProgram, Workout } from '../TrainingProgramBuilder/types';
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

const WorkoutDot = styled('div')(({ theme }) => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  margin: '2px',
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

export function TrainingCalendar({ program, onEditProgram, onUpdateProgram }: Props) {
  const [selectedWorkouts, setSelectedWorkouts] = useState<{workouts: Workout[], date: Date} | null>(null);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workoutsData, setWorkoutsData] = useState<Workout[]>([]);
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
      if (!program.startDate) return false;
      const programStart = new Date(program.startDate);
      const diffTime = Math.abs(date.getTime() - programStart.getTime());
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

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsAddingWorkout(true);
  };

  const handleAddWorkout = (workout: Workout) => {
    const updatedProgram = {
      ...program,
      workouts: editingWorkout 
        ? program.workouts.map(w => w.id === editingWorkout.id ? workout : w)
        : [...program.workouts, workout],
    };
    onUpdateProgram(updatedProgram);
    setIsAddingWorkout(false);
    setEditingWorkout(null);
    // Refresh the selected workouts view using ID lookup for the newly added/edited workout
    if (selectedWorkouts) {
      setSelectedWorkouts({
        ...selectedWorkouts,
        workouts: [workout]
      });
    }
  };

  const handleDayClick = (date: Date) => {
    const workouts = getWorkoutsForDate(date);
    setSelectedWorkouts({ workouts, date });
  };

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
                  
                  return (
                    <DayCell 
                      key={i} 
                      elevation={0}
                      onClick={() => handleDayClick(date)}
                      sx={{
                        opacity: isCurrentMonth ? 1 : 0.3,
                        border: isToday ? '2px solid' : 'none',
                        borderColor: 'primary.main',
                        backgroundColor: isToday ? 'rgba(62,207,142,0.05)' : 'background.paper',
                      }}
                    >
                      <DateHeader>
                        <DateNumber>
                          {date.getDate()}
                        </DateNumber>
                      </DateHeader>
                      {workouts.length > 0 && (
                        <WorkoutDotsContainer>
                          {workouts.map((_, i) => (
                            <WorkoutDot key={i} />
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
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    }
                  }}
                >
                  <CloseIcon />
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
                        }}
                      >
                        Add Another Workout
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedWorkouts.workouts.map((workout) => (
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
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {workout.name || `${workout.type} Workout`}
                            </Typography>
                            <IconButton 
                              onClick={() => handleEditWorkout(workout)}
                              size="small"
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(62,207,142,0.1)',
                                }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>

                          <Box sx={{ pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
                            {workout.type === 'strength' && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {workout.exercises.map((exercise, i) => (
                                  <Typography key={i} variant="body2" color="text.secondary">
                                    {exercise.name}: {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                                  </Typography>
                                ))}
                              </Box>
                            )}

                            {workout.type === 'running' && (
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Distance: {workout.distance}km
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Target Time: {workout.time} minutes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Target Pace: {workout.pace} min/km
                                </Typography>
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
                                  </Typography>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Paper>
                      ))}
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