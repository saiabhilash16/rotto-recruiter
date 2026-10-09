
SELECT
  u.email,
  r.user_id,
  r.company_id,
  CASE
    WHEN r.company_id =
      '72cc0e12-5671-4021-862c-81809f873972'
      THEN 'Acme'
    WHEN r.company_id =
      '0083f4e1-3f25-4151-abd1-940d5343210c'
      THEN 'Globex'
    ELSE 'Unknown'
  END AS company_name
FROM public.recruiters r
JOIN auth.users u
  ON u.id = r.user_id
WHERE u.email IN (
  'recruiter@acme.test',
  'recruiter@globex.test'
);
