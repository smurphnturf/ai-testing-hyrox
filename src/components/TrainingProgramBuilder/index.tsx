import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Container,
} from '@mui/material';

interface TrainingProgram {
  name: string;
  duration: number;
  type: 'hyrox' | 'triathlon' | 'crossfit';
  description: string;
}

export const TrainingProgramBuilder = () => {
  const { control, handleSubmit } = useForm<TrainingProgram>({
    defaultValues: {
      name: '',
      duration: 12,
      type: 'hyrox',
      description: '',
    },
  });

  const onSubmit = (data: TrainingProgram) => {
    console.log('Program created:', data);
    // TODO: Implement save functionality
  };

  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 3,
          borderRadius: 2
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          Create Training Program
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Program name is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Program Name"
                fullWidth
                margin="normal"
                error={!!error}
                helperText={error?.message}
              />
            )}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Program Type"
                fullWidth
                margin="normal"
              >
                <MenuItem value="hyrox">Hyrox</MenuItem>
                <MenuItem value="triathlon">Triathlon</MenuItem>
                <MenuItem value="crossfit">CrossFit</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Duration (weeks)"
                fullWidth
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 52 } }}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Program Description"
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
            )}
          />

          <Button 
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Create Program
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TrainingProgramBuilder;