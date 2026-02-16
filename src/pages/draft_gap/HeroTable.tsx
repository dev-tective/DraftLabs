import { useHeroesStore, Hero } from "../../stores/heroesStore";
import { HeroRow } from "./components/HeroRow";

export const getHeroImageUrl = (hero?: Hero | null) => {
    if (!hero) return '/heroes/mlbb/slot/kalea.png';
    return `/heroes/${hero.game.toLowerCase()}/slot/${hero.name.toLowerCase()}.png`;
}

export const HeroTable = () => {
    const { heroes, isLoading } = useHeroesStore(); 

    return (
        <table className="w-full text-slate-200 bg-slate-800 border border-slate-700 rounded-md overflow-hidden">
            <thead>
                <tr className="text-left uppercase border-b border-slate-700">
                    <th className="p-3">Hero</th>
                    <th className="p-3">Lane</th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={2} className="p-8 text-center text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full"></div>
                                <span>Loading heroes...</span>
                            </div>
                        </td>
                    </tr>
                ) : heroes.length === 0 ? (
                    <tr>
                        <td colSpan={2} className="p-8 text-center text-slate-400">
                            No heroes found
                        </td>
                    </tr>
                ) : (
                    heroes.map((hero) => (
                        <HeroRow
                            key={hero.id}
                            hero={hero}
                        />
                    ))
                )}
            </tbody>
        </table>
    );
}