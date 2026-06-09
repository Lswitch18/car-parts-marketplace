-- Deduplicate and add unique constraint on vehicle_models
delete from vehicle_models a using vehicle_models b
  where a.id > b.id and a.brand_id = b.brand_id and a.name = b.name;

alter table vehicle_models add constraint uq_vehicle_models_brand_name unique (brand_id, name);
