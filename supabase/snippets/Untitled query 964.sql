SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('shortlists', 'shortlist_people')
ORDER BY tablename, policyname;