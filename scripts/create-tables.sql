-- Enable RLS (Row Level Security)
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  first_name text,
  last_name text,
  peo_number text,
  cpd_goal integer not null default 30,
  email_notifications boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create CPD logs table
create table public.cpd_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  description text not null,
  hours numeric(4,2) not null check (hours > 0),
  category text not null check (category in ('Priority', 'Supplementary')),
  attachment_url text,
  attachment_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create storage bucket for attachments
insert into storage.buckets (id, name, public) values ('cpd-attachments', 'cpd-attachments', true);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.cpd_logs enable row level security;

-- Create policies for profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Create policies for CPD logs
create policy "Users can view own CPD logs" on public.cpd_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own CPD logs" on public.cpd_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own CPD logs" on public.cpd_logs
  for update using (auth.uid() = user_id);

create policy "Users can delete own CPD logs" on public.cpd_logs
  for delete using (auth.uid() = user_id);

-- Create storage policies
create policy "Users can upload their own attachments" on storage.objects
  for insert with check (bucket_id = 'cpd-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own attachments" on storage.objects
  for select using (bucket_id = 'cpd-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own attachments" on storage.objects
  for update using (bucket_id = 'cpd-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own attachments" on storage.objects
  for delete using (bucket_id = 'cpd-attachments' and auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.cpd_logs
  for each row execute procedure public.handle_updated_at();
