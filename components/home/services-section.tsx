"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  Briefcase,
  Users,
  HeartHandshake,
  Building2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flower2,
} from "lucide-react";
import { useRef } from "react";

const services = [
  {
    icon: GraduationCap,
    title: "Education & Mentorship",
    description:
      "Skills development programs, tutoring, and mentorship connecting youth with experienced professionals.",
    href: "/services#education",
  },
  {
    icon: Briefcase,
    title: "Job Placement",
    description:
      "Connecting job seekers with employment opportunities and providing career guidance and CV assistance.",
    href: "/jobs",
  },
  {
    icon: Building2,
    title: "SME Support",
    description:
      "Resources and networking for small and medium enterprises to grow and thrive in the local economy.",
    href: "/sme-portal",
  },
  {
    icon: Users,
    title: "Community Programs",
    description:
      "Sports leagues, arts programs, and community events that bring people together and build unity.",
    href: "/services#community",
  },
  {
    icon: HeartHandshake,
    title: "Social Welfare",
    description:
      "Support services for vulnerable community members including food assistance and counseling.",
    href: "/services#welfare",
  },
  {
    icon: Flower2,
    title: "Community Garden",
    description:
      "The Colleen Williams Memorial Garden providing fresh produce and green space for our community.",
    href: "/garden",
  },
];

export function ServicesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
              What We Do
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Our Services
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Services Carousel */}
        <div
          ref={scrollRef}
          className="scrollbar-hide -mx-4 flex gap-6 overflow-x-auto px-4 pb-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {services.map((service) => (
            <Card
              key={service.title}
              className="min-w-[300px] max-w-[320px] shrink-0 border-border bg-card transition-shadow hover:shadow-lg"
              style={{ scrollSnapAlign: "start" }}
            >
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl text-card-foreground">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-muted-foreground">
                  {service.description}
                </CardDescription>
                <Link
                  href={service.href}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
