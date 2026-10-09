
INSERT INTO public.shortlists (
  company_id,
  recruiter_id,
  name
)
VALUES (
  '72cc0e12-5671-4021-862c-81809f873972',
  '65cab987-53dd-4123-8465-8dc7af7577d4',
  'My First Shortlist'
)
RETURNING *;
