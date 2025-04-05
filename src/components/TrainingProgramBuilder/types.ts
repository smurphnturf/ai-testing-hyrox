export interface BaseWorkout {
  id: string;
  name: string;
  type: string;
  week: number;
  day: number;
  date?: string; // ISO string representation of the workout date
}

export interface Exercise {
  name: string;
  reps: number;
}

export interface StrengthExercise extends Exercise {
  weight: number;
  sets: number;
  restTime: number;
}

export interface StrengthWorkout extends BaseWorkout {
  type: 'strength';
  exercises: StrengthExercise[];
}

export interface RunningWorkout extends BaseWorkout {
  type: 'running';
  distance: number;
  pace: number;
  time: number;
  heartRate?: number;
  effortLevel: number;
}

export interface CompromisedRunWorkout extends Omit<RunningWorkout, 'type'> {
  type: 'compromised-run';
  exercises: Exercise[];
}

export interface AmrapWorkout extends BaseWorkout {
  type: 'amrap';
  timeLimit: number;
  exercises: Exercise[];
}

export interface EmomWorkout extends BaseWorkout {
  type: 'emom';
  roundTime: number;
  totalTime: number;
  exercises: Exercise[];
}

export interface RecoveryWorkout extends BaseWorkout {
  type: 'recovery';
  duration: number;
  activityType: string;
  intensity: 'light' | 'moderate';
}

export type Workout =
  | StrengthWorkout
  | RunningWorkout
  | CompromisedRunWorkout
  | AmrapWorkout
  | EmomWorkout
  | RecoveryWorkout;

export interface TrainingProgram {
  id?: string;
  name: string;
  duration: number;
  startDate?: string; // Add start date to the program
  workouts: Workout[];
}