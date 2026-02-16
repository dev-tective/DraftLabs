import { Hero } from "../stores/heroesStore";

export const getHeroImageProfileUrl = (hero?: Hero | null) => {
    if (!hero) return null;
    return `/heroes/${hero.game.toLowerCase()}/profile/${hero.name.toLowerCase()}.jpg`;
}

export const getHeroImageSlotUrl = (hero?: Hero | null) => {
    if (!hero) return null;
    return `/heroes/${hero.game.toLowerCase()}/slot/${hero.name.toLowerCase()}.png`;
}
