import type { Metadata } from "next";
import Image from "next/image";
import { PodcastEpisodesList } from "@/components/podcast/episodes-list";
import { getSpotifyShowId, getSpotifyShowUrl } from "@/lib/spotify";
import { Headphones, Mic, Radio } from "lucide-react";

export const metadata: Metadata = {
  title: "Unspoken Truths Podcast",
  description:
    "Listen to Unspoken Truths by Cameron - raw stories from Bonteheuwel and Cape Town. Real conversations about life, struggle, and triumph.",
  openGraph: {
    title: "Unspoken Truths Podcast | Our Community In Unity",
    description: "Raw stories from Bonteheuwel and Cape Town.",
    images: ["/images/podcast-cover.jpg"],
  },
};

export default function PodcastPage() {
  const spotifyShowId = getSpotifyShowId();
  const spotifyShowUrl = getSpotifyShowUrl();

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-sidebar py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Info */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sidebar-primary/20 px-4 py-1.5 text-sm font-medium text-sidebar-primary">
                <Headphones className="h-4 w-4" />
                Presented by Our Community In Unity
              </div>
              <h1 className="mb-4 font-serif text-4xl font-bold text-sidebar-foreground md:text-5xl">
                Unspoken Truths
              </h1>
              <p className="mb-2 text-xl text-sidebar-foreground/90">by Cameron De Vries</p>
              <p className="mb-8 text-lg leading-relaxed text-sidebar-foreground/70">
                Raw, unfiltered stories from the heart of Bonteheuwel and Cape Town.
                Each episode dives deep into real conversations about life, struggle,
                triumph, and the human experience. No filters, no pretense - just truth.
              </p>

              {/* Host Info */}
              <div className="flex flex-col items-center gap-4 rounded-xl bg-sidebar-accent p-4 sm:flex-row sm:items-center">
                <Image
                  src="/images/cameron-devries.jpg"
                  alt="Cameron De Vries"
                  width={80}
                  height={80}
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-sidebar-foreground">Cameron De Vries</p>
                  <p className="text-sm text-sidebar-foreground/70">Host & Creator</p>
                  <p className="mt-1 text-sm text-sidebar-foreground/60">
                    Born and raised in Bonteheuwel, sharing stories that matter.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
                <div className="rounded-lg bg-sidebar-accent p-3 text-center sm:p-4">
                  <Mic className="mx-auto mb-2 h-4 w-4 text-sidebar-primary sm:h-5 sm:w-5" />
                  <p className="font-serif text-xl font-bold text-sidebar-foreground sm:text-2xl">20+</p>
                  <p className="text-xs text-sidebar-foreground/70">Episodes</p>
                </div>
                <div className="rounded-lg bg-sidebar-accent p-3 text-center sm:p-4">
                  <Radio className="mx-auto mb-2 h-4 w-4 text-sidebar-primary sm:h-5 sm:w-5" />
                  <p className="font-serif text-xl font-bold text-sidebar-foreground sm:text-2xl">5K+</p>
                  <p className="text-xs text-sidebar-foreground/70">Listeners</p>
                </div>
                <div className="rounded-lg bg-sidebar-accent p-3 text-center sm:p-4">
                  <Headphones className="mx-auto mb-2 h-4 w-4 text-sidebar-primary sm:h-5 sm:w-5" />
                  <p className="font-serif text-xl font-bold text-sidebar-foreground sm:text-2xl">Weekly</p>
                  <p className="text-xs text-sidebar-foreground/70">New Episodes</p>
                </div>
              </div>
            </div>

            {/* Podcast Cover & Player */}
            <div className="flex flex-col items-center">
              <div className="relative mb-6 overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="/images/podcast-cover.jpg"
                  alt="Unspoken Truths Podcast Cover"
                  width={400}
                  height={400}
                  className="w-full max-w-md"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spotify Player */}
      <section className="bg-background py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-sm">
            <iframe
              style={{ borderRadius: "12px" }}
              src={`https://open.spotify.com/embed/show/${spotifyShowId}?utm_source=generator&theme=0`}
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Podcast Player - Unspoken Truths"
            />
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
              All Episodes
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Listen to the Stories
            </h2>
          </div>
          <PodcastEpisodesList />
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 font-serif text-2xl font-bold text-foreground">
            Never Miss an Episode
          </h3>
          <p className="mb-6 text-muted-foreground">
            Subscribe on your favorite podcast platform to get notified when new episodes drop.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={spotifyShowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Spotify
            </a>
            <a
              href="https://podcasts.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#F452FF] to-[#832BC1] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 2.568c2.336 0 4.448.902 6.056 2.587 1.224 1.272 1.912 2.619 2.264 4.392.12.59-.12 1.2-.67 1.37-.55.18-1.14-.15-1.32-.73-.27-1.35-.8-2.4-1.71-3.32-1.28-1.34-2.95-2.06-4.83-2.06-1.88 0-3.55.72-4.83 2.06-.91.92-1.44 1.97-1.71 3.32-.18.58-.77.91-1.32.73-.55-.17-.79-.78-.67-1.37.35-1.77 1.04-3.12 2.27-4.39 1.6-1.69 3.72-2.59 6.05-2.59h.01zm.2 3.18c1.56 0 2.97.6 4.05 1.73.81.87 1.3 1.85 1.54 3.11.09.48-.18.97-.65 1.12-.48.14-.97-.13-1.12-.62-.18-.9-.54-1.6-1.1-2.2-.77-.81-1.77-1.25-2.88-1.25s-2.11.44-2.88 1.25c-.56.6-.92 1.3-1.1 2.2-.15.49-.64.76-1.12.62-.47-.15-.74-.64-.65-1.12.24-1.26.73-2.24 1.54-3.11 1.08-1.13 2.49-1.73 4.05-1.73h.32zm-.15 3.2c.94 0 1.76.53 2.18 1.32.41.77.37 1.77-.1 2.52-.36.57-.56 1.26-.56 2.02v4.95c0 .9-.55 1.69-1.4 2.01-.84.32-1.77.07-2.36-.63-.44-.53-.67-1.19-.67-1.9v-4.43c0-.76-.2-1.45-.56-2.02-.47-.75-.51-1.75-.1-2.52.42-.79 1.24-1.32 2.18-1.32h1.39z" />
              </svg>
              Apple Podcasts
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
