import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 md:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary via-transparent to-transparent" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center rounded-full border border-secondary/30 bg-secondary/10 px-4 py-1.5 text-sm text-secondary">
              <span className="mr-2 h-2 w-2 rounded-full bg-secondary" />
              NPC Reg No: 2024/812217/08
            </div>
            <h1 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
              <span className="text-balance">Empower Through</span>{" "}
              <span className="text-secondary">Collective Knowledge</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80 md:text-xl">
              Our Community In Unity is a registered non-profit committed to
              uplifting communities in Cape Town through education, mentorship,
              and sustainable development.{" "}
              <span className="font-semibold text-secondary">Each one teach one.</span>
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Link href="/services">
                  Our Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/donate">
                  <Heart className="mr-2 h-5 w-5" />
                  Support Our Mission
                </Link>
              </Button>
            </div>

            </div>

          {/* Image/Podcast Preview */}
          <div className="relative mx-auto flex w-full max-w-md flex-col items-center lg:mx-0">
            <Image
              src="/images/logo-square.png"
              alt="Our Community In Unity"
              width={400}
              height={400}
              className="w-full max-w-[280px] shadow-2xl sm:max-w-[320px] md:max-w-[400px]"
              priority
            />
            {/* Podcast Teaser Card */}
            <Link
              href="/podcast"
              className="mt-6 flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-lg transition-transform hover:scale-[1.02] sm:absolute sm:-bottom-4 sm:left-0 sm:right-0 sm:mx-auto sm:mt-0 sm:w-auto sm:max-w-xs lg:-left-8 lg:right-auto lg:mx-0"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg sm:h-16 sm:w-16">
                <Image
                  src="/images/podcast-cover.jpg"
                  alt="Unspoken Truths Podcast"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="h-5 w-5 fill-white text-white sm:h-6 sm:w-6" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">Listen Now</p>
                <p className="truncate font-serif font-semibold text-card-foreground">
                  Unspoken Truths
                </p>
                <p className="text-xs text-muted-foreground">by Cameron</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
