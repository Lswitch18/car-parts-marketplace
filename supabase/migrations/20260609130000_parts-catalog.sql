-- Parts Catalog System: vehicle models, parts definitions, and fitment compatibility

create table if not exists vehicle_models (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade not null,
  name text not null,
  generation text,
  year_start int,
  year_end int,
  chassis_code text,
  engine_code text,
  body_style text,
  drivetrain text,
  transmission text,
  specs jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_vm_brand on vehicle_models(brand_id);
create index if not exists idx_vm_chassis on vehicle_models(chassis_code);
create index if not exists idx_vm_name on vehicle_models(name, generation);

create table if not exists parts_catalog (
  id uuid primary key default gen_random_uuid(),
  part_number text not null,
  oem_number text,
  name text not null,
  brand_id uuid references brands(id),
  category_id uuid references categories(id),
  description text,
  specs jsonb default '{}',
  image_url text,
  price_reference numeric(10,2),
  source text default 'manual',
  created_at timestamptz default now(),
  unique(part_number, brand_id)
);

create index if not exists idx_pc_number on parts_catalog(part_number);
create index if not exists idx_pc_oem on parts_catalog(oem_number);
create index if not exists idx_pc_category on parts_catalog(category_id);
create index if not exists idx_pc_brand on parts_catalog(brand_id);

create table if not exists fitment (
  id uuid primary key default gen_random_uuid(),
  part_id uuid references parts_catalog(id) on delete cascade not null,
  vehicle_id uuid references vehicle_models(id) on delete cascade not null,
  position text,
  notes text,
  oem_ref text,
  created_at timestamptz default now(),
  unique(part_id, vehicle_id, position)
);

create unique index if not exists idx_fit_unique on fitment(part_id, vehicle_id, coalesce(position, ''));
create index if not exists idx_fit_vehicle on fitment(vehicle_id);
create index if not exists idx_fit_part on fitment(part_id);

-- RLS: public read only, admin write
alter table vehicle_models enable row level security;
alter table parts_catalog enable row level security;
alter table fitment enable row level security;

create policy "public_select_vm" on vehicle_models for select using (true);
create policy "public_select_pc" on parts_catalog for select using (true);
create policy "public_select_fit" on fitment for select using (true);
