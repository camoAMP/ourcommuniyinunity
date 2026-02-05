import { getSpotifyEpisodes, getSpotifyShowUrl } from "@/lib/spotify";
import { PodcastEpisodesBrowser } from "@/components/podcast/episodes-browser";

export async function PodcastEpisodesList() {
  const episodes = await getSpotifyEpisodes();
  const spotifyShowUrl = getSpotifyShowUrl();

  return <PodcastEpisodesBrowser episodes={episodes} spotifyShowUrl={spotifyShowUrl} />;
}
