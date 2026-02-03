import { Progress } from "@/components/ui/progress"
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Target,
  Leaf,
  Utensils,
  Trash2,
  Play,
  School,
  HandHeart,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Colleen Williams Memorial Garden",
  description:
    "Support the Colleen Williams Memorial Garden in Bonteheuwel - honouring activist Coline Williams (1967-1989) while providing fresh produce and green space for our community.",
};

const gardenPurposes = [
  {
    icon: Utensils,
    title: "Food Security",
    description: "Growing fresh vegetables to support soup kitchens and food parcels for families in need.",
    amount: "R25,000",
  },
  {
    icon: School,
    title: "Arcadia Primary Support",
    description: "Providing fresh produce to Arcadia Primary School for their feeding scheme.",
    amount: "R15,000",
  },
  {
    icon: Trash2,
    title: "Anti-Dumping Initiative",
    description: "Transforming illegal dumping sites into productive community garden spaces.",
    amount: "R30,000",
  },
  {
    icon: Leaf,
    title: "Garden Infrastructure",
    description: "Tools, seeds, irrigation systems, and maintenance for sustainable growth.",
    amount: "R30,000",
  },
];

const gardenGallery = [
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-01.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 3264,
    height: 2448,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-02.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 3264,
    height: 2448,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-03.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 3264,
    height: 2448,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-04.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 3264,
    height: 2448,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-05.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 3264,
    height: 2448,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-06.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 3264,
    height: 2448,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-07.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 3264,
    height: 2448,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-08.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 3072,
    height: 4080,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-09.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 3072,
    height: 4080,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-10.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 4080,
    height: 3072,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-11.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 4080,
    height: 3072,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-08-12.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 8, 2026",
    width: 4080,
    height: 3072,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-16-01.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 16, 2026",
    width: 4080,
    height: 3072,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-16-02.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 16, 2026",
    width: 4080,
    height: 3072,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-16-03.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 16, 2026",
    width: 4080,
    height: 3072,
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-16-04.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 16, 2026",
    width: 4080,
    height: 3072,
  },
];

const gardenVideo = {
  src: "/videos/bonteheuwel-community-garden-2026-01-08.mp4",
  title: "Colleen Williams Memorial Garden video update",
  caption: "A short look at the community garden in Bonteheuwel.",
};

const GOAL_AMOUNT = 100000;
const CURRENT_AMOUNT = 0;
const progressPercent = (CURRENT_AMOUNT / GOAL_AMOUNT) * 100;

export default function GardenPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge className="mb-4 bg-secondary/20 text-secondary hover:bg-secondary/30">
                Memorial Garden Project
              </Badge>
              <h1 className="mb-4 font-serif text-3xl font-bold text-primary-foreground sm:text-4xl md:text-5xl">
                Colleen Williams Memorial Garden
              </h1>
              <p className="mb-6 text-lg leading-relaxed text-primary-foreground/80">
                A living tribute to Coline Williams (1967-1989), anti-apartheid activist from
                Bonteheuwel, transforming our community through sustainable gardening and food security.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Link href="#donate">
                    <Heart className="mr-2 h-5 w-5" />
                    Support the Garden
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                  <Link href="#story">Learn Her Story</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl bg-primary-foreground/10">
                <div className="aspect-[2/1] w-full">
                  <iframe
                    src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FCamoflage021%2Fposts%2Fpfbid034JVbBFcbBNcK3fhFkGsWymthBdwMr74PzGecr2TQX7pNtH6qADiRWchtjmzN1CYkl&show_text=true&width=500"
                    className="h-full w-full"
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    title="Garden Update - Facebook Post"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section id="donate" className="bg-background py-16">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-3xl border-2 border-secondary/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="font-serif text-2xl">Fundraising Goal: R100,000</CardTitle>
              <CardDescription>Help us build a sustainable community garden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-card-foreground">
                    R{CURRENT_AMOUNT.toLocaleString()} raised
                  </span>
                  <span className="text-muted-foreground">
                    R{GOAL_AMOUNT.toLocaleString()} goal
                  </span>
                </div>
                <Progress value={progressPercent} className="h-4" />
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {progressPercent.toFixed(1)}% of our goal reached
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Button asChild size="lg" className="w-full">
                  <Link href="/donate?purpose=garden">
                    <Heart className="mr-2 h-5 w-5" />
                    Donate Now
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
                  <a
                    href="https://www.facebook.com/share/p/1EqQnEjcoi/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Share on Facebook
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Memorial Section - Coline Williams Story */}
      <section id="story" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
                In Memory
              </p>
              <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                Coline Williams (1967 - 1989)
              </h2>
              <p className="text-muted-foreground">
                A daughter of Bonteheuwel who gave her life for freedom
              </p>
            </div>

            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="bg-primary p-8 text-primary-foreground md:p-12">
                  <h3 className="mb-4 font-serif text-xl font-bold">Her Legacy</h3>
                  <div className="space-y-4 text-sm leading-relaxed text-primary-foreground/90">
                    <p>
                      Coline Williams was born and raised in Bonteheuwel, Cape Town. As a young
                      activist, she dedicated her life to the anti-apartheid struggle, believing
                      in a free and equal South Africa.
                    </p>
                    <p>
                      On 23 July 1989, at just 22 years old, Coline was killed by a bomb planted
                      by state security forces while on a mission with Robert McBride. She became
                      one of the youngest martyrs of the struggle for freedom.
                    </p>
                    <p>
                      Today, we honour her memory by transforming Bonteheuwel through community
                      development, just as she dreamed of transforming South Africa.
                    </p>
                  </div>
                </div>
                <CardContent className="flex flex-col justify-center p-8 md:p-12">
                  <blockquote className="border-l-4 border-secondary pl-4 italic text-muted-foreground">
                    &ldquo;The garden stands as a living memorial - where her spirit of sacrifice
                    and service continues to nurture our community.&rdquo;
                  </blockquote>
                  <p className="mt-4 text-sm font-medium text-card-foreground">
                    — Our Community In Unity
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Badge variant="outline">Freedom Fighter</Badge>
                    <Badge variant="outline">Bonteheuwel Hero</Badge>
                    <Badge variant="outline">1967-1989</Badge>
                  </div>
                </CardContent>
              </div>
            </Card>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="overflow-hidden rounded-2xl bg-card shadow-lg">
                <Image
                  src="/images/coline-williams.png"
                  alt="Coline Williams portrait"
                  width={800}
                  height={900}
                  className="h-auto w-full object-cover"
                />
                <p className="p-4 text-sm text-muted-foreground">
                  Coline Williams, remembered for her courage and service.
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl bg-card shadow-lg">
                <Image
                  src="/images/coline-williams-statue.png"
                  alt="Coline Williams memorial sculpture"
                  width={900}
                  height={700}
                  className="h-auto w-full object-cover"
                />
                <p className="p-4 text-sm text-muted-foreground">
                  Memorial sculpture honoring Coline Williams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Garden Purposes */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
              Where Your Donation Goes
            </p>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Garden Initiatives
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Your contribution supports multiple community programmes through the garden
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {gardenPurposes.map((purpose) => (
              <Card key={purpose.title} className="text-center transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20">
                    <purpose.icon className="h-7 w-7 text-secondary" />
                  </div>
                  <CardTitle className="font-serif text-lg">{purpose.title}</CardTitle>
                  <Badge variant="outline" className="mx-auto mt-2 w-fit">
                    {purpose.amount} needed
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription>{purpose.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Impact - Soup Kitchen, Arcadia, Anti-Dumping */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
              Community Impact
            </p>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              How the Garden Serves Bonteheuwel
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Soup Kitchen */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-primary/10 p-8">
                <div className="flex h-full items-center justify-center">
                  <Utensils className="h-16 w-16 text-primary" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="font-serif">Community Soup Kitchen</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Fresh vegetables from the garden supply local soup kitchens, including
                  Sumaya&apos;s Soup Kitchen, providing nutritious meals to families in need
                  throughout Bonteheuwel.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Arcadia Primary */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-secondary/10 p-8">
                <div className="flex h-full items-center justify-center">
                  <School className="h-16 w-16 text-secondary" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="font-serif">Arcadia Primary School</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Supporting the school feeding scheme at Arcadia Primary with fresh produce,
                  ensuring learners receive healthy meals to fuel their education and growth.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Anti-Dumping */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-green-500/10 p-8">
                <div className="flex h-full items-center justify-center">
                  <Leaf className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <CardHeader>
                <CardTitle className="font-serif">Anti-Dumping Initiative</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  Transforming illegal dumping sites into productive green spaces,
                  beautifying our community while providing food security and environmental education.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Garden Media Gallery */}
      <section id="gallery" className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
                Garden Gallery
              </p>
              <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                Garden Media Updates
              </h2>
              <p className="text-muted-foreground">
                Recent moments from the Colleen Williams Memorial Garden
              </p>
            </div>

            <Card className="mb-12 overflow-hidden">
              <div className="aspect-video bg-black">
                <video
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  title={gardenVideo.title}
                >
                  <source src={gardenVideo.src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                    <Play className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">{gardenVideo.title}</p>
                    <p className="text-sm text-muted-foreground">{gardenVideo.caption}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="columns-1 gap-x-6 sm:columns-2 lg:columns-3">
              {gardenGallery.map((image) => (
                <div key={image.src} className="mb-6 break-inside-avoid">
                  <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-primary-foreground">
            Help Us Grow
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
            Whether through donations, volunteering, or spreading the word, you can help
            the Colleen Williams Memorial Garden flourish.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link href="/donate?purpose=garden">
                <HandHeart className="mr-2 h-5 w-5" />
                Donate to the Garden
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
              <Link href="/services#community">
                Volunteer With Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
