import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSpotifyEpisodes, getSpotifyShowId } from "@/lib/spotify";
import { ArrowRight, Headphones, Play } from "lucide-react";

export async function PodcastSection() {
  const spotifyShowId = getSpotifyShowId();
  const episodes = await getSpotifyEpisodes({ limit: 3 });
  const showEpisodes = episodes.length > 0;

  return (
    <section className="bg-muted py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Podcast Info */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Headphones className="h-4 w-4" />
              Featured Podcast
            </div>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Unspoken Truths by Cameron
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              Raw stories from Bonteheuwel and Cape Town. Listen to real conversations
              about life, struggle, triumph, and everything in between. Presented by
              Our Community In Unity.
            </p>

            {/* Host Info */}
            <div className="mb-8 flex items-center gap-4 rounded-xl bg-card p-4">
              <Image
                src="/images/cameron-devries.jpg"
                alt="Cameron De Vries"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-card-foreground">Cameron De Vries</p>
                <p className="text-sm text-muted-foreground">Host & Creator</p>
              </div>
            </div>

            {/* Featured Episodes */}
            <div className="mb-8 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
                Latest Episodes
              </p>
              {showEpisodes ? (
                episodes.map((episode) => (
                  <Link
                    key={episode.slug}
                    href={`/podcast#${episode.slug}`}
                    className="group flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                      <Play className="h-4 w-4 fill-current" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-card-foreground">
                        {episode.title}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {episode.description}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                  Connect Spotify to show the latest episodes here.
                </p>
              )}
            </div>

            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/podcast">
                All Episodes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Spotify Embed */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl bg-primary/5 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl bg-card shadow-xl">
              <Image
                src="/images/podcast-cover.jpg"
                alt="Unspoken Truths Podcast"
                width={600}
                height={600}
                className="w-full"
              />
              <div className="p-6">
                <iframe
                  style={{ borderRadius: "12px" }}
                  src={`https://open.spotify.com/embed/show/${spotifyShowId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Spotify Podcast Player"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
