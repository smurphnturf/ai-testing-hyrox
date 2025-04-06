create table training_programs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  duration integer not null,
  workouts jsonb not null,
  event_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);