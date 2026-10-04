-- PostgreSQL cannot use a newly added enum value until this migration commits.
ALTER TYPE public.boosting_status ADD VALUE 'pending';
