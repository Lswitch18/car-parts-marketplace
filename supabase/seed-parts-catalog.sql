-- Seed: Vehicle Models (popular cars in Japan market)
-- Requires brands and categories to be seeded first

-- Helper: get brand UUID by slug
create or replace function get_brand_id(brand_slug text) returns uuid language sql stable as $$
  select id from brands where slug = brand_slug limit 1;
$$;

-- Insert vehicle models
insert into vehicle_models (brand_id, name, generation, year_start, year_end, chassis_code, engine_code, body_style, drivetrain, transmission, specs) values
  ((select id from brands where slug = 'toyota'), 'Corolla', 'E210', 2018, null, 'ZRE172/ZWE211', '2ZR-FE/2ZR-FAE', 'Sedan', 'FWD', 'CVT/6MT', '{"displacement_cc": 1798, "power_hp": 140, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'toyota'), 'Camry', 'XV70', 2017, null, 'GSV70', 'A25A-FKS', 'Sedan', 'FWD', '8AT', '{"displacement_cc": 2487, "power_hp": 203, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'toyota'), 'Supra', 'GR A90', 2019, null, 'DB42', 'B58B30', 'Coupe', 'RWD', '8AT', '{"displacement_cc": 2998, "power_hp": 382, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'honda'), 'Civic', 'FK7', 2016, 2021, 'FK7', 'L15B7', 'Hatchback', 'FWD', 'CVT/6MT', '{"displacement_cc": 1498, "power_hp": 180, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'honda'), 'Fit', 'GK', 2013, 2020, 'GK5', 'L15B', 'Hatchback', 'FWD', 'CVT', '{"displacement_cc": 1498, "power_hp": 130, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'nissan'), 'Note', 'E13', 2020, null, 'HE13', 'HR15DE', 'Hatchback', 'FWD', 'CVT', '{"displacement_cc": 1498, "power_hp": 118, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'nissan'), 'GT-R', 'R35', 2007, null, 'R35', 'VR38DETT', 'Coupe', 'AWD', '6DCT', '{"displacement_cc": 3799, "power_hp": 565, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'mazda'), 'CX-5', 'KF', 2017, null, 'KF', 'PE-VPS', 'SUV', 'FWD/AWD', '6AT', '{"displacement_cc": 2488, "power_hp": 187, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'mazda'), 'MX-5', 'ND', 2015, null, 'ND5RC', 'P5-VPS', 'Convertible', 'RWD', '6MT/6AT', '{"displacement_cc": 1498, "power_hp": 132, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'subaru'), 'WRX', 'VAB', 2014, 2021, 'VAB', 'FA20F', 'Sedan', 'AWD', '6MT/CVT', '{"displacement_cc": 1998, "power_hp": 268, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'mitsubishi'), 'Outlander', 'GG', 2012, 2021, 'GG', '4B12', 'SUV', 'FWD/AWD', 'CVT', '{"displacement_cc": 2360, "power_hp": 167, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'mitsubishi'), 'Lancer Evolution', 'X', 2007, 2016, 'CZ4A', '4B11T', 'Sedan', 'AWD', '6DCT', '{"displacement_cc": 1998, "power_hp": 291, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'suzuki'), 'Swift', 'ZC', 2017, null, 'ZC33S', 'K14C', 'Hatchback', 'FWD', 'CVT/6AT', '{"displacement_cc": 1373, "power_hp": 140, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'lexus'), 'UX', 'ZA10', 2018, null, 'ZA10', 'M20A-FXS', 'SUV', 'FWD/AWD', 'CVT', '{"displacement_cc": 1987, "power_hp": 181, "fuel": "hybrid"}'),
  ((select id from brands where slug = 'bmw'), '3 Series', 'G20', 2018, null, 'G20', 'B48B20', 'Sedan', 'RWD/AWD', '8AT', '{"displacement_cc": 1998, "power_hp": 258, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'bmw'), 'X3', 'G01', 2017, null, 'G01', 'B48B20', 'SUV', 'AWD', '8AT', '{"displacement_cc": 1998, "power_hp": 248, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'porsche'), '911', '992', 2018, null, '992', 'MDC.AP', 'Coupe', 'RWD', '8DCT', '{"displacement_cc": 2981, "power_hp": 379, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'porsche'), 'Macan', '95B', 2014, null, '95B', 'CWMA', 'SUV', 'AWD', '7DCT', '{"displacement_cc": 1984, "power_hp": 252, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'audi'), 'A4', 'B9', 2015, null, 'B9', 'EA888', 'Sedan', 'FWD/AWD', '7DCT', '{"displacement_cc": 1998, "power_hp": 249, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'tesla'), 'Model 3', 'Highland', 2023, null, null, 'Electric Motor', 'Sedan', 'RWD/AWD', '1AT', '{"battery_kwh": 60, "power_hp": 283, "fuel": "electric"}'),
  ((select id from brands where slug = 'mercedes-benz'), 'C-Class', 'W206', 2021, null, 'W206', 'M254', 'Sedan', 'RWD/AWD', '9AT', '{"displacement_cc": 1999, "power_hp": 255, "fuel": "gasoline"}'),
  ((select id from brands where slug = 'volkswagen'), 'Golf', 'MK8', 2019, null, null, 'EA211', 'Hatchback', 'FWD', '7DCT', '{"displacement_cc": 1984, "power_hp": 245, "fuel": "gasoline"}')
on conflict do nothing;

-- Parts Catalog entries
insert into parts_catalog (part_number, oem_number, name, brand_id, category_id, description, price_reference, source) values
  ('04465-YZZA6', '04465-YZZA6', 'Brake Pad Set Front', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'brakes'), 'Genuine Toyota brake pad set for front wheels', 8500, 'manual'),
  ('04466-YZZA6', '04466-YZZA6', 'Brake Pad Set Rear', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'brakes'), 'Genuine Toyota brake pad set for rear wheels', 7200, 'manual'),
  ('04152-YZZA6', '04152-YZZA6', 'Oil Filter', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'engine'), 'Genuine Toyota oil filter', 1500, 'manual'),
  ('90919-01257', '90919-01257', 'Spark Plug Iridium', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'engine'), 'Genuine Toyota iridium spark plug (set of 4)', 12000, 'manual'),
  ('13568-0H010', '13568-0H010', 'Timing Belt Kit', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'engine'), 'Genuine Toyota timing belt kit with tensioner', 25000, 'manual'),
  ('23300-0L010', '23300-0L010', 'Alternator 12V 100A', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'engine'), 'Genuine Toyota alternator', 45000, 'manual'),
  ('45022-TBA-A00', '45022-TBA-A00', 'Brake Pad Set Front', (select id from brands where slug = 'honda'), (select id from categories where slug = 'brakes'), 'Genuine Honda brake pad set for front wheels', 8200, 'manual'),
  ('15400-PLM-A02', '15400-PLM-A02', 'Oil Filter', (select id from brands where slug = 'honda'), (select id from categories where slug = 'engine'), 'Genuine Honda oil filter', 1200, 'manual'),
  ('14400-PLC-004', '14400-PLC-004', 'Timing Belt', (select id from brands where slug = 'honda'), (select id from categories where slug = 'engine'), 'Genuine Honda timing belt', 9500, 'manual'),
  ('51610-TBA-A01', '51610-TBA-A01', 'Shock Absorber Front', (select id from brands where slug = 'honda'), (select id from categories where slug = 'suspension'), 'Genuine Honda front shock absorber', 28000, 'manual'),
  ('D1M60-9N00A', 'D1M60-9N00A', 'Brake Pad Set Front', (select id from brands where slug = 'nissan'), (select id from categories where slug = 'brakes'), 'Genuine Nissan brake pad set for front wheels', 7800, 'manual'),
  ('15208-HC400', '15208-HC400', 'Oil Filter', (select id from brands where slug = 'nissan'), (select id from categories where slug = 'engine'), 'Genuine Nissan oil filter', 1100, 'manual'),
  ('34116855075', '34116855075', 'Brake Pad Set Front', (select id from brands where slug = 'bmw'), (select id from categories where slug = 'brakes'), 'Genuine BMW brake pad set for front wheels', 15000, 'manual'),
  ('11428507683', '11428507683', 'Oil Filter', (select id from brands where slug = 'bmw'), (select id from categories where slug = 'engine'), 'Genuine BMW oil filter', 3500, 'manual'),
  ('31316878008', '31316878008', 'Shock Absorber Front', (select id from brands where slug = 'bmw'), (select id from categories where slug = 'suspension'), 'Genuine BMW front shock absorber', 45000, 'manual'),
  ('9Y0698151', '9Y0698151', 'Brake Pad Set Front', (select id from brands where slug = 'porsche'), (select id from categories where slug = 'brakes'), 'Genuine Porsche brake pad set for front wheels', 28000, 'manual'),
  ('94810722530', '94810722530', 'Oil Filter', (select id from brands where slug = 'porsche'), (select id from categories where slug = 'engine'), 'Genuine Porsche oil filter', 5500, 'manual'),
  ('0004209300', '0004209300', 'Brake Pad Set Front', (select id from brands where slug = 'mercedes-benz'), (select id from categories where slug = 'brakes'), 'Genuine Mercedes-Benz brake pad set for front wheels', 16000, 'manual'),
  ('2710940204', '2710940204', 'Oil Filter', (select id from brands where slug = 'mercedes-benz'), (select id from categories where slug = 'engine'), 'Genuine Mercedes-Benz oil filter', 3800, 'manual'),
  ('N-65', 'N-65', 'Battery 12V 65Ah', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'engine'), 'Panasonic calcium battery 65Ah', 18000, 'manual'),
  ('IKH20TT', 'IKH20TT', 'Spark Plug Iridium TT', (select id from brands where slug = 'nissan'), (select id from categories where slug = 'engine'), 'Denso Iridium TT spark plug (set of 4)', 14000, 'manual'),
  ('SILKAR8B7', 'SILKAR8B7', 'Spark Plug Laser Iridium', (select id from brands where slug = 'bmw'), (select id from categories where slug = 'engine'), 'NGK Laser Iridium spark plug (set of 4)', 16000, 'manual'),
  ('43512-0D080', '43512-0D080', 'Brake Disc Front', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'brakes'), 'Genuine Toyota front brake disc', 22000, 'manual'),
  ('45251-TBA-A00', '45251-TBA-A00', 'Brake Disc Front', (select id from brands where slug = 'honda'), (select id from categories where slug = 'brakes'), 'Genuine Honda front brake disc', 21000, 'manual'),
  ('34106880467', '34106880467', 'Brake Disc Front', (select id from brands where slug = 'bmw'), (select id from categories where slug = 'brakes'), 'Genuine BMW front brake disc', 35000, 'manual'),
  ('9Y0615301', '9Y0615301', 'Brake Disc Front', (select id from brands where slug = 'porsche'), (select id from categories where slug = 'brakes'), 'Genuine Porsche front brake disc', 55000, 'manual'),
  ('08885-02606', '08885-02606', 'Engine Oil 5W-30 4L', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'engine'), 'Genuine Toyota 5W-30 synthetic engine oil 4L', 6000, 'manual'),
  ('08798-9038', '08798-9038', 'Engine Oil 0W-20 4L', (select id from brands where slug = 'honda'), (select id from categories where slug = 'engine'), 'Genuine Honda 0W-20 synthetic engine oil 4L', 5800, 'manual'),
  ('83212469029', '83212469029', 'Engine Oil 5W-30 5L', (select id from brands where slug = 'bmw'), (select id from categories where slug = 'engine'), 'Genuine BMW TwinPower Turbo 5W-30 5L', 12000, 'manual'),
  ('48510-0E010', '48510-0E010', 'Shock Absorber Front Right', (select id from brands where slug = 'toyota'), (select id from categories where slug = 'suspension'), 'Genuine Toyota front right shock absorber', 32000, 'manual'),
  ('9A0616031', '9A0616031', 'Shock Absorber Front', (select id from brands where slug = 'porsche'), (select id from categories where slug = 'suspension'), 'Genuine Porsche front shock absorber PASM', 85000, 'manual'),
  ('MDC.AP.001', null, 'Oil Filter 911 992', (select id from brands where slug = 'porsche'), (select id from categories where slug = 'engine'), 'Genuine Porsche 911 992 oil filter element', 7000, 'manual'),
  ('600-580-00', '600-580-00', 'Headlight Assembly Left', (select id from brands where slug = 'tesla'), (select id from categories where slug = 'lighting'), 'Tesla Model 3 left LED headlight assembly', 95000, 'manual'),
  ('600-581-00', '600-581-00', 'Headlight Assembly Right', (select id from brands where slug = 'tesla'), (select id from categories where slug = 'lighting'), 'Tesla Model 3 right LED headlight assembly', 95000, 'manual'),
  ('000-000-001', null, 'Cabin Air Filter', (select id from brands where slug = 'tesla'), (select id from categories where slug = 'interior'), 'Tesla Model 3 cabin air filter', 4500, 'manual'),
  ('315334814', '315334814', 'Brake Pad Set Front', (select id from brands where slug = 'audi'), (select id from categories where slug = 'brakes'), 'Genuine Audi brake pad set for front wheels', 13000, 'manual'),
  ('06K115562', '06K115562', 'Oil Filter', (select id from brands where slug = 'audi'), (select id from categories where slug = 'engine'), 'Genuine Audi 2.0 TSI oil filter', 3200, 'manual'),
  ('5Q0616015T', '5Q0616015T', 'Shock Absorber Front', (select id from brands where slug = 'audi'), (select id from categories where slug = 'suspension'), 'Genuine Audi A4 front shock absorber', 38000, 'manual'),
  ('L15B-PC', 'L15B-PC', 'Piston Ring Set', (select id from brands where slug = 'honda'), (select id from categories where slug = 'engine'), 'Genuine Honda L15B piston ring set (std)', 8500, 'manual'),
  ('FA20-OF', 'FA20-OF', 'Oil Filter Subaru FA20', (select id from brands where slug = 'subaru'), (select id from categories where slug = 'engine'), 'Genuine Subaru FA20 oil filter', 1800, 'manual'),
  ('VR38-TB', 'VR38-TB', 'Turbocharger Kit RH', (select id from brands where slug = 'nissan'), (select id from categories where slug = 'turbo-boost'), 'Genuine Nissan GT-R R35 RH turbocharger', 350000, 'manual'),
  ('4B11-TB', '4B11-TB', 'Turbocharger', (select id from brands where slug = 'mitsubishi'), (select id from categories where slug = 'turbo-boost'), 'Genuine Mitsubishi Evo X 4B11T turbocharger', 280000, 'manual'),
  ('B58-OF', 'B58-OF', 'Oil Filter BMW B58', (select id from brands where slug = 'bmw'), (select id from categories where slug = 'engine'), 'Genuine BMW B58 oil filter element', 4500, 'manual'),
  ('K14C-SP', 'K14C-SP', 'Spark Plug Suzuki K14C', (select id from brands where slug = 'suzuki'), (select id from categories where slug = 'engine'), 'Genuine Suzuki K14C spark plug (set of 4)', 9500, 'manual'),
  ('P5-VPS-TB', null, 'Timing Belt MX-5 ND 1.5', (select id from brands where slug = 'mazda'), (select id from categories where slug = 'engine'), 'Genuine Mazda MX-5 ND 1.5L timing belt', 11000, 'manual'),
  ('M20A-FXS-OF', null, 'Oil Filter Lexus UX', (select id from brands where slug = 'lexus'), (select id from categories where slug = 'engine'), 'Genuine Lexus UX M20A-FXS oil filter', 2000, 'manual'),
  ('W206-BP', null, 'Brake Pad Set Front W206', (select id from brands where slug = 'mercedes-benz'), (select id from categories where slug = 'brakes'), 'Genuine Mercedes W206 C-Class front brake pads', 18000, 'manual'),
  ('EA888-TB', null, 'Timing Chain Kit EA888', (select id from brands where slug = 'audi'), (select id from categories where slug = 'engine'), 'Genuine Audi VW EA888 timing chain kit', 32000, 'manual'),
  ('992-WL', '992-WL', 'Windshield 911 992', (select id from brands where slug = 'porsche'), (select id from categories where slug = 'body-kits'), 'Genuine Porsche 911 992 windshield', 180000, 'manual')
on conflict do nothing;

-- Fitment entries (compatibility)
insert into fitment (part_id, vehicle_id, position, notes) values
  -- Toyota brake pads fit multiple Toyota/Lexus models
  ((select id from parts_catalog where part_number = '04465-YZZA6'), (select id from vehicle_models where chassis_code = 'ZRE172/ZWE211'), 'Front', 'Fits Corolla E210 1.8L'),
  ((select id from parts_catalog where part_number = '04465-YZZA6'), (select id from vehicle_models where chassis_code = 'GSV70'), 'Front', 'Fits Camry XV70'),
  ((select id from parts_catalog where part_number = '04466-YZZA6'), (select id from vehicle_models where chassis_code = 'ZRE172/ZWE211'), 'Rear', 'Fits Corolla E210'),
  ((select id from parts_catalog where part_number = '04466-YZZA6'), (select id from vehicle_models where chassis_code = 'GSV70'), 'Rear', 'Fits Camry XV70'),
  -- Toyota oil filter fits most Toyota engines
  ((select id from parts_catalog where part_number = '04152-YZZA6'), (select id from vehicle_models where chassis_code = 'ZRE172/ZWE211'), null, '2ZR-FE engine'),
  ((select id from parts_catalog where part_number = '04152-YZZA6'), (select id from vehicle_models where chassis_code = 'GSV70'), null, 'A25A-FKS engine'),
  ((select id from parts_catalog where part_number = '04152-YZZA6'), (select id from vehicle_models where chassis_code = 'ZA10'), null, 'M20A-FXS engine - Lexus UX'),
  -- Honda brake pads
  ((select id from parts_catalog where part_number = '45022-TBA-A00'), (select id from vehicle_models where chassis_code = 'FK7'), 'Front', 'Fits Civic FK7'),
  ((select id from parts_catalog where part_number = '45022-TBA-A00'), (select id from vehicle_models where chassis_code = 'GK5'), 'Front', 'Fits Fit GK'),
  -- Honda oil filter
  ((select id from parts_catalog where part_number = '15400-PLM-A02'), (select id from vehicle_models where chassis_code = 'FK7'), null, 'L15B7 engine'),
  ((select id from parts_catalog where part_number = '15400-PLM-A02'), (select id from vehicle_models where chassis_code = 'GK5'), null, 'L15B engine'),
  -- Nissan brake pads
  ((select id from parts_catalog where part_number = 'D1M60-9N00A'), (select id from vehicle_models where chassis_code = 'HE13'), 'Front', 'Fits Note E13'),
  ((select id from parts_catalog where part_number = 'D1M60-9N00A'), (select id from vehicle_models where chassis_code = 'R35'), 'Front', 'Fits GT-R R35'),
  -- Nissan oil filter
  ((select id from parts_catalog where part_number = '15208-HC400'), (select id from vehicle_models where chassis_code = 'HE13'), null, 'HR15DE engine'),
  ((select id from parts_catalog where part_number = '15208-HC400'), (select id from vehicle_models where chassis_code = 'R35'), null, 'VR38DETT engine'),
  -- BMW brake pads
  ((select id from parts_catalog where part_number = '34116855075'), (select id from vehicle_models where chassis_code = 'G20'), 'Front', 'Fits 3 Series G20'),
  ((select id from parts_catalog where part_number = '34116855075'), (select id from vehicle_models where chassis_code = 'G01'), 'Front', 'Fits X3 G01'),
  -- BMW oil filter
  ((select id from parts_catalog where part_number = '11428507683'), (select id from vehicle_models where chassis_code = 'G20'), null, 'B48B20 engine'),
  ((select id from parts_catalog where part_number = '11428507683'), (select id from vehicle_models where chassis_code = 'G01'), null, 'B48B20 engine'),
  -- BMW shock
  ((select id from parts_catalog where part_number = '31316878008'), (select id from vehicle_models where chassis_code = 'G20'), 'Front', 'Fits 3 Series G20'),
  -- Porsche brake pads
  ((select id from parts_catalog where part_number = '9Y0698151'), (select id from vehicle_models where chassis_code = '992'), 'Front', 'Fits 911 992'),
  ((select id from parts_catalog where part_number = '9Y0698151'), (select id from vehicle_models where chassis_code = '95B'), 'Front', 'Fits Macan 95B'),
  -- Porsche oil filter
  ((select id from parts_catalog where part_number = '94810722530'), (select id from vehicle_models where chassis_code = '992'), null, 'Fits 911 992'),
  ((select id from parts_catalog where part_number = '94810722530'), (select id from vehicle_models where chassis_code = '95B'), null, 'Fits Macan 95B'),
  -- Porsche brake disc
  ((select id from parts_catalog where part_number = '9Y0615301'), (select id from vehicle_models where chassis_code = '992'), 'Front', 'Fits 911 992'),
  -- Mercedes brake pads
  ((select id from parts_catalog where part_number = '0004209300'), (select id from vehicle_models where chassis_code = 'W206'), 'Front', 'Fits C-Class W206'),
  -- Mercedes oil filter
  ((select id from parts_catalog where part_number = '2710940204'), (select id from vehicle_models where chassis_code = 'W206'), null, 'M254 engine'),
  -- Toyota spark plugs
  ((select id from parts_catalog where part_number = '90919-01257'), (select id from vehicle_models where chassis_code = 'ZRE172/ZWE211'), null, '2ZR-FE engine'),
  ((select id from parts_catalog where part_number = '90919-01257'), (select id from vehicle_models where chassis_code = 'GSV70'), null, 'A25A-FKS engine'),
  -- Denso spark plugs cross-brand
  ((select id from parts_catalog where part_number = 'IKH20TT'), (select id from vehicle_models where chassis_code = 'HE13'), null, 'HR15DE engine'),
  ((select id from parts_catalog where part_number = 'IKH20TT'), (select id from vehicle_models where chassis_code = 'R35'), null, 'VR38DETT engine'),
  ((select id from parts_catalog where part_number = 'IKH20TT'), (select id from vehicle_models where chassis_code = 'FK7'), null, 'L15B7 engine'),
  -- NGK spark plugs
  ((select id from parts_catalog where part_number = 'SILKAR8B7'), (select id from vehicle_models where chassis_code = 'G20'), null, 'B48B20 engine'),
  ((select id from parts_catalog where part_number = 'SILKAR8B7'), (select id from vehicle_models where chassis_code = 'G01'), null, 'B48B20 engine'),
  -- Toyota disc brake
  ((select id from parts_catalog where part_number = '43512-0D080'), (select id from vehicle_models where chassis_code = 'ZRE172/ZWE211'), 'Front', 'Fits Corolla E210'),
  ((select id from parts_catalog where part_number = '43512-0D080'), (select id from vehicle_models where chassis_code = 'GSV70'), 'Front', 'Fits Camry XV70'),
  -- Honda disc
  ((select id from parts_catalog where part_number = '45251-TBA-A00'), (select id from vehicle_models where chassis_code = 'FK7'), 'Front', 'Fits Civic FK7'),
  -- BMW disc
  ((select id from parts_catalog where part_number = '34106880467'), (select id from vehicle_models where chassis_code = 'G20'), 'Front', 'Fits 3 Series G20'),
  ((select id from parts_catalog where part_number = '34106880467'), (select id from vehicle_models where chassis_code = 'G01'), 'Front', 'Fits X3 G01'),
  -- Toyota shock
  ((select id from parts_catalog where part_number = '48510-0E010'), (select id from vehicle_models where chassis_code = 'ZRE172/ZWE211'), 'Front Right', 'Fits Corolla E210'),
  -- Porsche shock
  ((select id from parts_catalog where part_number = '9A0616031'), (select id from vehicle_models where chassis_code = '95B'), 'Front', 'Fits Macan 95B with PASM'),
  -- Toyota timing belt
  ((select id from parts_catalog where part_number = '13568-0H010'), (select id from vehicle_models where chassis_code = 'ZRE172/ZWE211'), null, '2ZR-FE engine'),
  -- Honda timing belt
  ((select id from parts_catalog where part_number = '14400-PLC-004'), (select id from vehicle_models where chassis_code = 'GK5'), null, 'L15B engine'),
  -- Toyota battery fits multiple
  ((select id from parts_catalog where part_number = 'N-65'), (select id from vehicle_models where chassis_code = 'ZRE172/ZWE211'), null, 'Corolla E210'),
  ((select id from parts_catalog where part_number = 'N-65'), (select id from vehicle_models where chassis_code = 'GSV70'), null, 'Camry XV70'),
  ((select id from parts_catalog where part_number = 'N-65'), (select id from vehicle_models where chassis_code = 'GK5'), null, 'Fit GK'),
  ((select id from parts_catalog where part_number = 'N-65'), (select id from vehicle_models where chassis_code = 'HE13'), null, 'Note E13'),
  -- Toyota engine oil
  ((select id from parts_catalog where part_number = '08885-02606'), (select id from vehicle_models where chassis_code = 'ZRE172/ZWE211'), null, '2ZR-FE'),
  ((select id from parts_catalog where part_number = '08885-02606'), (select id from vehicle_models where chassis_code = 'GSV70'), null, 'A25A-FKS'),
  -- Honda engine oil
  ((select id from parts_catalog where part_number = '08798-9038'), (select id from vehicle_models where chassis_code = 'FK7'), null, 'L15B7'),
  ((select id from parts_catalog where part_number = '08798-9038'), (select id from vehicle_models where chassis_code = 'GK5'), null, 'L15B'),
  -- BMW engine oil
  ((select id from parts_catalog where part_number = '83212469029'), (select id from vehicle_models where chassis_code = 'G20'), null, 'B48B20'),
  ((select id from parts_catalog where part_number = '83212469029'), (select id from vehicle_models where chassis_code = 'G01'), null, 'B48B20'),
  -- Tesla parts
  ((select id from parts_catalog where part_number = '600-580-00'), (select id from vehicle_models where chassis_code is null and name = 'Model 3'), 'Left', 'Fits Model 3 Highland'),
  ((select id from parts_catalog where part_number = '600-581-00'), (select id from vehicle_models where chassis_code is null and name = 'Model 3'), 'Right', 'Fits Model 3 Highland'),
  ((select id from parts_catalog where part_number = '000-000-001'), (select id from vehicle_models where chassis_code is null and name = 'Model 3'), null, 'Fits Model 3'),
  -- Audi parts
  ((select id from parts_catalog where part_number = '315334814'), (select id from vehicle_models where chassis_code = 'B9'), 'Front', 'Fits A4 B9'),
  ((select id from parts_catalog where part_number = '06K115562'), (select id from vehicle_models where chassis_code = 'B9'), null, 'EA888 engine'),
  ((select id from parts_catalog where part_number = '5Q0616015T'), (select id from vehicle_models where chassis_code = 'B9'), 'Front', 'Fits A4 B9'),
  -- Subaru
  ((select id from parts_catalog where part_number = 'FA20-OF'), (select id from vehicle_models where chassis_code = 'VAB'), null, 'FA20F engine'),
  -- Mitsubishi
  ((select id from parts_catalog where part_number = '4B11-TB'), (select id from vehicle_models where chassis_code = 'CZ4A'), null, 'Fits Evo X 4B11T'),
  -- Nissan GT-R turbo
  ((select id from parts_catalog where part_number = 'VR38-TB'), (select id from vehicle_models where chassis_code = 'R35'), 'Right', 'Fits GT-R R35 RH side'),
  -- Suzuki
  ((select id from parts_catalog where part_number = 'K14C-SP'), (select id from vehicle_models where chassis_code = 'ZC33S'), null, 'K14C engine'),
  -- Mazda
  ((select id from parts_catalog where part_number = 'P5-VPS-TB'), (select id from vehicle_models where chassis_code = 'ND5RC'), null, '1.5L P5-VPS engine'),
  -- Lexus
  ((select id from parts_catalog where part_number = 'M20A-FXS-OF'), (select id from vehicle_models where chassis_code = 'ZA10'), null, 'M20A-FXS engine'),
  -- Mercedes W206
  ((select id from parts_catalog where part_number = 'W206-BP'), (select id from vehicle_models where chassis_code = 'W206'), 'Front', 'Fits C-Class W206'),
  -- Audi timing chain
  ((select id from parts_catalog where part_number = 'EA888-TB'), (select id from vehicle_models where chassis_code = 'B9'), null, 'EA888 Gen3'),
  -- Porsche windshield
  ((select id from parts_catalog where part_number = '992-WL'), (select id from vehicle_models where chassis_code = '992'), null, 'Fits 911 992'),
  -- Porsche oil filter 911
  ((select id from parts_catalog where part_number = 'MDC.AP.001'), (select id from vehicle_models where chassis_code = '992'), null, 'MDC.AP engine'),
  -- B58 oil filter
  ((select id from parts_catalog where part_number = 'B58-OF'), (select id from vehicle_models where chassis_code = 'DB42'), null, 'B58B30 engine - Supra GR')
on conflict do nothing;
