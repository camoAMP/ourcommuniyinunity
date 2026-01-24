import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Heart, Star, Crown } from "lucide-react";

const donorTiers = [
  {
    name: "Friend",
    icon: Heart,
    amount: "R50",
    period: "/month",
    description: "Support our basic operations",
    benefits: [
      "Monthly newsletter",
      "Name on supporters wall",
      "Community updates",
    ],
    featured: false,
  },
  {
    name: "Champion",
    icon: Star,
    amount: "R250",
    period: "/month",
    description: "Enable program expansion",
    benefits: [
      "All Friend benefits",
      "Quarterly impact report",
      "Event invitations",
      "Social media recognition",
    ],
    featured: true,
  },
  {
    name: "Patron",
    icon: Crown,
    amount: "R1000",
    period: "/month",
    description: "Transform communities",
    benefits: [
      "All Champion benefits",
      "Annual dinner invitation",
      "Program naming opportunity",
      "Direct line to leadership",
      "Tax certificate",
    ],
    featured: false,
  },
];

export function DonorSection() {
  return (
    <section className="bg-muted py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
            Support Our Mission
          </p>
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Become a Donor
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Your contribution directly supports education, job creation, and community
            development in Cape Town. Every rand makes a difference.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {donorTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative overflow-hidden ${
                tier.featured
                  ? "border-2 border-primary shadow-xl"
                  : "border-border"
              }`}
            >
              {tier.featured && (
                <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center">
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
                    tier.featured ? "bg-primary" : "bg-primary/10"
                  }`}
                >
                  <tier.icon
                    className={`h-7 w-7 ${
                      tier.featured ? "text-primary-foreground" : "text-primary"
                    }`}
                  />
                </div>
                <CardTitle className="font-serif text-2xl text-card-foreground">
                  {tier.name}
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="font-serif text-4xl font-bold text-primary">
                    {tier.amount}
                  </span>
                  <span className="text-muted-foreground">{tier.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mb-6 space-y-3">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-secondary" />
                      <span className="text-card-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${
                    tier.featured
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  }`}
                >
                  <Link href={`/donate?tier=${tier.name.toLowerCase()}`}>
                    Choose {tier.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-muted-foreground">
            Prefer a one-time donation? We welcome contributions of any amount.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/donate">Make a One-Time Donation</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
