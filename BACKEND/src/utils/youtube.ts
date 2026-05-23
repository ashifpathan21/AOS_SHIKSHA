import axios from "axios";
import "dotenv/config"
function extractVideoId(url: string): string | null {
    try {
        const parsed = new URL(url);

        if (parsed.hostname === "youtu.be") {
            return parsed.pathname.slice(1);
        }

        if (parsed.hostname.includes("youtube.com")) {
            return parsed.searchParams.get("v");
        }

        return null;
    } catch {
        return null;
    }
}

function convertDurationToSeconds(duration: string): number {
    const match = duration.match(
        /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
    );

    const hours = Number(match?.[1] || 0);
    const minutes = Number(match?.[2] || 0);
    const seconds = Number(match?.[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
}

export async function getYoutubeVideoDuration(
    videoUrl: string
): Promise<number | null> {
    try {
        const videoId = extractVideoId(videoUrl);

        if (!videoId) {
            return null;
        }

        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/videos",
            {
                params: {
                    part: "contentDetails",
                    id: videoId,
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );

        const item = response.data.items?.[0];

        if (!item) {
            return null;
        }

        return convertDurationToSeconds(
            item.contentDetails.duration
        );
    } catch (error) {
        console.error(error);
        return null;
    }
}