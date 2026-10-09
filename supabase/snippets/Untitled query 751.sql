
SELECT
  row_number() OVER () AS line_number,
  line AS code_line
FROM regexp_split_to_table(
  pg_get_functiondef(
    'public.current_company_id()'::regprocedure
  ),
  E'\n'
) AS line;
