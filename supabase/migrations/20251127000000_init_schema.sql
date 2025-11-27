-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, service_role;

-- Master Icons
create table if not exists public.master_icons (
    name text primary key,
    label text not null
);
alter table public.master_icons enable row level security;

-- Master Colors
create table if not exists public.master_colors (
    name text primary key,
    hex_code text not null
);
alter table public.master_colors enable row level security;

-- Categories
create table if not exists public.categories (
    id text primary key,
    label text not null,
    color_name text references public.master_colors(name),
    icon_name text references public.master_icons(name)
);
alter table public.categories enable row level security;

-- Expenses
create table if not exists public.expenses (
    id bigint generated always as identity primary key,
    title text not null,
    amount numeric not null,
    date date not null,
    category_id text references public.categories(id) on delete cascade,
    note text,
    created_at timestamptz default now()
);
alter table public.expenses enable row level security;

-- Indexes
create index if not exists idx_expenses_date on public.expenses(date);
create index if not exists idx_expenses_category on public.expenses(category_id);

-- RLS Policies (Allow public access for now as per current app logic)
create policy "Public access for master_icons" on public.master_icons for all using (true) with check (true);
create policy "Public access for master_colors" on public.master_colors for all using (true) with check (true);
create policy "Public access for categories" on public.categories for all using (true) with check (true);
create policy "Public access for expenses" on public.expenses for all using (true) with check (true);

-- Seed Master Colors
insert into public.master_colors (name, hex_code) values
('Blue', '#3b82f6'),
('Red', '#ef4444'),
('Green', '#22c55e'),
('Yellow', '#eab308'),
('Purple', '#a855f7'),
('Pink', '#ec4899'),
('Orange', '#f97316'),
('Cyan', '#06b6d4'),
('Teal', '#14b8a6'),
('Indigo', '#6366f1'),
('Gray', '#64748b')
on conflict (name) do nothing;
