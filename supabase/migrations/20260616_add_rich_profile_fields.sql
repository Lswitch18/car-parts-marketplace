-- Alter table profiles to add rich user metadata fields for database completeness
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birthdate DATE,
ADD COLUMN IF NOT EXISTS card_brand VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
