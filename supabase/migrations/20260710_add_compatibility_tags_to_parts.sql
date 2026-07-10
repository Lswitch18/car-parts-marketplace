-- Migration: add compatibility_tags to parts table
ALTER TABLE parts ADD COLUMN IF NOT EXISTS compatibility_tags text[] DEFAULT '{}'::text[];
