import { forwardRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { ModalLayout, ModalRef } from "../../layout/ModalLayout";
import { Team } from "../../hooks/useMatches";
import { useUpdateTeam } from "../../hooks/useTeams";
import { useMatchStore } from "@/stores/matchStore";

const DEFAULT_LOGO = "ui/team-logo.png";

interface EditTeamModalProps {
    team: Team;
}

export const EditTeamModal = forwardRef<ModalRef, EditTeamModalProps>(({ team }, ref) => {
    // Check if the current logo is the default one or empty
    const isDefaultInitial = !team.logo_url || team.logo_url === DEFAULT_LOGO;

    const [name, setName] = useState(team.name);
    const [acronym, setAcronym] = useState(team.acronym);
    const [coach, setCoach] = useState(team.coach || '');
    const [logoUrl, setLogoUrl] = useState(isDefaultInitial ? '' : team.logo_url);
    const [useCustomLogo, setUseCustomLogo] = useState(!isDefaultInitial);

    // Reset state when team changes
    useEffect(() => {
        const isDefault = !team.logo_url || team.logo_url === DEFAULT_LOGO;
        setName(team.name);
        setAcronym(team.acronym);
        setCoach(team.coach || '');
        setLogoUrl(isDefault ? '' : team.logo_url);
        setUseCustomLogo(!isDefault);
    }, [team]);

    const matchId = useMatchStore((state) => state.currentMatchId);
    const { mutate: updateTeam, isPending } = useUpdateTeam(matchId || '');

    const handleSubmit = () => {
        if (!name.trim() || !acronym.trim()) return;

        updateTeam({
            id: team.id,
            name: name.trim(),
            acronym: acronym.trim(),
            coach: coach.trim() || undefined,
            logo_url: (useCustomLogo && logoUrl?.trim()) ? logoUrl.trim() : null,
        }, {
            onSuccess: () => {
                if (ref && typeof ref !== 'function' && ref.current) {
                    ref.current.close();
                }
            }
        });
    };

    const handleRestoreDefault = () => {
        setUseCustomLogo(false);
        setLogoUrl('');
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
            ">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl md:text-2xl text-slate-200 uppercase tracking-widest font-bold italic">
                            Edit Team
                        </h1>
                        <p className="text-cyan-500 text-xs md:text-sm tracking-wider uppercase">
                            Modify team information
                        </p>
                    </div>
                    <button
                        onClick={() => ref && typeof ref !== 'function' && ref.current?.close()}
                        className="text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                        <Icon icon="mdi:close" className="text-3xl" />
                    </button>
                </div>

                {/* Name Field */}
                <div className="space-y-4">
                    <h2 className="
                        flex items-center
                        text-xs md:text-sm 
                        text-slate-200 uppercase tracking-widest
                    ">
                        <Icon
                            icon="ri:team-fill"
                            className="text-lg md:text-2xl mr-3 text-cyan-400"
                        />
                        Team Name
                    </h2>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter team name"
                        className="
                            w-full
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
                </div>

                {/* Acronym Field */}
                <div className="space-y-4">
                    <h2 className="
                        flex items-center
                        text-xs md:text-sm 
                        text-slate-200 uppercase tracking-widest
                    ">
                        <Icon
                            icon="mdi:format-letter-case"
                            className="text-lg md:text-2xl mr-3 text-cyan-400"
                        />
                        Team Acronym
                    </h2>
                    <input
                        type="text"
                        value={acronym}
                        onChange={(e) => setAcronym(e.target.value)}
                        placeholder="Enter team acronym"
                        maxLength={5}
                        className="
                            w-full
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
                </div>

                {/* Coach Field */}
                <div className="space-y-4">
                    <h2 className="
                        flex items-center
                        text-xs md:text-sm 
                        text-slate-200 uppercase tracking-widest
                    ">
                        <Icon
                            icon="mdi:account-tie"
                            className="text-lg md:text-2xl mr-3 text-cyan-400"
                        />
                        Coach
                    </h2>
                    <input
                        type="text"
                        value={coach}
                        onChange={(e) => setCoach(e.target.value)}
                        placeholder="Enter coach name"
                        className="
                            w-full
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
                </div>

                {/* Logo URL Field */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="
                            flex items-center
                            text-xs md:text-sm 
                            text-slate-200 uppercase tracking-widest
                        ">
                            <Icon
                                icon="mdi:image"
                                className="text-lg md:text-2xl mr-3 text-fuchsia-500"
                            />
                            Team Logo
                        </h2>
                        {useCustomLogo ? (
                            <button
                                onClick={handleRestoreDefault}
                                className="
                                    text-xs text-fuchsia-400 hover:text-fuchsia-300
                                    uppercase tracking-wider font-semibold
                                    flex items-center gap-1
                                    transition-colors
                                "
                            >
                                <Icon icon="mdi:restore" className="text-base" />
                                Restore Default
                            </button>
                        ) : (
                            <button
                                onClick={() => setUseCustomLogo(true)}
                                className="
                                    text-xs text-cyan-400 hover:text-cyan-300
                                    uppercase tracking-wider font-semibold
                                    flex items-center gap-1
                                    transition-colors
                                "
                            >
                                <Icon icon="mdi:pencil" className="text-base" />
                                Use Custom URL
                            </button>
                        )}
                    </div>

                    {useCustomLogo ? (
                        <input
                            type="text"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="
                                w-full
                                px-4 py-3
                                bg-slate-900/50
                                border border-slate-700
                                rounded-tr-xl rounded-bl-xl
                                beveled-bl-tr
                                text-slate-200
                                placeholder:text-slate-600
                                focus:outline-none
                                focus:border-fuchsia-500
                                transition-colors
                            "
                        />
                    ) : (
                        <div className="
                            w-full px-4 py-3
                            bg-slate-900/30
                            border border-slate-800
                            rounded-tr-xl rounded-bl-xl
                            text-slate-500 italic text-sm
                        ">
                            Using default logo
                        </div>
                    )}

                    {/* Image Preview */}
                    <div className="mt-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                            Preview
                        </p>
                        <img
                            src={useCustomLogo && logoUrl ? logoUrl : DEFAULT_LOGO}
                            alt="Preview"
                            className="w-24 h-24 object-contain rounded-lg"
                            onError={(e) => {
                                if (e.currentTarget.src !== DEFAULT_LOGO) {
                                    e.currentTarget.src = DEFAULT_LOGO;
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!name.trim() || !acronym.trim() || isPending}
                    className={`
                        w-full py-3 md:py-4
                        text-lg font-bold uppercase 
                        tracking-widest beveled-bl-tr
                        border rounded-tr-2xl rounded-bl-2xl
                        bg-cyan-900/20 border-cyan-600 text-cyan-400
                        transition-all
                        hover:bg-cyan-900/30 hover:border-cyan-400
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2
                    `}
                >
                    {isPending && (
                        <Icon
                            icon="line-md:loading-twotone-loop"
                            className="text-2xl"
                        />
                    )}
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </ModalLayout>
    );
});

