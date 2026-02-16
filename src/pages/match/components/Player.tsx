import { Icon } from "@iconify/react";
import { useRef } from "react";
import { EditPlayerModal } from "../../../components/modals/EditPlayerModal";
import { Player as PlayerType } from "../../../hooks/useMatches";
import { ModalRef } from "../../../layout/ModalLayout";
import { useMatchStore } from "../../../stores/matchStore";
import { useDeletePlayer } from "../../../hooks/useTeams";
import { AlertType, useAlertStore } from "@/stores/alertStore";

const DEFAULT_IMAGE = "ui/silueta.png";

interface PlayerProps {
    player: PlayerType;
}

export const Player = ({ player }: PlayerProps) => {
    const editPlayerModalRef = useRef<ModalRef>(null);

    const matchId = useMatchStore((state) => state.currentMatchId);
    const { mutate: deletePlayer, isPending: isDeleting } = useDeletePlayer(matchId || '');
    const addAlert = useAlertStore((state) => state.addAlert);

    const handleDelete = () => {
        if (isDeleting) return;

        deletePlayer(player.id);
    };

    return (
        <>
            <EditPlayerModal
                ref={editPlayerModalRef}
                player={player}
                teamId={player.team_id}
            />

            <div
                className={`
                relative flex items-center gap-5
                w-full
                p-3
                border beveled-br-tl 
                rounded-br-2xl 
                bg-slate-700/20
            `}
            >
                <div className="h-15 aspect-square overflow-hidden bg-white">
                    <img
                        src={player.image_url || DEFAULT_IMAGE}
                        alt={player.nickname}
                        className="object-cover"
                    />
                </div>
                <div className="uppercase">
                    <h1 className="text-lg font-semibold text-slate-200">
                        {player.nickname}
                    </h1>
                    <p className={`
                    text-sm tracking-wider 
                    text-slate-400
                `}>
                        {player?.lanes?.name || 'No lane'}
                    </p>
                </div>
                <Icon
                    icon="ri:edit-fill"
                    width="25"
                    height="25"
                    onClick={() => editPlayerModalRef.current?.open()}
                    className="
                    inline-block
                    ml-auto
                    cursor-pointer
                    text-slate-200
                    hover:text-cyan-400 transition-colors
                "
                />

                <button
                    onClick={() => addAlert({
                        message: 'Do you want to eliminate this player?',
                        type: AlertType.WARNING,
                        handleAction: () => handleDelete()
                    })}
                    disabled={isDeleting}
                    className="
                        absolute -top-3 -right-3 
                        bg-slate-500 rounded-full p-0.5 
                        hover:bg-fuchsia-600 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    <Icon
                        icon="mdi:close"
                        width="25"
                        height="25"
                        className="
                            cursor-pointer
                            text-slate-100
                        "
                    />
                </button>
            </div>
        </>
    );
};
