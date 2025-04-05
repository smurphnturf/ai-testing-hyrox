import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Chip,
  DialogActions,
  Button,
  CardActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { trainingProgramsService } from '../../services/trainingPrograms';
import type { TrainingProgram } from '../TrainingProgramBuilder/types';
import { TrainingProgramBuilder } from '../TrainingProgramBuilder';

interface DeleteConfirmationProps {
  open: boolean;
  programName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmation = ({ open, programName, onConfirm, onCancel }: DeleteConfirmationProps) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>Delete Program</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to delete "{programName}"? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} color="error">Delete</Button>
    </DialogActions>
  </Dialog>
);

export function TrainingProgramList() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [programToDelete, setProgramToDelete] = useState<TrainingProgram | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await trainingProgramsService.getPrograms();
      setPrograms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleProgramClick = (program: TrainingProgram) => {
    setSelectedProgram(program);
  };

  const handleDeleteClick = (e: React.MouseEvent, program: TrainingProgram) => {
    e.stopPropagation();
    setProgramToDelete(program);
  };

  const handleEditClick = (e: React.MouseEvent, program: TrainingProgram) => {
    e.stopPropagation();
    setSelectedProgram(program);
    setEditMode(true);
  };

  const handleEditComplete = () => {
    setEditMode(false);
    setSelectedProgram(null);
    loadPrograms(); // Reload the programs list
  };

  const handleDeleteConfirm = async () => {
    if (!programToDelete?.id) return;
    
    try {
      await trainingProgramsService.deleteProgram(programToDelete.id);
      setPrograms(programs.filter(p => p.id !== programToDelete.id));
      setProgramToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete program');
    }
  };

  if (editMode && selectedProgram) {
    return (
      <TrainingProgramBuilder
        initialProgram={selectedProgram}
        onProgramCreated={handleEditComplete}
      />
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* <Typography variant="h4" gutterBottom>
        Your Training Programs
      </Typography> */}
      
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
        {programs.map((program) => (
          <Card 
            key={program.id}
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
          >
            <CardContent 
              onClick={() => handleProgramClick(program)}
              sx={{ 
                cursor: 'pointer',
                flexGrow: 1
              }}
            >
              <Typography variant="h6" gutterBottom>
                {program.name}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Type: {program.type}
              </Typography>
              <Typography variant="body2">
                Duration: {program.duration} weeks
              </Typography>
              {program.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {program.description}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => handleEditClick(e, program)}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                size="small" 
                color="error"
                onClick={(e) => handleDeleteClick(e, program)}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      <Dialog 
        open={!!selectedProgram && !editMode} 
        onClose={() => setSelectedProgram(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedProgram && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  {selectedProgram.name}
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => handleEditClick(e, selectedProgram)}
                    sx={{ ml: 2 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
                <IconButton onClick={() => setSelectedProgram(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Program Details
                </Typography>
                <Typography variant="body2" paragraph>
                  Type: {selectedProgram.type}
                </Typography>
                <Typography variant="body2" paragraph>
                  Duration: {selectedProgram.duration} weeks
                </Typography>
                {selectedProgram.description && (
                  <Typography variant="body2" paragraph>
                    {selectedProgram.description}
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                Workouts
              </Typography>
              
              {selectedProgram.workouts.map((workout) => (
                <Card key={workout.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1">
                        {workout.name || `${workout.type} Workout`}
                      </Typography>
                      <Chip 
                        label={`Week ${workout.week}, Day ${workout.day}`}
                        size="small"
                      />
                    </Box>
                    
                    {workout.type === 'strength' && workout.exercises && (
                      <Box>
                        {workout.exercises.map((exercise, i) => (
                          <Typography key={i} variant="body2">
                            {exercise.name}: {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                          </Typography>
                        ))}
                      </Box>
                    )}

                    {workout.type === 'running' && (
                      <Typography variant="body2">
                        Distance: {workout.distance}km, Target Time: {workout.time} minutes
                      </Typography>
                    )}

                    {(workout.type === 'amrap' || workout.type === 'emom') && workout.exercises && (
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          {workout.type === 'amrap' ? 
                            `Time Limit: ${workout.timeLimit} minutes` :
                            `Rounds: ${workout.roundTime}s work / ${workout.totalTime} minutes total`
                          }
                        </Typography>
                        {workout.exercises.map((exercise, i) => (
                          <Typography key={i} variant="body2">
                            {exercise.name}: {exercise.reps} reps
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </DialogContent>
          </>
        )}
      </Dialog>

      <DeleteConfirmation 
        open={!!programToDelete}
        programName={programToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProgramToDelete(null)}
      />
    </Box>
  );
}