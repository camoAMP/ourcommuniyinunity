"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Clock, Search, Grid, List } from "lucide-react";

// Static episodes data (would be fetched from Spotify API in production)
const episodes = [
  {
    id: "5VA1UsrFB4aterGiQ8RhZM",
    title: "When the Ground Moves",
    description:
      "A raw exploration of resilience when life shifts beneath your feet. Cameron shares stories from community members who faced unexpected challenges and found strength they never knew they had.",
    duration: "45 min",
    date: "Jan 15, 2025",
    featured: true,
  },
  {
    id: "episode-behind-closed-doors",
    title: "Behind Closed Doors",
    description:
      "Unveiling the stories that happen when no one is watching. Real conversations about domestic life, family dynamics, and the secrets we keep.",
    duration: "38 min",
    date: "Jan 8, 2025",
    featured: false,
  },
  {
    id: "episode-under-pressure",
    title: "Under Pressure",
    description:
      "How community members cope with the weight of daily challenges. From financial stress to social expectations, we explore the pressures that shape our lives.",
    duration: "42 min",
    date: "Jan 1, 2025",
    featured: false,
  },
  {
    id: "episode-ties-that-bind",
    title: "The Ties That Bind",
    description:
      "Exploring the complex relationships that define us - family, friendship, and community bonds that both support and sometimes constrain us.",
    duration: "50 min",
    date: "Dec 25, 2024",
    featured: false,
  },
  {
    id: "episode-rising-from-ashes",
    title: "Rising from the Ashes",
    description:
      "Stories of comeback and redemption from the streets of Bonteheuwel. People who lost everything and rebuilt their lives from scratch.",
    duration: "55 min",
    date: "Dec 18, 2024",
    featured: false,
  },
  {
    id: "episode-unheard-voices",
    title: "Unheard Voices",
    description:
      "Giving platform to community members whose stories are often overlooked. Youth, elders, and everyday heroes share their truths.",
    duration: "40 min",
    date: "Dec 11, 2024",
    featured: false,
  },
  {
    id: "episode-streets-where-we-grew",
    title: "The Streets Where We Grew",
    description:
      "A nostalgic yet honest look at growing up in Cape Town's townships. The good, the bad, and everything in between.",
    duration: "48 min",
    date: "Dec 4, 2024",
    featured: false,
  },
  {
    id: "episode-breaking-cycles",
    title: "Breaking Cycles",
    description:
      "How one generation can change the trajectory of the next. Stories of parents, teachers, and mentors who chose differently.",
    duration: "44 min",
    date: "Nov 27, 2024",
    featured: false,
  },
];

export function PodcastEpisodesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

      {/* Episodes */}
      {filteredEpisodes.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No episodes found matching your search.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEpisodes.map((episode) => (
            <Card
              key={episode.id}
              id={episode.id}
              className={`group overflow-hidden transition-all hover:shadow-lg ${
                episode.featured ? "border-2 border-primary" : ""
              }`}
            >
              {episode.featured && (
                <div className="bg-primary px-3 py-1 text-center text-xs font-semibold text-primary-foreground">
                  Featured Episode
                </div>
              )}
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
                <div className="space-y-3">
                  <iframe
                    src={`https://open.spotify.com/embed/episode/${episode.id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={`Play ${episode.title}`}
                    className="rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEpisodes.map((episode) => (
            <Card
              key={episode.id}
              id={episode.id}
              className={`group transition-all hover:shadow-lg ${
                episode.featured ? "border-2 border-primary" : ""
              }`}
            >
              <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {episode.featured && (
                      <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground">
                        Featured
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {episode.duration}
                    </span>
                    <span>{episode.date}</span>
                  </div>
                  <h3 className="mb-2 font-serif text-lg font-semibold text-card-foreground">
                    {episode.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {episode.description}
                  </p>
                </div>
                <div className="shrink-0 md:w-64">
                  <iframe
                    src={`https://open.spotify.com/embed/episode/${episode.id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={`Play ${episode.title}`}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      <div className="mt-8 text-center">
        <Button variant="outline" size="lg">
          <Play className="mr-2 h-4 w-4" />
          Load More Episodes
        </Button>
      </div>
    </div>
  );
}
