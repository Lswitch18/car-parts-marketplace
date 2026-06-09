-- Add unique index on part_number for entries without a brand (auto-parts-db data)
create unique index if not exists idx_pc_partno_unique 
  on parts_catalog(part_number) 
  where brand_id is null;
