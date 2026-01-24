import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GraduationCap,
  Briefcase,
  Users,
  HeartHandshake,
  Building2,
  Scale,
  ArrowRight,
  CheckCircle2,
  Phone,
  Flower2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore the services offered by Our Community In Unity - education, job placement, SME support, community programs, social welfare, and legal aid.",
};

const services = [
  {
    id: "education",
    icon: GraduationCap,
    title: "Education & Mentorship",
    description:
      "Comprehensive skills development programs designed to equip community members with the knowledge and skills they need to succeed.",
    features: [
      "After-school tutoring programs",
      "Computer literacy training",
      "Career guidance workshops",
      "One-on-one mentorship matching",
      "Scholarship assistance",
      "Adult education programs",
    ],
  },
  {
    id: "jobs",
    icon: Briefcase,
    title: "Job Placement Services",
    description:
      "Connecting job seekers with meaningful employment opportunities while providing the support needed to succeed in the workplace.",
    features: [
      "Job matching and referrals",
      "CV writing assistance",
      "Interview preparation",
      "Workplace readiness training",
      "Employer partnerships",
      "Apprenticeship programs",
    ],
    cta: { label: "Browse Jobs", href: "/jobs" },
  },
  {
    id: "sme",
    icon: Building2,
    title: "SME Support",
    description:
      "Empowering small and medium enterprises with resources, networking, and guidance to grow and create local employment.",
    features: [
      "SEDFA funding guidance (R500k - R15m)",
      "NYDA grant assistance (up to R250k)",
      "Business registration via CIPC",
      "Financial management training",
      "Marketing and branding support",
      "SME directory listing",
    ],
    cta: { label: "Funding & Resources", href: "/sme-portal#sedfa" },
  },
  {
    id: "community",
    icon: Users,
    title: "Community Programs",
    description:
      "Building unity through sports, arts, and community events that bring people together and foster positive relationships.",
    features: [
      "Youth sports leagues",
      "Arts and culture programs",
      "Community clean-up initiatives",
      "Holiday events and celebrations",
      "Youth leadership development",
      "Intergenerational activities",
    ],
  },
  {
    id: "welfare",
    icon: HeartHandshake,
    title: "Social Welfare",
    description:
      "Providing essential support services to vulnerable community members during difficult times.",
    features: [
      "Food parcels and soup kitchens",
      "Clothing distribution",
      "Emergency assistance",
      "Counseling referrals",
      "Home visits for elderly",
      "Support groups",
    ],
  },
  {
    id: "garden",
    icon: Flower2,
    title: "Colleen Williams Memorial Garden",
    description:
      "A community garden honouring Coline Williams (1967-1989), providing fresh produce and green space for Bonteheuwel.",
    features: [
      "Fresh vegetable cultivation",
      "Community food security",
      "Youth gardening programmes",
      "Environmental education",
      "Anti-dumping initiatives",
      "Memorial and reflection space",
    ],
    cta: { label: "Support the Garden", href: "/garden" },
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
            Our Services
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
            Comprehensive support services designed to empower individuals and strengthen
            our community. Each one teach one.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`scroll-mt-24 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <Card className="overflow-hidden border-border">
                  <div className="grid lg:grid-cols-2">
                    <CardHeader className="flex flex-col justify-center bg-muted p-8 lg:p-12">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                        <service.icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <CardTitle className="mb-4 font-serif text-2xl text-card-foreground md:text-3xl">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {service.description}
                      </CardDescription>
                      {service.cta && (
                        <Button asChild className="mt-6 w-fit">
                          <Link href={service.cta.href}>
                            {service.cta.label}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="p-8 lg:p-12">
                      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary">
                        What We Offer
                      </h4>
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                            <span className="text-sm text-card-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 font-serif text-2xl font-bold text-foreground">
            Need Help Accessing Our Services?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Our team is here to guide you to the right resources. Reach out today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/contact">
                <Phone className="mr-2 h-5 w-5" />
                Contact Us
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/donate">Support Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
