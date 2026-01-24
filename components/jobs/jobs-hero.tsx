import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, FileText, Users } from "lucide-react";

export function JobsHero() {
  return (
    <section className="bg-primary py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
            <Briefcase className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="mb-4 font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
            Jobs Board
          </h1>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Connecting Cape Town job seekers with meaningful employment opportunities.
            Browse listings, get support, and take the next step in your career.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Link href="#listings">
                <Briefcase className="mr-2 h-5 w-5" />
                Browse Jobs
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="#cv-help">
                <FileText className="mr-2 h-5 w-5" />
                CV Assistance
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="#employers">
                <Users className="mr-2 h-5 w-5" />
                For Employers
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
