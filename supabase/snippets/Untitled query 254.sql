
SELECT
  format(
    E'Policy: %s\nTable: %s\nOperation: %s\nUSING: %s\nWITH CHECK: %s\n--------------------',
    policyname,
    tablename,
    cmd,
    COALESCE(qual, 'NULL'),
    COALESCE(with_check, 'NULL')
  ) AS policy_details
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('shortlists', 'shortlist_people')
ORDER BY tablename, policyname;
