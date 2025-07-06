-- Create yearly_goals table for storing annual CPD goals
create table public.yearly_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  year integer not null,
  goal integer not null check (goal > 0 and goal <= 200),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one goal per user per year
  unique(user_id, year)
);

-- Enable RLS
alter table public.yearly_goals enable row level security;

-- Create policies for yearly_goals
create policy "Users can view own yearly goals" on public.yearly_goals
  for select using (auth.uid() = user_id);

create policy "Users can insert own yearly goals" on public.yearly_goals
  for insert with check (auth.uid() = user_id);

create policy "Users can update own yearly goals" on public.yearly_goals
  for update using (auth.uid() = user_id);

create policy "Users can delete own yearly goals" on public.yearly_goals
  for delete using (auth.uid() = user_id);

-- Create trigger for updated_at
create trigger handle_updated_at before update on public.yearly_goals
  for each row execute procedure public.handle_updated_at();

-- Insert default goals for existing users (30 hours for current year)
insert into public.yearly_goals (user_id, year, goal)
select 
  id as user_id,
  extract(year from now()) as year,
  30 as goal
from auth.users
where id not in (
  select user_id 
  from public.yearly_goals 
  where year = extract(year from now())
);
