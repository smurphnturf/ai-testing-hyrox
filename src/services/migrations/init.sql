create table training_programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  type text not null,
  duration integer not null,
  description text,
  workouts jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);