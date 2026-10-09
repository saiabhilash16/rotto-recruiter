
SELECT
  s.name AS shortlist_name,
  sp.candidate_id,
  c.name AS candidate_name,
  sp.created_at
FROM public.shortlist_people sp
JOIN public.shortlists s
  ON s.id = sp.shortlist_id
JOIN public.candidates c
  ON c.id = sp.candidate_id
WHERE sp.candidate_id = 'cand_0014'
  AND s.recruiter_id =
    '65cab987-53dd-4123-8465-8dc7af7577d4';
