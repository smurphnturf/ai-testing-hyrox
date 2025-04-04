import { TrainingProgram } from '../components/TrainingProgramBuilder/types'
import { supabase } from './supabase'

export const trainingProgramsService = {
  async saveProgram(program: TrainingProgram) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User must be authenticated to save programs')
    }

    const { data, error } = await supabase
      .from('training_programs')
      .insert([
        {
          user_id: user.id,
          name: program.name,
          type: program.type,
          duration: program.duration,
          description: program.description,
          workouts: program.workouts
        }
      ])
      .select()
      .single()

    if (error) {
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

    if (error) {
      throw error
    }

    return data
  }
}