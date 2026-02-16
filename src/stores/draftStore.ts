import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export enum Teams {
    BLUE = 'blue',
    RED = 'red',
}

interface DraftSlotManage {
    selectedSlot: DraftSlot | null;
    activeTeam: Teams;
}

// Type definition for draft slot
export interface DraftSlot {
    id: number;
    nickname: string;
    hero_id: number | null;
    draft_id: string;
    team: Teams;
    is_locked: boolean;
}

interface DraftStore {
    draftSlots: DraftSlot[];
    draftSlotManage: DraftSlotManage;
    channel: RealtimeChannel | null;
    loading: boolean;

    subscribeToDraft: (draftId: string) => void;
    unsubscribe: () => void;
    switchActiveTeam: (team: Teams) => void;
    updateSlot: (updates: Partial<Pick<DraftSlot, 'nickname' | 'hero_id' | 'is_locked'>>) => Promise<void>;
    lockedSlot: (slot: DraftSlot, updates: Partial<Pick<DraftSlot, 'is_locked'>>) => Promise<void>;
    resetDraft: () => void;
    setCurrentSlot: (slot: DraftSlot) => void;
    getDraftSlotsByTeam: (team: Teams) => DraftSlot[];
}

export const useDraftStore = create<DraftStore>((set, get) => ({
    activeTeam: Teams.BLUE,
    channel: null,
    draftSlots: [],
    draftSlotManage: {
        selectedSlot: null,
        activeTeam: Teams.BLUE,
    },
    loading: false,

    getDraftSlotsByTeam: (team: Teams) => {
        return get().draftSlots.filter((slot) => slot.team === team);
    },

    switchActiveTeam: (team: Teams) => {
        set({
            draftSlotManage: {
                activeTeam: team,
                selectedSlot: getSelectedSlot([...get().draftSlots], team),
            }
        });
    },

    setCurrentSlot: (slot: DraftSlot) => {
        set({
            draftSlotManage: {
                selectedSlot: slot,
                activeTeam: slot.team,
            }
        });
    },

    subscribeToDraft: (draftId: string) => {
        // Unsubscribe from previous channel if exists
        const currentChannel = get().channel;

        if (currentChannel) {
            currentChannel.unsubscribe();
        }

        // Create a new channel
        const channel = supabase
            .channel(`picks:picks_id=eq.${draftId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Subscribe to all events: INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'picks',
                    filter: `picks_id=eq.${draftId}`,
                },
                (payload) => {
                    console.log('Real-time event:', payload);

                    if (payload.eventType === 'INSERT')
                        addSlotToTeam(set, payload.new as DraftSlot);

                    else if (payload.eventType === 'UPDATE') {
                        updateSlotInTeam(set, payload.new as DraftSlot);

                        // Update team-specific slot IDs
                        const draftSlotManage = get().draftSlotManage;
                        const selectedSlot = getSelectedSlot(get().draftSlots, draftSlotManage.activeTeam);

                        set({
                            draftSlotManage: {
                                activeTeam: selectedSlot ? selectedSlot.team : draftSlotManage.activeTeam,
                                selectedSlot,
                            }
                        });
                    }

                    else if (payload.eventType === 'DELETE')
                        removeSlotFromTeam(set, payload.old as DraftSlot);
                }
            )
            .subscribe();

        set({ channel });

        // Load initial data
        supabase
            .from('draft_slots')
            .select('*')
            .eq('draft_id', draftId)
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error loading draft slots:', error);
                } else {
                    const draftSlots = data as DraftSlot[];

                    set({
                        draftSlots,
                        draftSlotManage: {
                            activeTeam: Teams.BLUE,
                            selectedSlot: getSelectedSlot(draftSlots),
                        }
                    });
                }
            });
    },

    unsubscribe: () => {
        const channel = get().channel;
        if (channel) {
            channel.unsubscribe();
            set({ channel: null, draftSlots: [] });
        }
    },

    // Actualiza un slot
    updateSlot: async (updates: Partial<Pick<DraftSlot, 'nickname' | 'hero_id' | 'is_locked'>>) => {
        const selectedSlot = get().draftSlotManage.selectedSlot;

        if (!selectedSlot) {
            throw new Error('No current slot ID found');
        }

        const { error } = await supabase
            .from('draft_slots')
            .update(updates)
            .eq('id', selectedSlot.id);

        if (error) {
            console.error('Error updating slot:', error);
            throw error;
        }
    },

    // Bloquear un slot
    lockedSlot: async (slot: DraftSlot, updates: Partial<Pick<DraftSlot, 'is_locked'>>) => {
        const { error } = await supabase
            .from('draft_slots')
            .update(updates)
            .eq('id', slot.id);

        if (error) {
            console.error('Error updating slot:', error);
            throw error;
        }
    },

    resetDraft: async () => {
        try {
            set({ loading: true });
            const { error } = await supabase
                .from('draft_slots')
                .update({ hero_id: null, is_locked: false })
                .eq('draft_id', '9f7b47de-0ad7-4b94-b61d-0e8291421088');

            if (error) {
                console.error('Error resetting draft:', error);
                throw error;
            }
        } finally {
            set({ loading: false });
        }
    },
}));

const getSelectedSlot = (draftSlots: DraftSlot[], team: Teams = Teams.BLUE): DraftSlot | null => {
    const selectedSlot = draftSlots.find(
        (slot) => slot.team === team && !slot.is_locked && !slot.hero_id
    );

    if (selectedSlot) return selectedSlot;

    // Si no hay slot disponible, buscar en el equipo contrario
    const oppositeTeam = team === Teams.BLUE ? Teams.RED : Teams.BLUE;

    return draftSlots.find(
        (slot) => slot.team === oppositeTeam && !slot.is_locked && !slot.hero_id
    ) ?? null;
};

// Helper functions for team-based slot operations
const addSlotToTeam = (set: any, slot: DraftSlot) => {
    if (slot.team === Teams.BLUE) {
        set((state: DraftStore) => ({
            draftSlots: [...state.draftSlots, slot],
        }));
    } else if (slot.team === Teams.RED) {
        set((state: DraftStore) => ({
            draftSlots: [...state.draftSlots, slot],
        }));
    }
};

const updateSlotInTeam = (set: any, slot: DraftSlot) => {
    if (slot.team === Teams.BLUE) {
        set((state: DraftStore) => ({
            draftSlots: state.draftSlots.map((s) =>
                s.id === slot.id ? slot : s
            ),
        }));
    } else if (slot.team === Teams.RED) {
        set((state: DraftStore) => ({
            draftSlots: state.draftSlots.map((s) =>
                s.id === slot.id ? slot : s
            ),
        }));
    }
};

const removeSlotFromTeam = (set: any, slot: DraftSlot) => {
    if (slot.team === Teams.BLUE) {
        set((state: DraftStore) => ({
            draftSlots: state.draftSlots.filter((s) => s.id !== slot.id),
        }));
    } else if (slot.team === Teams.RED) {
        set((state: DraftStore) => ({
            draftSlots: state.draftSlots.filter((s) => s.id !== slot.id),
        }));
    }
};