import { Team } from "@/pages/match/components/Team";
import { Copy } from "@/components/Copy";
import { Match as MatchType, useMatch, useUpdateMatch } from "@/hooks/useMatches";
import { useMatchStore } from "@/stores/matchStore";
import { CutOutBtn, CutOutBtnPrimary } from "@/components/CutOutBtn";
import { useEffect, useRef } from "react";
import { ModalRef } from "@/layout/ModalLayout";
import { CreateMatchModal } from "@/components/modals/CreateMatchModal";
import { JoinLobbyModal } from "@/components/modals/JoinLobbyModal";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { WarningMessage } from "@/components/shared/WarningMessage";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useTagsStore } from "@/stores/tagsStore";
import { AlertType } from "@/stores/alertStore";

interface MatchEditorFieldProps {
    label: string;
    fieldId: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
}

const MatchEditorField = ({
    label,
    fieldId,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
}: MatchEditorFieldProps) => {
    const handleIncrement = () => {
        const newValue = value + step;
        if (newValue <= max) {
            onChange(newValue);
        }
    };

    const handleDecrement = () => {
        const newValue = value - step;
        if (newValue >= min) {
            onChange(newValue);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <label
                htmlFor={fieldId}
                className="uppercase text-sm font-medium text-slate-400"
            >
                {label}:
            </label>
            <div className="flex items-center gap-1">
                {/* Decrement Button */}
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={disabled || value <= min}
                    className={`
                        w-6 h-8 flex items-center justify-center
                        bg-slate-950
                        hover:bg-fuchsia-950/70 hover:border-fuchsia-500
                        border border-slate-700 rounded-l-lg
                        text-white font-bold text-lg
                        focus:outline-none focus:ring-2 focus:ring-fuchsia-500
                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-fuchsia-700/70
                        transition-all
                    `}
                >
                    -
                </button>

                {/* Input */}
                <input
                    id={fieldId}
                    type="text"
                    value={value}
                    readOnly
                    disabled={disabled}
                    className={`
                        w-12 h-8 px-2
                        bg-slate-800/20 border-y border-slate-700
                        text-white text-center font-semibold
                        pointer-events-none select-none
                        focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:z-10
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all
                    `}
                />

                {/* Increment Button */}
                <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={disabled || value >= max}
                    className={`
                        w-6 h-8 flex items-center justify-center
                        bg-slate-950
                        hover:bg-fuchsia-950/70 hover:border-fuchsia-500
                        border border-slate-700 rounded-r-lg
                        text-white font-bold text-lg
                        focus:outline-none focus:ring-2 focus:ring-fuchsia-500
                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-fuchsia-700/70
                        transition-all
                    `}
                >
                    +
                </button>
            </div>
        </div>
    );
}

const MatchContent = ({ match }: { match: MatchType }) => {
    const { id, teams, bans_per_team, best_of, game: gameType } = match;
    const [bansPerTeam, setBansPerTeam] = useState(bans_per_team);
    const [bestOf, setBestOf] = useState(best_of);
    const [game, setGame] = useState(gameType);

    const {
        mutateAsync: updateMatch,
        isPending: isUpdatingMatch,
        error: updateError
    } = useUpdateMatch();

    const handleUpdateMatch = async (field: 'bans_per_team' | 'best_of' | 'game', value: number | string) => {
        try {
            await updateMatch({
                id,
                [field]: field === 'game' ? value : Number(value)
            });
        } catch (error) {
            console.error('Error updating match:', error);
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Header with ID and Match Settings */}
            <div className="
                flex flex-col xl:flex-row items-start justify-between 
                gap-4 pb-4 
                border-b border-slate-700
            ">
                {/* Match ID */}
                <div className="flex hover:text-cyan-400 transition-colors w-full xl:w-auto">
                    <Icon
                        icon="mage:key-fill"
                        className="text-2xl mr-2"
                    />
                    <Copy
                        value={id}
                        copy={id}
                        alert={{
                            message: "Match ID has been copied to clipboard.",
                            type: AlertType.INFO
                        }}
                        className="font-semibold"
                    />
                </div>

                {/* Match Settings */}
                <div className="flex flex-wrap gap-4 items-center">
                    <MatchEditorField
                        label="Best of"
                        fieldId="best_of"
                        value={bestOf}
                        onChange={(value) => {
                            setBestOf(value);
                            handleUpdateMatch('best_of', value);
                        }}
                        min={1}
                        max={7}
                        step={2}
                        disabled={isUpdatingMatch}
                    />

                    <MatchEditorField
                        label="Bans per team"
                        fieldId="bans_per_team"
                        value={bansPerTeam}
                        onChange={(value) => {
                            setBansPerTeam(value);
                            handleUpdateMatch('bans_per_team', value);
                        }}
                        min={0}
                        max={10}
                        step={1}
                        disabled={isUpdatingMatch}
                    />

                    {/* Game Type */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="game" className="text-sm font-medium text-slate-400">
                            GAME:
                        </label>
                        <select
                            id="game"
                            value={game}
                            onChange={(e) => {
                                setGame(e.target.value as typeof gameType);
                                handleUpdateMatch('game', e.target.value);
                            }}
                            disabled={isUpdatingMatch}
                            className="
                                px-3 py-1
                                bg-slate-800 border border-slate-600 rounded
                                text-white font-semibold
                                focus:outline-none focus:ring-2 focus:ring-fuchsia-500
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all
                                cursor-pointer
                            "
                        >
                            <option value="MLBB">MLBB</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {updateError && (
                <div className="px-4">
                    <ErrorMessage
                        title="Error updating match"
                        message={updateError.message}
                    />
                </div>
            )}

            {/* Teams */}
            <div className="flex flex-col xl:flex-row flex-1 h-full gap-6">
                <Team
                    team={teams[0]}
                />
                <span className="
                    m-auto pr-1.5
                    h-24 w-24 
                    text-center content-center
                    font-bold italic text-2xl
                    border border-slate-700 bg-slate-900
                    rounded-full beveled
                ">
                    VS
                </span>
                <Team
                    team={teams[1]}
                    reverse
                />
            </div>
        </div>
    )
}

export const Match = () => {
    const currentMatchId = useMatchStore(state => state.currentMatchId);
    const { data: match, isLoading, error } = useMatch(currentMatchId || '');
    const { getLanes } = useTagsStore();

    const createMatchModalRef = useRef<ModalRef>(null);
    const joinLobbyModalRef = useRef<ModalRef>(null);

    useEffect(() => {
        if (!match) return;

        getLanes(match.game);
    }, [match]);


    return (
        <>
            <CreateMatchModal ref={createMatchModalRef} />
            <JoinLobbyModal ref={joinLobbyModalRef} />

            <div className="min-h-full flex flex-col relative">
                <div className="
                    sticky top-0 z-10
                    flex flex-col lg:flex-row   
                    w-full gap-4 p-4
                    bg-slate-950
                    border-b border-slate-700
                ">
                    <div className="flex-1 md:flex-none lg:w-md">
                        <CutOutBtnPrimary
                            icon="material-symbols:dashboard-customize"
                            text="create match"
                            onClick={() => createMatchModalRef.current?.open()}
                        />
                    </div>
                    <div className="flex gap-4 w-full lg:max-w-sm">
                        <CutOutBtn
                            icon="lsicon:warehouse-into-filled"
                            text="join lobby"
                            onClick={() => joinLobbyModalRef.current?.open()}
                        />
                    </div>
                </div>
                <div className="flex flex-1 w-11/12 space-y-10 mx-auto py-6 md:py-10">
                    {isLoading ? (
                        <div className="flex justify-center items-center w-full">
                            <LoadingSpinner
                                message="Loading match..."
                            />
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center w-full">
                            <ErrorMessage
                                title="Error loading match"
                                message={error.message}
                            />
                        </div>
                    ) : !match ? (
                        <div className="flex justify-center items-center w-full">
                            <WarningMessage
                                title="No match found"
                                message="No active match found. Create a new match or join an existing lobby."
                            />
                        </div>
                    ) : (
                        <MatchContent match={match} />
                    )}
                </div>
            </div>
        </>
    );
};
