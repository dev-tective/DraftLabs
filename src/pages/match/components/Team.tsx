import { useRef } from "react";
import { Team as TeamType } from "@/hooks/useMatches";
import { Icon } from "@iconify/react";
import { EditTeamModal } from "@/components/modals/EditTeamModal";
import { CreateTeamModal } from "@/components/modals/CreateTeamModal";
import { ModalRef } from "@/layout/ModalLayout";
import { Player } from "@/pages/match/components/Player";
import { EditPlayerModal } from "@/components/modals/EditPlayerModal";
import { useDeleteTeam } from "@/hooks/useTeams";
import { useMatchStore } from "@/stores/matchStore";
import { AlertType, useAlertStore } from "@/stores/alertStore";

const DEFAULT_LOGO = "ui/team-logo.png";

interface Props {
    team?: TeamType;
    reverse?: boolean;
}
export const Team = ({ team, reverse = false }: Props) => {
    const createTeamModalRef = useRef<ModalRef>(null);
    const editTeamModalRef = useRef<ModalRef>(null);
    const createPlayerModalRef = useRef<ModalRef>(null);

    const matchId = useMatchStore((state) => state.currentMatchId);
    const { mutate: deleteTeam } = useDeleteTeam(matchId || '');
    const addAlert = useAlertStore((state) => state.addAlert);

    const handleDeleteTeam = () => {
        if (!team) return;
        deleteTeam(team.id);
    };

    // Pass the roomId from team prop if available (via players) or we might need another way if team doesn't have it directly.
    // Looking at useUpdateTeam hook, it expects a room_id. The Team type has room_id.

    if (!team) return (
        <>
            <CreateTeamModal ref={createTeamModalRef} />
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <button
                    onClick={() => createTeamModalRef.current?.open()}
                    className="
                        w-20 h-20 rounded-full
                        border-2 border-dashed
                        flex items-center justify-center
                        transition-all
                        text-slate-200
                        border-slate-600
                        hover:border-slate-200
                    "
                >
                    <Icon icon="mdi:plus" className="text-4xl" />
                </button>
                <span className="text-slate-200">Create Team</span>
            </div>
        </>
    );

    return (
        <>
            <EditTeamModal
                ref={editTeamModalRef}
                team={team}
            />

            <EditPlayerModal
                ref={createPlayerModalRef}
                player={{
                    id: '',
                    nickname: '',
                    team_id: team.id,
                    created_at: '',
                }}
                teamId={team.id}
                createMode
            />

            <div className={`
                relative flex-1 flex
                border
                bg-slate-900/30
                after:content-['']
                after:absolute
                after:w-1
                after:h-1/2
                after:top-1/2
                after:-translate-y-1/2
                after:bg-slate-500
                text-slate-700
                ${reverse ?
                    'beveled-br-tl rounded-tl-3xl rounded-br-3xl after:right-0'
                    : 'beveled-bl-tr rounded-tr-3xl rounded-bl-3xl after:left-0'}
            `}>

                <div className="
                        flex-1 flex flex-col
                        p-8 gap-8
                    ">
                    <div className={`
                        flex items-center justify-between
                        pb-5
                        border-b
                        ${reverse && 'flex-row-reverse'}
                    `}>
                        <div className={`flex items-center gap-3 ${reverse && 'flex-row-reverse'}`}>
                            <div className="space-y-2">
                                <Icon
                                    icon="mdi:close-bold"
                                    width="25"
                                    height="25"
                                    onClick={() => addAlert({
                                        message: 'Do you want to delete this team?',
                                        type: AlertType.WARNING,
                                        duration: 10000,
                                        handleAction: handleDeleteTeam
                                    })}
                                    className="
                                        cursor-pointer
                                        text-slate-200
                                        hover:text-fuchsia-500 transition-colors
                                    "
                                />
                                <Icon
                                    icon="ri:edit-fill"
                                    width="25"
                                    height="25"
                                    onClick={() => editTeamModalRef.current?.open()}
                                    className="
                                    cursor-pointer
                                    text-slate-200
                                    hover:text-cyan-400 transition-colors
                                "
                                />
                            </div>
                            <div className={`flex flex-col ${reverse && 'items-end'}`}>
                                <h1 className={`
                                text-2xl font-bold
                                italic tracking-wider uppercase
                                text-slate-200
                            `}>
                                    {team.name}
                                </h1>

                                <h2 className={`text-lg font-semibold uppercase text-slate-200`}>
                                    <span className="mr-2 text-slate-400">
                                        Coach:
                                    </span>
                                    {team.coach}
                                </h2>
                            </div>
                        </div>

                        <div className="h-12 aspect-square">
                            <img
                                src={team.logo_url || DEFAULT_LOGO}
                                alt={team.name}
                                className="object-cover h-full mx-auto"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <button
                            onClick={() => createPlayerModalRef.current?.open()}
                            className="
                            relative flex items-center justify-center 
                            gap-5 w-full py-4
                            border-2 border-dashed beveled-br-tl 
                            rounded-br-2xl 
                            bg-slate-700/10 opacity-70 
                            hover:opacity-100 transition-opacity
                        "
                        >
                            <Icon
                                icon="mdi:plus"
                                width="40"
                                height="40"
                                className="text-slate-200"
                            />
                        </button>
                        {team.players.map((player) => (
                            <Player
                                key={player.id}
                                player={player}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}