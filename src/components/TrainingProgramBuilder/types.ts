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
  type: 'strength';
  weight: number;
  sets: number;
  restTime: number;
}

// Form state interfaces with nullable fields
export interface FormExercise {
  name: string;
  reps: number | null;
}

export interface FormStrengthExercise extends Omit<FormExercise, 'reps'> {
  weight: number | null;
  reps: number | null;
  sets: number | null;
  restTime: number;
}

export interface StrengthWorkout extends BaseWorkout {
  type: 'strength';
  exercises: StrengthExercise[];
}

export interface RunningWorkout extends BaseWorkout {
  type: 'running';
  runningSegments: RunningSegment[];
}

export interface RunningSegment {
  type: 'running';
  distance: number;
  time: number;
  pace: number;
}

export interface FormRunningSegment {
  distance: number | null;
  pace: number | null;
  time: number | null;
  heartRate?: number;
}

export interface CompromisedRunWorkout extends BaseWorkout {
  type: 'compromised-run';
  segments: (StrengthExercise | RunningSegment)[];
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

export interface Segment {
  name: string;
  reps?: number;
  restTime?: number;
  weight?: number;
  sets?: number;
  type: 'strength' | 'running';
  distance?: number;
  time?: number; 
}
export interface WorkoutResult {
  workout_id: string;
  date: string; // ISO string
  status: 'complete' | 'missed';
  segments?: Segment[]; // segment results, type depends on workout type
}

export interface TrainingProgram {
  id?: string;
  name: string;
  type?: string;
  description?: string;
  eventDate?: string;
  workouts: Workout[];
  workoutResults?: WorkoutResult[];
}