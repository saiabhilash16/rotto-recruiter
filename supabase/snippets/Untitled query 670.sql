
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  p.polname AS policy_name,
  CASE p.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    ELSE 'ALL'
  END AS operation,
  pg_get_expr(p.polqual, p.polrelid) AS using_condition,
  pg_get_expr(p.polwithcheck, p.polrelid) AS check_condition
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('shortlists', 'shortlist_people')
ORDER BY c.relname, p.polname;
