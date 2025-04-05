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

const CalendarContainer = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 200px)',
  marginTop: theme.spacing(2),
}));

const CalendarGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(1),
  paddingBottom: theme.spacing(2),
}));

const DayCell = styled(Paper)(({ theme }) => ({
  minHeight: '120px',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  cursor: 'pointer',
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const DateHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
}));

const DateNumber = styled(Typography)(() => ({
  fontSize: '0.875rem',
  fontWeight: 'medium',
}));

const WorkoutDot = styled('div')(({ theme }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  margin: '2px',
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
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const WeekDayHeader = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '& > *': {
    textAlign: 'center',
    padding: theme.spacing(1),
    fontWeight: 'bold',
  },
}));

export function TrainingCalendar({ program, onEditProgram, onUpdateProgram }: Props) {
  const [selectedWorkouts, setSelectedWorkouts] = useState<{workouts: Workout[], date: Date} | null>(null);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workoutsData, setWorkoutsData] = useState<Workout[]>([]);
  const calendarContainerRef = useRef<HTMLDivElement>(null);
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();

  const getMonthHeight = () => {
    return 48 + 40 + (6 * 120) + 32;
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

  const handleAddWorkout = (workout: Workout) => {
    const updatedProgram = {
      ...program,
      workouts: [...program.workouts, workout],
    };
    onUpdateProgram(updatedProgram);
    setIsAddingWorkout(false);
  };

  const handleDayClick = (date: Date) => {
    const workouts = getWorkoutsForDate(date);
    setSelectedWorkouts({ workouts, date });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          {program.name}
        </Typography>
        <Button 
          startIcon={<EditIcon />}
          onClick={onEditProgram}
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
                      elevation={1}
                      onClick={() => handleDayClick(date)}
                      sx={{
                        opacity: isCurrentMonth ? 1 : 0.3,
                        border: isToday ? '2px solid' : 'none',
                        borderColor: 'primary.main',
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

      <Dialog 
        open={!!selectedWorkouts} 
        onClose={() => setSelectedWorkouts(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedWorkouts && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                {selectedWorkouts.date.toLocaleDateString('default', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                <IconButton onClick={() => setSelectedWorkouts(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            {!isAddingWorkout ? (
              <DialogContent>
                {selectedWorkouts.workouts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography color="text.secondary">No workouts scheduled for this day</Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setIsAddingWorkout(true)}
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                    >
                      Add Workout
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsAddingWorkout(true)}
                        startIcon={<AddIcon />}
                        size="small"
                      >
                        Add Another Workout
                      </Button>
                    </Box>
                    {selectedWorkouts.workouts.map((workout) => (
                      <Box key={workout.id} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            {workout.name || `${workout.type} Workout`}
                          </Typography>
                          <IconButton onClick={onEditProgram} size="small">
                            <EditIcon />
                          </IconButton>
                        </Box>

                        {workout.type === 'strength' && (
                          <Box>
                            {workout.exercises.map((exercise, i) => (
                              <Typography key={i} variant="body1" gutterBottom>
                                {exercise.name}: {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                              </Typography>
                            ))}
                          </Box>
                        )}

                        {workout.type === 'running' && (
                          <Box>
                            <Typography variant="body1" gutterBottom>
                              Distance: {workout.distance}km
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              Target Time: {workout.time} minutes
                            </Typography>
                            <Typography variant="body1">
                              Target Pace: {workout.pace} min/km
                            </Typography>
                          </Box>
                        )}

                        {(workout.type === 'amrap' || workout.type === 'emom') && (
                          <Box>
                            {workout.type === 'amrap' ? (
                              <Typography variant="body2" gutterBottom>
                                Time Limit: {workout.timeLimit} minutes
                              </Typography>
                            ) : (
                              <>
                                <Typography variant="body2" gutterBottom>
                                  Round Time: {workout.roundTime} seconds
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                  Total Time: {workout.totalTime} minutes
                                </Typography>
                              </>
                            )}
                            {workout.exercises.map((exercise, i) => (
                              <Typography key={i} variant="body1">
                                {exercise.name}: {exercise.reps} reps
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </DialogContent>
            ) : (
              <QuickWorkoutForm
                week={selectedWorkouts.date.getDay()}
                day={selectedWorkouts.date.getDate()}
                date={selectedWorkouts.date}
                onSave={handleAddWorkout}
                onCancel={() => setIsAddingWorkout(false)}
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
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TrainingCalendar;