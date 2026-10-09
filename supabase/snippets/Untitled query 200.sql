
BEGIN;

SET LOCAL ROLE authenticated;

SELECT set_config(
  'request.jwt.claim.sub',
  'ba49b7b0-df86-4f44-8cd1-61e9a7ee8a79',
  true
);

SELECT
  s.name,
  s.company_id,
  s.recruiter_id
FROM public.shortlists s
ORDER BY s.created_at DESC;

ROLLBACK;
