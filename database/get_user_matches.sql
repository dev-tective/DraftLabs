-- Function: public.get_user_matches(p_user_id uuid)
-- Returns all matches for a user with their associated teams as JSON

CREATE OR REPLACE FUNCTION public.get_user_matches(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    best_of smallint,
    bans_per_team smallint,
    created_at timestamp with time zone,
    game public.games,
    user_id uuid,
    name text,
    is_live boolean,
    teams jsonb
) 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
AS $$
  SELECT
    m.id,
    m.best_of,
    m.bans_per_team,
    m.created_at,
    m.game,
    m.user_id,
    m.name,
    m.is_live,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'acronym', t.acronym,
          'logo_url', t.logo_url,
          'coach', t.coach,
          'victories', t.victories
        )
      ) FILTER (WHERE t.id IS NOT NULL),
      '[]'::jsonb
    ) AS teams
  FROM public.matchs m
  LEFT JOIN public.teams t ON t.match_id = m.id
  WHERE m.user_id = p_user_id
  GROUP BY m.id
  ORDER BY m.created_at DESC;
$$;

-- Example usage:
-- SELECT * FROM get_user_matches('your-user-uuid-here'::uuid);
