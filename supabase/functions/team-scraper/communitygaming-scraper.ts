import { Team, Player } from "./index.ts";

export async function scrapeCommunityGamingTeam(doc: any, html: string): Promise<Team> {
    // Extract team name from title
    const teamName = doc.querySelector("title").textContent
        ?.split("|")[0]
        .trim();

    if (!teamName) {
        throw new Error("Team not found or unable to extract team data");
    }

    // Extract acronym (first 3-4 letters of team name, uppercase)
    const teamNameWords = teamName.split(" ");
    const acronym = teamNameWords.length > 1
        ? teamNameWords.map((word) => word[0]).join("").toUpperCase().slice(0, 4)
        : teamName.slice(0, 4).toUpperCase();

    // Extract logo URL from team avatar image
    let logoUrl = "";

    // Search for team avatar URL directly in HTML
    const encodedRegex = /url=([^&"]+)/g;

    // First try: Find encoded URL in HTML
    let match;
    while ((match = encodedRegex.exec(html)) !== null) {
        try {
            const decodedUrl = decodeURIComponent(match[1]);
            if (decodedUrl.includes('imgs.communitygaming.io/teams/')) {
                logoUrl = decodedUrl;
                break;
            }
        } catch (e) {
            // Continue if decode fails
        }
    }

    // Second try: Direct URL in HTML
    if (!logoUrl) {
        // Look for URLs like: https://imgs.communitygaming.io/teams/XXXX.jpeg
        const teamImageRegex = /https:\/\/imgs\.communitygaming\.io\/teams\/[^"&\s]+\.(jpeg|jpg|png|webp)/i;
        const directMatch = html.match(teamImageRegex);
        if (directMatch && directMatch[0]) {
            logoUrl = directMatch[0];
        }
    }

    // Final fallback to meta og:image
    if (!logoUrl) {
        const metaOgImage = doc.querySelector('meta[property="og:image"]');
        if (metaOgImage) {
            logoUrl = metaOgImage.getAttribute("content") || "";
        }
    }

    // Extract players from the React table
    const players: Player[] = [];
    const tableRows = doc.querySelectorAll(".rdt_TableRow");

    tableRows.forEach((row) => {
        // Get nickname from the mini-profile-link
        const userLink = row.querySelector("a.mini-profile-link");
        const href = userLink?.getAttribute("href") || "";
        const nickname = href.split("/user/")[1] || "";

        if (nickname && nickname !== "unknown") {
            players.push({ nickname });
        }
    });

    return {
        name: teamName,
        acronym,
        players,
        logoUrl,
    };
}
