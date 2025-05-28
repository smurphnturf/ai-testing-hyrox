import { TrainingProgram, Workout } from '../components/TrainingProgramBuilder/types'
import { supabase } from './supabase'

const validateWorkout = (workout: Workout) => {
  switch (workout.type) {
    case 'strength':
      if (!workout.exercises?.length) {
        throw new Error(`Strength workout "${workout.name}" must have at least one exercise`)
      }
      workout.exercises.forEach(exercise => {
        if (!exercise.name) throw new Error('All exercises must have a name')
        if (exercise.sets <= 0) throw new Error(`Invalid sets for exercise "${exercise.name}"`)
        if (exercise.reps <= 0) throw new Error(`Invalid reps for exercise "${exercise.name}"`)
      })
      break
    case 'running':
      console.log('Validating running workout:', workout);
      if (!workout.runningSegments?.length) {
        throw new Error(`Running workout "${workout.name}" must have at least one segment`)
      }
      workout.runningSegments.forEach(segment => {
        if (!segment || typeof segment.distance !== 'number') throw new Error(`Invalid distance for running segment in workout "${workout.name}"`)
        if (!segment || typeof segment.time !== 'number') throw new Error(`Invalid time for running segment in workout "${workout.name}"`)
        if (!segment || typeof segment.pace !== 'number') throw new Error(`Invalid pace for running segment in workout "${workout.name}"`)
      })
      break
    case 'amrap':
      if (!workout.exercises?.length) {
        throw new Error(`AMRAP workout "${workout.name}" must have at least one exercise`)
      }
      if (workout.timeLimit <= 0) {
        throw new Error(`Invalid time limit for AMRAP workout "${workout.name}"`)
      }
      workout.exercises.forEach(exercise => {
        if (!exercise.name) throw new Error('All exercises must have a name')
        if (exercise.reps <= 0) throw new Error(`Invalid reps for exercise "${exercise.name}"`)
      })
      break
    case 'emom':
      if (!workout.exercises?.length) {
        throw new Error(`EMOM workout "${workout.name}" must have at least one exercise`)
      }
      if (workout.roundTime <= 0) {
        throw new Error(`Invalid round time for EMOM workout "${workout.name}"`)
      }
      if (workout.totalTime <= 0) {
        throw new Error(`Invalid total time for EMOM workout "${workout.name}"`)
      }
      workout.exercises.forEach(exercise => {
        if (!exercise.name) throw new Error('All exercises must have a name')
        if (exercise.reps <= 0) throw new Error(`Invalid reps for exercise "${exercise.name}"`)
      })
      break
  }
}

interface DatabaseProgram {
  id: string;
  name: string;
  workouts: Workout[];
  event_date?: string;
  description?: string;
  type?: string;
}

const mapDatabaseToProgram = (data: DatabaseProgram): TrainingProgram => ({
  id: data.id,
  name: data.name,
  workouts: data.workouts,
  eventDate: data.event_date,
  description: data.description,
  type: data.type
});

export const trainingProgramsService = {
  async saveProgram(program: TrainingProgram) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to save programs')
    }

    // Validate all workouts before saving
    program.workouts.forEach(validateWorkout)

    const { data, error } = await supabase
      .from('training_programs')
      .insert([
        {
          user_id: user.id,
          name: program.name,
          workouts: program.workouts,
          event_date: program.eventDate
        }
      ])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('A program with this name already exists')
      }
      throw error
    }

    return mapDatabaseToProgram(data)
  },

  async getPrograms() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to fetch programs')
    }

    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data?.map(mapDatabaseToProgram) || []
  },

  async updateProgram(id: string, program: TrainingProgram) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User must be authenticated to update programs')
      }

      // Log the program state before validation
      console.log('Updating program:', program);

      // Validate all workouts before saving
      try {
        program.workouts.forEach(validateWorkout)
      } catch (validationError) {
        console.error('Workout validation failed:', validationError);
        console.error('Failed workout data:', program.workouts);
        throw validationError;
      }

      const { data, error } = await supabase
        .from('training_programs')
        .update({
          name: program.name,
          workouts: program.workouts,
          event_date: program.eventDate
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      return mapDatabaseToProgram(data);
    } catch (err) {
      console.error('Error in updateProgram:', err);
      throw err;
    }
  },

  async deleteProgram(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to delete programs')
    }

    const { error } = await supabase
      .from('training_programs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }
  },

  async getUserProgram() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to fetch programs')
    }

    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error
    }

    return data ? mapDatabaseToProgram(data) : null
  },

  async saveWorkoutResult(programId: string, result: {
    workoutId: string;
    date: string;
    status: 'complete' | 'missed';
    segments?: unknown;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to log results');
    const { data, error } = await supabase
      .from('workout_results')
      .upsert([
        {
          user_id: user.id,
          program_id: programId,
          workout_id: result.workoutId,
          date: result.date,
          status: result.status,
          segments: result.segments || null,
        }
      ], { onConflict: 'user_id,program_id,workout_id,date' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getWorkoutResults(programId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be authenticated to fetch results');
    const { data, error } = await supabase
      .from('workout_results')
      .select('*')
      .eq('user_id', user.id)
      .eq('program_id', programId);
    if (error) throw error;
    return data || [];
  },
}