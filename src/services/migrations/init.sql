create table training_programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  workouts jsonb not null,
  event_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table workout_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  program_id uuid references training_programs(id) not null,
  workout_id text not null,
  date date not null,
  status text not null check (status in ('complete', 'missed')),
  segments jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

ALTER TABLE workout_results
ADD CONSTRAINT workout_results_user_program_workout_date_unique
UNIQUE (user_id, program_id, workout_id, date);