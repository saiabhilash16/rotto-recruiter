
BEGIN;

SET LOCAL ROLE authenticated;

SELECT set_config(
  'request.jwt.claim.sub',
  '65cab987-53dd-4123-8465-8dc7af7577d4',
  true
);

SELECT
  s.name,
  s.company_id,
  s.recruiter_id
FROM public.shortlists s
ORDER BY s.created_at DESC;

ROLLBACK;
