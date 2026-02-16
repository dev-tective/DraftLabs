// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { scrapeCommunityGamingTeam } from "./communitygaming-scraper.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export interface Player {
    nickname: string;
}

export interface Team {
    name: string;
    acronym: string;
    players: Player[];
    logoUrl: string;
}

interface RequestPayload {
    teamUrl: string;
}

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        });
    }

    try {
        const { teamUrl }: RequestPayload = await req.json();

        if (!teamUrl || !teamUrl.includes("communitygaming.io/team/")) {
            return new Response(
                JSON.stringify({ error: "Invalid team URL provided" }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );
        }

        // Fetch the HTML content
        const response = await fetch(teamUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const html = await response.text();

        // Parse HTML with deno-dom
        const doc = new DOMParser().parseFromString(html, "text/html");

        if (!doc) throw new Error("Failed to parse HTML");

        // Scrape team data using Community Gaming scraper
        const teamData = await scrapeCommunityGamingTeam(doc, html);

        return new Response(JSON.stringify(teamData), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        });

    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("404") || error.message.includes("not found")) {
                return new Response(
                    JSON.stringify({ error: "Team not found" }),
                    {
                        status: 404,
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );
            }

            if (error.message.includes("timeout")) {
                return new Response(
                    JSON.stringify({ error: "Request timeout while fetching team data" }),
                    {
                        status: 408,
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );
            }
        }

        return new Response(
            JSON.stringify({ error: "Failed to scrape team data" }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );
    }
});

