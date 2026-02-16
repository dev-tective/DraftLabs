-- Table definition for reference
-- create table public.rooms (
--   id uuid not null default gen_random_uuid (),
--   best_of smallint not null default '3'::smallint,
--   bans_per_team smallint not null default '3'::smallint,
--   created_at timestamp with time zone not null default now(),
--   game public.games not null default 'MLBB'::games,
--   user_id uuid null,
--   name text not null default 'Liga Amateur'::text,
--   is_live boolean not null default false,
--   constraint matchs_pkey primary key (id),
--   constraint matchs_user_id_fkey foreign KEY (user_id) references auth.users (id) on update CASCADE on delete CASCADE
-- ) TABLESPACE pg_default;

-- Drop old function to prevent signature conflicts
DROP FUNCTION IF EXISTS create_match_with_teams(UUID, SMALLINT, SMALLINT, public.games);

-- Stored procedure to create a room with 2 teams
CREATE OR REPLACE FUNCTION create_match_with_teams(
  p_user_id UUID,
  p_best_of SMALLINT DEFAULT 3,
  p_bans_per_team SMALLINT DEFAULT 3,
  p_game public.games DEFAULT 'MLBB'
)
RETURNS TABLE (
  room_id UUID,
  team1_id UUID,
  team2_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER 
AS $$
DECLARE
  v_room_id UUID;
  v_team1_id UUID;
  v_team2_id UUID;
  v_lane_id BIGINT;
  v_counter INTEGER := 1;
BEGIN
  -- Validar que el user_id no sea nulo
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'El user_id es obligatorio';
  END IF;

  -- Validar que el usuario exista en auth.users
  -- Nota: Esto requiere que el rol que ejecuta la función tenga permisos de lectura en auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'El usuario con ID % no existe', p_user_id;
  END IF;

  -- Insert the room and get the generated ID
  INSERT INTO public.rooms (best_of, bans_per_team, game, user_id)
  VALUES (p_best_of, p_bans_per_team, p_game, p_user_id)
  RETURNING id INTO v_room_id;
  
  -- Insert Team 1
  INSERT INTO public.teams (name, acronym, room_id)
  VALUES ('Team1', 'T1', v_room_id)
  RETURNING id INTO v_team1_id;
  
  -- Insert Team 2
  INSERT INTO public.teams (name, acronym, room_id)
  VALUES ('Team2', 'T2', v_room_id)
  RETURNING id INTO v_team2_id;
  
  -- Create players for each lane matching the game
  FOR v_lane_id IN SELECT id FROM public.lanes WHERE game = p_game LOOP
    -- Player for Team 1
    INSERT INTO public.players (nickname, lane_id, team_id)
    VALUES (concat('player', v_counter), v_lane_id, v_team1_id);
    -- Player for Team 2
    INSERT INTO public.players (nickname, lane_id, team_id)
    VALUES (concat('player', v_counter), v_lane_id, v_team2_id);
    v_counter := v_counter + 1;
  END LOOP;
  
  -- Return the IDs
  RETURN QUERY SELECT v_room_id, v_team1_id, v_team2_id;
END;
$$;

-- Example usage:
SELECT * FROM create_match_with_teams('e8ee3471-1e28-42d9-99af-f4159372a53c'::uuid, 5::smallint, 5::smallint, 'MLBB'::public.games);
