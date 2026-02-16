import { create } from "zustand";
import { Game } from "../hooks/useMatches";
import { supabase } from "../supabaseClient";

export interface Tag {
    id: number;
    name: string;
    game: Game;
    image?: string;
    created_at: string;
}

interface TagsStore {
    lanes: Tag[];
    selectedLane: number;
    loading: boolean;
    error: string | null;

    getLanes: (game: Game) => Promise<void>;
    findLane: (id: string) => Tag | undefined;
}

export const useTagsStore = create<TagsStore>((set, get) => ({
    lanes: [],
    selectedLane: 0,
    loading: false,
    error: null,

    getLanes: async (game: Game = Game.MLBB) => {
        set({
            loading: true,
            error: null
        });

        try {
            const { data, error } = await supabase
                .from('lanes')
                .select('*')
                .order('name', { ascending: true })
                .eq('game', game);
            
            if (error) throw error;
            
            set({
                lanes: data || [],
                loading: false,
                error: null,
                selectedLane: 0
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Error al cargar datos',
                loading: false,
                lanes: [],
                selectedLane: 0
            });
        }
    },

    findLane: (id: string) => {
        return get().lanes.find((lane) => lane.id === Number(id));
    }
}))