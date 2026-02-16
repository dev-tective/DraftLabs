import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MatchState {
    currentMatchId: string | null;

    setCurrentMatchId: (id: string | null) => void;
    clearCurrentMatchId: () => void;
}

export const useMatchStore = create<MatchState>()(
    persist(
        (set) => ({
            currentMatchId: null,

            setCurrentMatchId: (id: string | null) => {
                set({ currentMatchId: id });
            },

            clearCurrentMatchId: () => {
                set({ currentMatchId: null });
            },
        }),
        {
            name: 'match-storage',
            partialize: (state) => ({
                currentMatchId: state.currentMatchId
            })
        }
    )
)