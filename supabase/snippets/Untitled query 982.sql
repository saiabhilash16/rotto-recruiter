SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.shortlist_people'::regclass
  AND contype IN ('p', 'u');