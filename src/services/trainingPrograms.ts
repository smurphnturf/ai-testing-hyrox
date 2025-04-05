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
      if (workout.distance <= 0) throw new Error(`Invalid distance for running workout "${workout.name}"`)
      if (workout.time <= 0) throw new Error(`Invalid time for running workout "${workout.name}"`)
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
          duration: program.duration,
          workouts: program.workouts
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

    return data
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

    return data
  },

  async updateProgram(id: string, program: TrainingProgram) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to update programs')
    }

    // Validate all workouts before saving
    program.workouts.forEach(validateWorkout)

    const { data, error } = await supabase
      .from('training_programs')
      .update({
        name: program.name,
        duration: program.duration,
        workouts: program.workouts
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
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

    return data || null
  },
}