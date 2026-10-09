SELECT company_id
FROM public.recruiters
WHERE user_id = (SELECT auth.uid());