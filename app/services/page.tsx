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
  ArrowRight,
  CheckCircle2,
  Phone,
  Flower2,
  Globe,
  Share2,
  Mail,
  Palette,
  Video,
  Sparkles,
  Box,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    'We are not a school. We provide practical services, mentorship, and community support guided by "Each One Teach One."',
};

const services = [
  {
    id: "small-business-services",
    icon: Briefcase,
    title: "Small Business Digital Services",
    description:
      "Affordable solutions to help local entrepreneurs establish and grow their online presence.",
    featureIcons: {
      "Website Development - Simple, responsive websites and e-commerce landing pages using open-source templates":
        Globe,
      "3D Printing - Prototyping and custom prints for business needs": Box,
      "Social Media Setup & Strategy - Profile optimization, content calendars, and engagement strategies":
        Share2,
      "Email Marketing Campaigns - Campaign design, list building, and automation setup": Mail,
      "Graphic Design for Business - Posters, flyers, and promotional materials using accessible design tools":
        Palette,
      "Video Content Creation - Short promotional videos for social media and marketing": Video,
      "Digital Branding Consultation - Logo design guidance, brand messaging, and online presence strategy":
        Sparkles,
    },
    features: [
      "Website Development - Simple, responsive websites and e-commerce landing pages using open-source templates",
      "3D Printing - Prototyping and custom prints for business needs",
      "Social Media Setup & Strategy - Profile optimization, content calendars, and engagement strategies",
      "Email Marketing Campaigns - Campaign design, list building, and automation setup",
      "Graphic Design for Business - Posters, flyers, and promotional materials using accessible design tools",
      "Video Content Creation - Short promotional videos for social media and marketing",
      "Digital Branding Consultation - Logo design guidance, brand messaging, and online presence strategy",
    ],
  },
  {
    id: "job-readiness",
    icon: Briefcase,
    title: "Job Readiness & Career Support",
    description:
      "Practical support to help job seekers succeed in today's digital-first job market.",
    features: [
      "CV writing and formatting",
      "Interview preparation and practice",
      "LinkedIn profile optimization",
      "Online job search strategies",
      "Professional communication skills",
      "Portfolio and personal branding development",
    ],
  },
  {
    id: "community-education",
    icon: Users,
    title: "Community Education Programs",
    description:
      "Accessible learning opportunities for all ages and skill levels.",
    heading: "We connect you with",
    features: [
      "After-school tutoring and homework support",
      "Youth digital literacy programs",
      "Adult education and skills development",
      "Financial literacy basics (budgeting and saving)",
      "One-on-one mentorship matching",
      "Community workshops on in-demand skills",
    ],
  },
  {
    id: "training-mentorship",
    icon: HeartHandshake,
    title: "Guide to FREE Training & Mentorship",
    description:
      "Personalized support to help individuals and businesses implement what they learn.",
    heading: "What we help you find",
    features: [
      "Monthly digital clinics for ongoing support",
      "One-on-one mentorship sessions",
      "Train-the-trainer programs for community leaders",
      "Troubleshooting and technical support",
      "Business planning and strategy sessions",
      "Peer learning and networking opportunities",
    ],
  },
  {
    id: "youth-agriculture",
    icon: Flower2,
    title: "Youth Agriculture & Food Gardening",
    description:
      "Hands-on environmental education teaching kids sustainable food growing and healthy living.",
    features: [
      "Practical gardening skills for children",
      "Planting, tending, and harvesting vegetables",
      "Understanding soil health and composting",
      "Sustainable growing methods and water conservation",
      "Connecting food growth to nutrition and healthy eating",
      "Environmental stewardship and ecosystem awareness",
    ],
  },
  {
    id: "volunteer-program",
    icon: Building2,
    title: "Volunteer Program: SME Growth Support",
    description:
      "Gain real-world experience while helping local businesses thrive.",
    heading: "Volunteer Opportunities Include",
    details: [
      {
        title: "Eligibility",
        items: [
          "Open to individuals aged 16 and older",
          "No prior professional experience required",
          "Suitable for students, job seekers, career changers, and anyone looking to build skills",
        ],
      },
      {
        title: "Time Commitment",
        items: [
          "Completely flexible - you decide your availability",
          "Work as much or as little as your schedule allows",
          "Remote and in-person options available",
        ],
      },
      {
        title: "How It Works",
        items: [
          "Volunteers work directly with small businesses to support their growth",
          "Businesses receive affordable professional assistance",
          "Volunteers build portfolio experience and practical skills",
          "Commission-based or experience-based compensation depending on the project",
          "Hands-on mentorship and guidance from the OCIU team",
        ],
      },
    ],
    features: [
      "Digital marketing support",
      "Social media management",
      "Website updates and maintenance",
      "Graphic design projects",
      "Content creation",
      "Business strategy assistance",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-0 font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
            Our Services
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
            We are not a school. We provide practical services, mentorship, and community
            support guided by "Each One Teach One."
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {services.map((service, index) => {
              const isSmallBusiness = service.id === "small-business-services";
              return (
              <div
                key={service.id}
                id={service.id}
                className={`scroll-mt-24 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <Card className="overflow-hidden border-border">
                  <div className="grid lg:grid-cols-2">
                    <CardHeader
                      className={`flex flex-col justify-center bg-muted p-8 lg:p-12 ${
                        isSmallBusiness ? "items-center text-center" : ""
                      }`}
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                        <service.icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <CardTitle
                        className={`font-serif text-2xl text-card-foreground md:text-3xl ${
                          isSmallBusiness ? "mb-0" : "mb-4"
                        }`}
                      >
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
                    <CardContent
                      className={`p-8 lg:p-12 ${isSmallBusiness ? "text-center" : ""}`}
                    >
                      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary">
                        {service.heading ?? "What We Offer"}
                      </h4>
                      <ul
                        className={`grid gap-3 sm:grid-cols-2 ${
                          isSmallBusiness ? "justify-items-center" : ""
                        }`}
                      >
                        {service.features.map((feature) => {
                          const FeatureIcon = service.featureIcons?.[feature];
                          return (
                            <li
                              key={feature}
                              className={`flex items-start gap-3 rounded-lg border border-border bg-background/60 p-3 ${
                                isSmallBusiness ? "flex-col items-center text-center" : ""
                              }`}
                            >
                              {FeatureIcon ? (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                                  <FeatureIcon className="h-4 w-4" />
                                </div>
                              ) : (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                              )}
                              <span className="text-sm text-card-foreground">{feature}</span>
                            </li>
                          );
                        })}
                      </ul>
                      {service.details && (
                        <div className="mt-6 space-y-5">
                          {service.details.map((detail) => (
                            <div key={detail.title}>
                              <p className="text-sm font-semibold text-card-foreground">
                                {detail.title}
                              </p>
                              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                                {detail.items.map((item) => (
                                  <li key={item} className="flex items-start gap-2">
                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 font-serif text-2xl font-bold text-foreground">
            Need Help Getting Started?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Our team is here to guide you. Whether you're looking to learn new skills,
            start an online business, or find employment, we'll connect you with the
            right resources.
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
