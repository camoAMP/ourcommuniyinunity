import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";

export function CtaSection() {
  return (
    <section className="bg-primary py-20">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
            <Users className="h-8 w-8 text-secondary" />
          </div>
          <h2 className="mb-4 font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to Make a Difference?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Whether you want to volunteer, donate, or access our services, we welcome
            you to join our community. Together, we can create lasting change.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Link href="/services">
                Explore Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
