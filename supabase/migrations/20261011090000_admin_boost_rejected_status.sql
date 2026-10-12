-- Enum additions must commit before the next migration uses the new value.
ALTER TYPE public.boosting_status ADD VALUE IF NOT EXISTS 'rejected';
