import { forwardRef, useState } from "react";
import { Icon } from "@iconify/react";
import { ModalLayout, ModalRef } from "@/layout/ModalLayout";
import { useScraperTeam, ScrapedTeam } from "@/hooks/useScraperTeam";
import { useCreateTeam } from "@/hooks/useTeams";
import { useMatchStore } from "@/stores/matchStore";

interface PlayerInputProps {
    nickname: string;
    index: number;
    updatePlayerNickname: (index: number, nickname: string) => void;
    removePlayer: (index: number) => void;
}

const PlayerInput = ({ nickname, index, updatePlayerNickname, removePlayer }: PlayerInputProps) => {
    return (
        <div className="relative group">
            <input
                type="text"
                value={nickname}
                onChange={(e) => updatePlayerNickname(index, e.target.value)}
                placeholder="Player name"
                className="
                    w-full
                    px-3 py-2
                    bg-slate-800/50
                    border border-slate-700
                    rounded-lg
                    text-sm text-slate-300
                    tracking-wider
                    placeholder:text-slate-600
                    focus:outline-none
                    focus:border-fuchsia-500
                    focus:bg-slate-800
                    transition-colors
                "
            />
            <button
                onClick={() => removePlayer(index)}
                className="
                    absolute -top-2 -right-2
                    w-6 h-6
                    bg-fuchsia-500/80
                    hover:bg-fuchsia-500
                    rounded-full
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100
                    transition-opacity
                    text-white
                "
                title="Remove player"
            >
                <Icon icon="mdi:close" className="text-sm" />
            </button>
        </div>
    );
};

interface SectionProps {
    title: string;
    icon: string;
    iconColor?: string;
    children: React.ReactNode;
}

const Section = ({ title, icon, iconColor = 'text-cyan-400', children }: SectionProps) => {
    return (
        <div className="space-y-4">
            <h2 className="
                flex items-center
                text-xs md:text-sm 
                text-slate-200 uppercase tracking-widest
            ">
                <Icon
                    icon={icon}
                    className={`text-lg md:text-2xl mr-3 ${iconColor}`}
                />
                {title}
            </h2>
            {children}
        </div>
    );
};

export const CreateTeamModal = forwardRef<ModalRef, { }>((_, ref) => {
    const [teamUrl, setTeamUrl] = useState("");
    const [scrapedTeam, setScrapedTeam] = useState<ScrapedTeam>({
        name: "",
        acronym: "",
        logo_url: "",
        players: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hook for creating team
    const matchId = useMatchStore((state) => state.currentMatchId);
    const { mutate: createTeam, isPending: isCreating, error: createError } = useCreateTeam(matchId || '');

    const handleScrape = async () => {
        if (!teamUrl.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const data = await useScraperTeam(teamUrl.trim());
            setScrapedTeam(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching team data');
        } finally {
            setLoading(false);
        }
    };

    // Métodos para actualizar datos específicos de scrapedTeam
    const updatePlayerNickname = (index: number, newNickname: string) => {
        const updatedPlayers = [...scrapedTeam.players];
        updatedPlayers[index] = { ...updatedPlayers[index], nickname: newNickname };

        setScrapedTeam({
            ...scrapedTeam,
            players: updatedPlayers
        });
    };

    const updateTeamName = (newName: string) => {
        setScrapedTeam({ ...scrapedTeam, name: newName });
    };

    const updateTeamAcronym = (newAcronym: string) => {
        setScrapedTeam({ ...scrapedTeam, acronym: newAcronym });
    };

    const addPlayer = () => {
        setScrapedTeam({
            ...scrapedTeam,
            players: [{ nickname: "" }, ...scrapedTeam.players]
        });
    };

    const removePlayer = (index: number) => {
        const updatedPlayers = scrapedTeam.players.filter((_, i) => i !== index);
        setScrapedTeam({
            ...scrapedTeam,
            players: updatedPlayers
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleScrape();
        }
    };

    const handleCreateTeam = () => {
        if (!scrapedTeam.name.trim() || !scrapedTeam.acronym.trim()) return;

        // Format players data - filter out empty nicknames
        const formattedPlayers = scrapedTeam.players
            .filter(p => p.nickname.trim())
            .map(p => ({
                nickname: p.nickname.trim(),
            }));

        createTeam({
            name: scrapedTeam.name.trim(),
            acronym: scrapedTeam.acronym.trim(),
            logo_url: scrapedTeam.logo_url || undefined,
            players: formattedPlayers.length > 0 ? formattedPlayers : undefined,
        }, {
            onSuccess: () => {
                // Close modal and reset form
                ref && typeof ref !== 'function' && ref.current?.close();
                setTeamUrl("");
                setScrapedTeam({
                    name: "",
                    acronym: "",
                    logo_url: "",
                    players: []
                });
                setError(null);
            },
            onError: (err) => {
                setError(err instanceof Error ? err.message : 'Error creating team');
            }
        });
    };

    return (
        <ModalLayout ref={ref}>
            <div className="
                absolute flex flex-col
                max-w-2xl w-10/12
                p-5 md:p-8 gap-6
                rounded-tr-3xl rounded-bl-3xl
                beveled-bl-tr border beveled
                bg-slate-950 border-cyan-800 
                max-h-[90vh] overflow-y-auto
            ">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl md:text-2xl text-slate-200 uppercase tracking-widest font-bold italic">
                            Create Team
                        </h1>
                        <p className="text-cyan-500 text-xs md:text-sm tracking-wider uppercase">
                            Enter team URL
                        </p>
                    </div>
                    <button
                        onClick={() => ref && typeof ref !== 'function' && ref.current?.close()}
                        className="text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                        <Icon icon="mdi:close" className="text-3xl" />
                    </button>
                </div>

                {/* URL Input Section */}
                <Section
                    icon="mdi:link-variant"
                    iconColor="text-cyan-500"
                    title="Team URL"
                >
                    <div className="flex flex-col md:flex-row gap-3">
                        <input
                            type="url"
                            value={teamUrl}
                            onChange={(e) => setTeamUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="https://example.com/team"
                            className="
                                flex-1
                                px-4 py-3
                                bg-slate-900/50
                                border border-slate-700
                                rounded-tr-xl rounded-bl-xl
                                beveled-bl-tr
                                text-slate-200
                                placeholder:text-slate-600
                                focus:outline-none
                                focus:border-cyan-500
                                transition-colors
                            "
                        />
                        <button
                            onClick={handleScrape}
                            disabled={!teamUrl.trim() || loading}
                            className="
                                px-6 py-3
                                text-sm font-bold uppercase 
                                tracking-widest beveled-bl-tr
                                border rounded-tr-xl rounded-bl-xl
                                bg-cyan-950/70 border-cyan-400 text-cyan-400
                                transition-all
                                hover:bg-cyan-400 hover:text-slate-950
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center justify-center gap-2
                            "
                        >
                            {loading && (
                                <Icon
                                    icon="line-md:loading-twotone-loop"
                                    className="text-xl"
                                />
                            )}
                            {loading ? 'Fetching...' : 'Fetch Data'}
                        </button>
                    </div>

                    {/* Error Messages */}
                    {(error || createError) && (
                        <div className="
                            p-3 rounded-lg
                            bg-red-950/30 border border-red-800
                            text-red-400 text-sm
                        ">
                            <Icon icon="mdi:alert-circle" className="inline mr-2" />
                            {error || (createError instanceof Error ? createError.message : 'Error creating team')}
                        </div>
                    )}
                </Section>

                <Section
                    icon="ri:edit-fill"
                    iconColor="text-fuchsia-500"
                    title="Edit Team"
                >
                    <div className="
                            p-5
                            bg-slate-900/30
                            border border-slate-700
                            rounded-tr-xl rounded-bl-xl
                            beveled-bl-tr
                            space-y-4
                        ">
                        {/* Team Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                {scrapedTeam.logo_url ? (
                                    <img
                                        src={scrapedTeam.logo_url}
                                        alt={scrapedTeam.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Icon icon="mdi:shield" className="text-3xl text-slate-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={scrapedTeam.name}
                                    onChange={(e) => updateTeamName(e.target.value)}
                                    placeholder="Team name"
                                    className="
                                        w-full
                                        text-xl font-bold text-cyan-400
                                        bg-transparent
                                        border border-transparent
                                        rounded px-2 py-1
                                        focus:outline-none
                                        focus:border-cyan-500
                                        focus:bg-slate-800/50
                                        placeholder:text-slate-500
                                        placeholder:font-normal
                                        transition-colors
                                    "
                                />
                                <input
                                    type="text"
                                    value={scrapedTeam.acronym}
                                    onChange={(e) => updateTeamAcronym(e.target.value)}
                                    placeholder="Team acronym"
                                    className="
                                        w-full
                                        text-sm text-slate-400 uppercase tracking-wider
                                        bg-transparent
                                        border border-transparent
                                        rounded px-2 py-1
                                        focus:outline-none
                                        focus:border-cyan-500
                                        focus:bg-slate-800/50
                                        transition-colors
                                    "
                                />
                            </div>
                        </div>

                        {/* Players List */}
                        <div>
                            <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                Players ({scrapedTeam.players.length})
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {/* Add Player Button */}
                                <button
                                    onClick={addPlayer}
                                    className="
                                        px-3 py-1
                                        bg-slate-800/30
                                        border-2 border-dashed border-slate-600
                                        hover:border-fuchsia-500
                                        hover:bg-slate-800/50
                                        rounded-lg
                                        text-slate-500
                                        hover:text-fuchsia-500
                                        transition-all
                                        flex items-center justify-center gap-2
                                    "
                                >
                                    <Icon icon="mdi:plus" className="text-2xl" />
                                    <span className="text-sm uppercase tracking-wider">
                                        Add
                                    </span>
                                </button>

                                {scrapedTeam.players.map((player, index) => (
                                    <PlayerInput
                                        key={index}
                                        nickname={player.nickname}
                                        index={index}
                                        updatePlayerNickname={updatePlayerNickname}
                                        removePlayer={removePlayer}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setTeamUrl("");
                            setScrapedTeam({
                                name: "",
                                acronym: "",
                                logo_url: "",
                                players: []
                            });
                            setError(null);
                        }}
                        className="
                            flex-1 py-3
                            text-sm font-bold uppercase 
                            tracking-widest beveled-bl-tr
                            border rounded-tr-xl rounded-bl-xl
                            bg-slate-900/50 border-slate-700 text-slate-400
                            transition-all
                            hover:bg-slate-800 hover:border-slate-600
                        "
                    >
                        Clear
                    </button>
                    <button
                        onClick={handleCreateTeam}
                        disabled={!scrapedTeam.name.trim() || !scrapedTeam.acronym.trim() || isCreating}
                        className="
                            flex-1 py-3
                            text-sm font-bold uppercase 
                            tracking-widest beveled-bl-tr
                            border rounded-tr-xl rounded-bl-xl
                            bg-cyan-950/70 border-cyan-400 text-cyan-400
                            transition-all
                            hover:bg-cyan-400 hover:text-slate-950
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center gap-2
                        "
                    >
                        {isCreating && (
                            <Icon
                                icon="line-md:loading-twotone-loop"
                                className="text-xl"
                            />
                        )}
                        {isCreating ? 'Creating...' : 'Create Team'}
                    </button>
                </div>
            </div>
        </ModalLayout>
    );
});