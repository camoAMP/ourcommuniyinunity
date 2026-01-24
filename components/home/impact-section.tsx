import { Heart, Users, BookOpen, Briefcase } from "lucide-react";

const pillars = [
  {
    icon: BookOpen,
    title: "Education",
    description: "Empowering through knowledge sharing and skills development",
  },
  {
    icon: Briefcase,
    title: "Employment",
    description: "Connecting community members with job opportunities",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building stronger connections through unity and support",
  },
  {
    icon: Heart,
    title: "Welfare",
    description: "Providing essential services to those in need",
  },
];

export function ImpactSection() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
            Our Mission
          </p>
          <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
            Each One Teach One
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Through the power of community and collective action, we&apos;re creating
            lasting change in Cape Town&apos;s underserved communities.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group rounded-xl border border-border bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                <pillar.icon className="h-7 w-7 text-primary" />
              </div>
              <p className="mb-2 font-serif text-xl font-bold text-primary">{pillar.title}</p>
              <p className="text-sm text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
