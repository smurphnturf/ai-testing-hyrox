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
      <Box sx={{ 
        display: 'grid', 
        gap: 3, 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)' 
        } 
      }}>
        {programs.map((program) => (
          <Card 
            key={program.id}
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              backgroundColor: 'background.paper',
              position: 'relative',
              overflow: 'visible',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: 'primary.main',
                borderRadius: '12px 12px 0 0',
              }
            }}
          >
            <CardContent 
              onClick={() => handleProgramClick(program)}
              sx={{ 
                cursor: 'pointer',
                flexGrow: 1,
                p: 3
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  mb: 2
                }}
              >
                {program.name}
              </Typography>
              <Typography 
                sx={{ 
                  color: 'text.secondary',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                Type: {program.type}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: 'rgba(62,207,142,0.1)',
                  color: 'primary.main',
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  display: 'inline-block',
                  fontWeight: 500
                }}
              >
                {program.duration} weeks
              </Typography>
              {program.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 2,
                    lineHeight: 1.6
                  }}
                >
                  {program.description}
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ 
              justifyContent: 'flex-end',
              p: 2,
              pt: 0
            }}>
              <IconButton
                size="small"
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(62,207,142,0.1)',
                  }
                }}
                onClick={(e) => handleEditClick(e, program)}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                size="small"
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(211,47,47,0.1)',
                  }
                }}
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        {selectedProgram && (
          <>
            <DialogTitle sx={{ 
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              p: 3
            }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                    {selectedProgram.name}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{
                      ml: 2,
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(62,207,142,0.1)',
                      }
                    }}
                    onClick={(e) => handleEditClick(e, selectedProgram)}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
                <IconButton 
                  onClick={() => setSelectedProgram(null)}
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
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2
                  }}
                >
                  Program Details
                </Typography>
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  Type: {selectedProgram.type}
                </Typography>
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  Duration: {selectedProgram.duration} weeks
                </Typography>
                {selectedProgram.description && (
                  <Typography 
                    variant="body2" 
                    paragraph
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.6
                    }}
                  >
                    {selectedProgram.description}
                  </Typography>
                )}
              </Box>

              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  mb: 3
                }}
              >
                Workouts
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedProgram.workouts.map((workout) => (
                  <Card 
                    key={workout.id} 
                    sx={{ 
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
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography 
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          {workout.name || `${workout.type} Workout`}
                        </Typography>
                        <Chip 
                          label={`Week ${workout.week}, Day ${workout.day}`}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(62,207,142,0.1)',
                            color: 'primary.main',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                      
                      {workout.type === 'strength' && workout.exercises && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {workout.exercises.map((exercise, i) => (
                            <Typography 
                              key={i} 
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                pl: 2,
                                borderLeft: '2px solid',
                                borderColor: 'divider'
                              }}
                            >
                              {exercise.name}: {exercise.sets} sets × {exercise.reps} reps @ {exercise.weight}kg
                            </Typography>
                          ))}
                        </Box>
                      )}

                      {workout.type === 'running' && (
                        <Typography 
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            pl: 2,
                            borderLeft: '2px solid',
                            borderColor: 'divider'
                          }}
                        >
                          Distance: {workout.distance}km, Target Time: {workout.time} minutes
                        </Typography>
                      )}

                      {(workout.type === 'amrap' || workout.type === 'emom') && workout.exercises && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            gutterBottom
                            sx={{
                              color: 'text.secondary',
                              backgroundColor: 'rgba(62,207,142,0.1)',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            {workout.type === 'amrap' ? 
                              `Time Limit: ${workout.timeLimit} minutes` :
                              `Rounds: ${workout.roundTime}s work / ${workout.totalTime} minutes total`
                            }
                          </Typography>
                          {workout.exercises.map((exercise, i) => (
                            <Typography 
                              key={i} 
                              variant="body2"
                              sx={{
                                color: 'text.secondary',
                                pl: 2,
                                borderLeft: '2px solid',
                                borderColor: 'divider'
                              }}
                            >
                              {exercise.name}: {exercise.reps} reps
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
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