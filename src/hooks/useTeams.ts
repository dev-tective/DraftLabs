import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/supabaseClient";
import { Match, Team, Player } from "./useMatches";
import { AlertType, useAlertStore } from "@/stores/alertStore";

/**
 * Hook para crear un equipo con jugadores usando RPC atómico
 * Actualiza el caché del match con el nuevo equipo
 */
export const useCreateTeam = (matchId: string) => {
    const queryClient = useQueryClient();
    const addAlert = useAlertStore((state) => state.addAlert);

    return useMutation({
        mutationFn: async (params: {
            name: string;
            acronym: string;
            logo_url?: string;
            coach?: string;
            players?: Array<{
                nickname: string;
                image_url?: string;
                lane_id?: string;
            }>;
        }) => {
            // Crear equipo con jugadores usando RPC atómico
            const { data, error } = await supabase.rpc('create_team_with_players', {
                p_match_id: matchId,
                p_name: params.name,
                p_acronym: params.acronym,
                p_logo_url: params.logo_url,
                p_coach: params.coach,
                p_players: params.players || []
            });

            if (error) {
                console.error('Error creating team:', error);
                addAlert({
                    message: 'Error creating team',
                    type: AlertType.ERROR,
                });
                throw error;
            }

            return data as Team;
        },
        onSuccess: (newTeam) => {
            // Actualizar el caché del match con el nuevo equipo
            queryClient.setQueryData<Match>(["match", matchId], (oldMatch) => {
                if (!oldMatch) return oldMatch;

                return {
                    ...oldMatch,
                    teams: [...(oldMatch.teams || []), newTeam],
                };
            });

            addAlert({
                message: 'Team created successfully',
                type: AlertType.SUCCESS,
            });

            // Invalidar la lista de matches
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
    });
};

/**
 * Hook para actualizar un equipo existente
 * Actualiza el caché del match con los datos del equipo actualizado
 */
export const useUpdateTeam = (matchId: string) => {
    const queryClient = useQueryClient();
    const addAlert = useAlertStore((state) => state.addAlert);

    return useMutation({
        mutationFn: async (params: {
            id: string;
            name?: string;
            acronym?: string;
            logo_url?: string | null;
            coach?: string | null;
        }) => {
            const { id, ...updateData } = params;

            const { data, error } = await supabase
                .from('teams')
                .update(updateData)
                .eq('id', id)
                .select(`
                    *,
                    players (
                        *,
                        lanes (*)
                    )
                `)
                .single();

            if (error) {
                console.error('Error updating team:', error);
                addAlert({
                    message: 'Error updating team',
                    type: AlertType.ERROR,
                });
                throw error;
            }

            addAlert({
                message: 'Team updated successfully',
                type: AlertType.SUCCESS,
            });

            return data as Team;
        },
        onMutate: async (params) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["match", matchId] });

            // Snapshot the previous value
            const previousMatch = queryClient.getQueryData<Match>(["match", matchId]);

            // Optimistically update the cache
            if (previousMatch) {
                queryClient.setQueryData<Match>(["match", matchId], {
                    ...previousMatch,
                    teams: previousMatch.teams?.map(team =>
                        team.id === params.id
                            ? {
                                ...team,
                                name: params.name ?? team.name,
                                acronym: params.acronym ?? team.acronym,
                                logo_url: params.logo_url ?? team.logo_url,
                                coach: params.coach ?? team.coach,
                            }
                            : team
                    ) || [],
                });
            }

            return { previousMatch };
        },
        onError: (_err, _params, context) => {
            // Rollback to the previous value on error
            if (context?.previousMatch) {
                queryClient.setQueryData(["match", matchId], context.previousMatch);
            }
            addAlert({
                message: 'Error updating team',
                type: AlertType.ERROR,
            });
        },
        onSuccess: (updatedTeam) => {
            // Update the match cache with the updated team
            queryClient.setQueryData<Match>(["match", matchId], (oldMatch) => {
                if (!oldMatch) return oldMatch;

                return {
                    ...oldMatch,
                    teams: oldMatch.teams?.map(team =>
                        team.id === updatedTeam.id ? updatedTeam : team
                    ) || [],
                };
            });

            // Invalidate the matches list
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
    });
};

/**
 * Hook para eliminar un equipo
 * Actualiza el caché del match removiendo el equipo
 */
export const useDeleteTeam = (matchId: string) => {
    const queryClient = useQueryClient();
    const addAlert = useAlertStore((state) => state.addAlert);

    return useMutation({
        mutationFn: async (teamId: string) => {
            const { error } = await supabase
                .from('teams')
                .delete()
                .eq('id', teamId);

            if (error) {
                addAlert({
                    message: 'Error deleting team',
                    type: AlertType.ERROR,
                });
                throw error;
            }

            return teamId;
        },
        onSuccess: (deletedTeamId) => {
            // Actualizar el caché del match removiendo el equipo
            queryClient.setQueryData<Match>(["match", matchId], (oldMatch) => {
                if (!oldMatch) return oldMatch;

                return {
                    ...oldMatch,
                    teams: oldMatch.teams?.filter(team => team.id !== deletedTeamId) || [],
                };
            });

            addAlert({
                message: 'Team deleted successfully',
                type: AlertType.SUCCESS,
            });

            // Invalidar la lista de matches
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
    });
};

/**
 * Hook para crear un jugador en un equipo
 * Actualiza el caché del match agregando el jugador al equipo correspondiente
 */
export const useCreatePlayer = (matchId: string) => {
    const queryClient = useQueryClient();
    const addAlert = useAlertStore((state) => state.addAlert);

    return useMutation({
        mutationFn: async (params: {
            nickname: string;
            team_id: string;
            image_url?: string | null;
            lane_id?: number | null;
        }) => {
            const { data, error } = await supabase
                .from('players')
                .insert({
                    nickname: params.nickname,
                    team_id: params.team_id,
                    image_url: params.image_url,
                    lane_id: params.lane_id,
                })
                .select(`
                    *,
                    lanes(*)
                `)
                .single();

            if (error) {
                console.error('Error creating player:', error);
                addAlert({
                    message: 'Error creating player',
                    type: AlertType.ERROR,
                });
                throw error;
            }

            return data as Player;
        },
        onSuccess: (newPlayer) => {
            // Actualizar el caché del match con el nuevo jugador
            queryClient.setQueryData<Match>(["match", matchId], (oldMatch) => {
                if (!oldMatch) return oldMatch;

                return {
                    ...oldMatch,
                    teams: oldMatch.teams?.map(team =>
                        team.id === newPlayer.team_id
                            ? {
                                ...team,
                                players: [...(team.players || []), newPlayer],
                            }
                            : team
                    ) || [],
                };
            });

            addAlert({
                message: 'Player created successfully',
                type: AlertType.SUCCESS,
            });

            // Invalidar la lista de matches
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
    });
};

/**
 * Hook para actualizar un jugador existente
 * Actualiza el caché del match con los datos del jugador actualizado
 */
export const useUpdatePlayer = (matchId: string) => {
    const queryClient = useQueryClient();
    const addAlert = useAlertStore((state) => state.addAlert);

    return useMutation({
        mutationFn: async (params: {
            id: string;
            nickname?: string;
            image_url?: string | null;
            lane_id?: number | null;
        }) => {
            const { id, ...updateData } = params;

            const { data, error } = await supabase
                .from('players')
                .update(updateData)
                .eq('id', id)
                .select(`
                    *,
                    lanes(*)
                `)
                .single();

            if (error) {
                console.error('Error updating player:', error);
                addAlert({
                    message: 'Error updating player',
                    type: AlertType.ERROR,
                });
                throw error;
            }

            addAlert({
                message: 'Player updated successfully',
                type: AlertType.SUCCESS,
            });

            return data as Player;
        },
        onMutate: async (params) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["match", matchId] });

            // Snapshot the previous value
            const previousMatch = queryClient.getQueryData<Match>(["match", matchId]);

            // Optimistically update the cache
            if (previousMatch) {
                queryClient.setQueryData<Match>(["match", matchId], {
                    ...previousMatch,
                    teams: previousMatch.teams?.map(team => ({
                        ...team,
                        players: team.players?.map(player =>
                            player.id === params.id
                                ? {
                                    ...player,
                                    nickname: params.nickname ?? player.nickname,
                                    image_url: params.image_url ?? player.image_url,
                                    lane_id: params.lane_id ?? player.lane_id,
                                }
                                : player
                        ) || [],
                    })) || [],
                });
            }

            return { previousMatch };
        },
        onError: (_err, _params, context) => {
            // Rollback to the previous value on error
            if (context?.previousMatch) {
                queryClient.setQueryData(["match", matchId], context.previousMatch);
            }
            addAlert({
                message: 'Error updating player',
                type: AlertType.ERROR,
            });
        },
        onSuccess: (updatedPlayer) => {
            // Update the match cache with the updated player
            queryClient.setQueryData<Match>(["match", matchId], (oldMatch) => {
                if (!oldMatch) return oldMatch;

                return {
                    ...oldMatch,
                    teams: oldMatch.teams?.map(team => ({
                        ...team,
                        players: team.players?.map(player =>
                            player.id === updatedPlayer.id ? updatedPlayer : player
                        ) || [],
                    })) || [],
                };
            });

            // Invalidate the matches list
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
    });
};

/**
 * Hook para eliminar un jugador
 * Actualiza el caché del match removiendo el jugador del equipo
 */
export const useDeletePlayer = (matchId: string) => {
    const queryClient = useQueryClient();
    const addAlert = useAlertStore((state) => state.addAlert);

    return useMutation({
        mutationFn: async (playerId: string) => {
            const { error } = await supabase
                .from('players')
                .delete()
                .eq('id', playerId);

            if (error) {
                addAlert({
                    message: 'Error deleting player',
                    type: AlertType.ERROR,
                });
                throw error;
            }

            return playerId;
        },
        onSuccess: (deletedPlayerId) => {
            // Actualizar el caché del match removiendo el jugador
            queryClient.setQueryData<Match>(["match", matchId], (oldMatch) => {
                if (!oldMatch) return oldMatch;

                return {
                    ...oldMatch,
                    teams: oldMatch.teams?.map(team => ({
                        ...team,
                        players: team.players?.filter(player => player.id !== deletedPlayerId) || [],
                    })) || [],
                };
            });

            addAlert({
                message: 'Player deleted successfully',
                type: AlertType.SUCCESS,
            });

            // Invalidar la lista de matches
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
    });
};