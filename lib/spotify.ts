const DEFAULT_SHOW_ID = "7cwfPZpCqL3L1T0gLsjkx0";
const DEFAULT_MARKET = "ZA";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

type SpotifyEpisodeItem = {
  id: string;
  name: string;
  description: string;
  release_date: string;
  duration_ms: number;
  external_urls?: { spotify?: string };
  images?: Array<{ url: string; width?: number; height?: number }>;
};

type SpotifyEpisodesResponse = {
  items: SpotifyEpisodeItem[];
  next: string | null;
};

export type PodcastEpisode = {
  slug: string;
  spotifyId: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  featured?: boolean;
  imageUrl?: string;
  spotifyUrl?: string;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function base64Encode(value: string) {
  if (typeof btoa === "function") {
    return btoa(value);
  }
  // eslint-disable-next-line no-undef
  return Buffer.from(value).toString("base64");
}

function formatDuration(durationMs: number) {
  const totalMinutes = Math.max(1, Math.round(durationMs / 60000));
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${totalMinutes} min`;
}

function formatDate(dateValue: string) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function slugify(value: string, id: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const suffix = id.slice(-4);
  return base ? `${base}-${suffix}` : id;
}

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value;
  }

  const credentials = base64Encode(`${clientId}:${clientSecret}`);
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) return null;

  cachedToken = {
    value: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };

  return data.access_token;
}

export function getSpotifyShowId() {
  return process.env.SPOTIFY_SHOW_ID || DEFAULT_SHOW_ID;
}

export function getSpotifyShowUrl() {
  return `https://open.spotify.com/show/${getSpotifyShowId()}`;
}

export async function getSpotifyEpisodes({
  limit,
}: {
  limit?: number;
} = {}): Promise<PodcastEpisode[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const showId = process.env.SPOTIFY_SHOW_ID || DEFAULT_SHOW_ID;
  const market = process.env.SPOTIFY_MARKET || DEFAULT_MARKET;

  const results: PodcastEpisode[] = [];
  const maxItems =
    typeof limit === "number" && Number.isFinite(limit) ? limit : Number.POSITIVE_INFINITY;
  let nextUrl: string | null = `${SPOTIFY_API_BASE}/shows/${showId}/episodes?market=${market}&limit=50`;

  while (nextUrl && results.length < maxItems) {
    const response = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });

    if (!response.ok) break;

    const data = (await response.json()) as SpotifyEpisodesResponse;
    for (const item of data.items ?? []) {
      results.push({
        slug: slugify(item.name, item.id),
        spotifyId: item.id,
        title: item.name,
        description: item.description || "",
        duration: formatDuration(item.duration_ms),
        date: formatDate(item.release_date),
        imageUrl: item.images?.[0]?.url,
        spotifyUrl: item.external_urls?.spotify,
      });
      if (results.length >= maxItems) break;
    }
    nextUrl = data.next;
  }

  if (results.length > 0) {
    results[0].featured = true;
  }

  return results;
}
