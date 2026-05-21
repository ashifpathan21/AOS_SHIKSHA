import play from 'play-dl';

export async function getYoutubeVideoDuration(videoUrl: string): Promise<number> {
    try {
        const videoInfo = await play.video_basic_info(videoUrl);
        const durationInSeconds = videoInfo.video_details.durationInSec;
        return durationInSeconds;
    } catch (error) {
        console.error('Failed to extract video metadata:', error);
        throw error;
    }
}