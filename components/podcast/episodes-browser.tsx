"use client";

import Image from "next/image";
import { useState } from "react";
import type { PodcastEpisode } from "@/lib/spotify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Search, Grid, List, ExternalLink } from "lucide-react";

const fallbackCover = "/images/podcast-cover.jpg";

type PodcastEpisodesBrowserProps = {
  episodes: PodcastEpisode[];
  spotifyShowUrl: string;
};

export function PodcastEpisodesBrowser({
  episodes,
  spotifyShowUrl,
}: PodcastEpisodesBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (episodes.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/60 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Episodes are unavailable right now. Please check the Spotify connection.
        </p>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <a href={spotifyShowUrl} target="_blank" rel="noopener noreferrer">
              Listen on Spotify
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const filteredEpisodes = episodes.filter(
    (episode) =>
      episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episode.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search episodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">
        Showing {filteredEpisodes.length} episode{filteredEpisodes.length === 1 ? "" : "s"}.
      </p>

      {/* Episodes */}
      {filteredEpisodes.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No episodes found matching your search.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEpisodes.map((episode) => {
            const episodeUrl = episode.spotifyUrl || spotifyShowUrl;
            return (
              <Card
                key={episode.slug}
                id={episode.slug}
                className={`group overflow-hidden transition-all hover:shadow-lg ${
                  episode.featured ? "border-2 border-primary" : ""
                }`}
              >
                <div className="relative">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    <Image
                      src={episode.imageUrl || fallbackCover}
                      alt={episode.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {episode.featured && (
                    <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{episode.duration}</span>
                    <span className="text-border">|</span>
                    <span>{episode.date}</span>
                  </div>
                  <CardTitle className="line-clamp-2 font-serif text-lg text-card-foreground">
                    {episode.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {episode.description}
                  </CardDescription>
                  <Button asChild size="sm" className="w-full">
                    <a href={episodeUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="mr-2 h-4 w-4" />
                      Listen on Spotify
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEpisodes.map((episode) => {
            const episodeUrl = episode.spotifyUrl || spotifyShowUrl;
            return (
              <Card
                key={episode.slug}
                id={episode.slug}
                className={`group transition-all hover:shadow-lg ${
                  episode.featured ? "border-2 border-primary" : ""
                }`}
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[160px_1fr] sm:items-center">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={episode.imageUrl || fallbackCover}
                      alt={episode.title}
                      fill
                      sizes="(min-width: 1024px) 160px, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {episode.featured && (
                        <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {episode.duration}
                      </span>
                      <span>{episode.date}</span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-card-foreground">
                      {episode.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {episode.description}
                    </p>
                    <div>
                      <Button asChild size="sm" variant="outline">
                        <a href={episodeUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="mr-2 h-4 w-4" />
                          Listen on Spotify
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
