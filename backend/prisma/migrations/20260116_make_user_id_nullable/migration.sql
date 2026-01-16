-- Make user_id nullable in addresses table for guest checkouts
ALTER TABLE addresses ALTER COLUMN user_id DROP NOT NULL;
