import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Flower2, Heart, ArrowRight, Utensils, School, Leaf } from "lucide-react";

const GOAL_AMOUNT = 100000;
const CURRENT_AMOUNT = 0;
const progressPercent = (CURRENT_AMOUNT / GOAL_AMOUNT) * 100;

const gardenSlides = [
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-16-01.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 16, 2026",
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-16-02.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 16, 2026",
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-16-03.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 16, 2026",
  },
  {
    src: "/images/garden/bonteheuwel-community-garden-2026-01-16-04.jpg",
    alt: "Community garden in Bonteheuwel, Cape Town — January 16, 2026",
  },
];

export function GardenSection() {
  return (
    <section className="bg-muted py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div>
            <Badge className="mb-4 bg-secondary/20 text-secondary hover:bg-secondary/30">
              Memorial Garden Project
            </Badge>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Colleen Williams Memorial Garden
            </h2>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              A living tribute to Coline Williams (1967-1989), anti-apartheid activist from
              Bonteheuwel. The garden provides fresh produce for soup kitchens, supports
              Arcadia Primary School&apos;s feeding scheme, and transforms illegal dumping sites
              into green spaces.
            </p>

            {/* Impact Points */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Utensils className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">Soup Kitchens</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                  <School className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-sm text-foreground">School Feeding</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm text-foreground">Anti-Dumping</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Link href="/garden">
                  <Heart className="mr-2 h-5 w-5" />
                  Support the Garden
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/garden#story">
                  Learn Her Story
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="border-2 border-secondary/30">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20">
                  <Flower2 className="h-7 w-7 text-secondary" />
                </div>
                <div>
                  <p className="font-serif text-xl font-bold text-card-foreground">Help Us Grow</p>
                  <p className="text-sm text-muted-foreground">R100,000 Goal</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-card-foreground">
                    R{CURRENT_AMOUNT.toLocaleString()} raised
                  </span>
                  <span className="text-muted-foreground">{progressPercent.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercent} className="h-3" />
              </div>

              {/* Garden Slideshow */}
              <div className="mb-6">
                <Carousel opts={{ loop: true }} className="w-full">
                  <CarouselContent>
                    {gardenSlides.map((slide) => (
                      <CarouselItem key={slide.src}>
                        <div className="overflow-hidden rounded-lg bg-muted">
                          <div className="relative aspect-video w-full">
                            <Image
                              src={slide.src}
                              alt={slide.alt}
                              fill
                              sizes="(min-width: 1024px) 40vw, 100vw"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/donate?purpose=garden">
                  Donate to the Garden
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
