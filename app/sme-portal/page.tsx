import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  Users,
  TrendingUp,
  BookOpen,
  Calendar,
  ArrowRight,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
  CheckCircle2,
  FileText,
  Banknote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "SME Portal",
  description:
    "Support and resources for small and medium enterprises in Cape Town. Access SEDFA and NYDA funding, business registration, training, and networking.",
};

const resources = [
  {
    icon: BookOpen,
    title: "CIPC Registration",
    description: "Register your business with the Companies and Intellectual Property Commission.",
    href: "https://www.cipc.co.za/",
    external: true,
  },
  {
    icon: TrendingUp,
    title: "SARS eFiling",
    description: "Register for tax and submit your business returns online.",
    href: "https://www.sarsefiling.co.za/",
    external: true,
  },
  {
    icon: Users,
    title: "UIF Registration",
    description: "Register as an employer with the Unemployment Insurance Fund.",
    href: "https://www.labour.gov.za/services/useful-links/services-provided-uif",
    external: true,
  },
  {
    icon: Calendar,
    title: "B-BBEE Certificates",
    description: "Apply for your Broad-Based Black Economic Empowerment certificate.",
    href: "https://www.thedtic.gov.za/financial-and-non-financial-support/b-bbee/",
    external: true,
  },
];

const featuredBusinesses: Array<{
  name: string;
  category: string;
  description: string;
  location: string;
  phone: string;
}> = [];

const builtWebsites = [
  {
    name: "Buddies Worldwide",
    url: "https://buddiesworldwide.online/",
    description: "Community-driven support and connection platform.",
  },
  {
    name: "CPT Community Adults",
    url: "https://cptcommunityadults.fun/",
    description: "Learning, jobs, and community resources for adults.",
  },
  {
    name: "Beloveful",
    url: "https://beloveful.com/",
    description: "Stories and initiatives that celebrate community care.",
  },
  {
    name: "IRL Events",
    url: "https://www.irlevents.fun/",
    description: "Event listings and community gatherings.",
  },
];

export default function SMEPortalPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
              <Building2 className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="mb-4 font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
              SME Portal
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Supporting small and medium enterprises in Cape Town with resources,
              training, and networking opportunities. Grow your business with OCIU.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Link href="#register">
                  Register Your Business
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="#directory">Browse Directory</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SEDFA Funding Section */}
      <section id="sedfa" className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <Badge className="mb-4 bg-secondary/20 text-secondary hover:bg-secondary/30">
              Government Funding
            </Badge>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              SEDFA Funding for SMEs
            </h2>
            <p className="max-w-3xl text-muted-foreground">
              The Small Enterprise Development and Finance Agency (SEDFA) was formed in October 2024 
              when SEFA, SEDA, and CBDA merged. They provide financing from R500,000 to R15 million 
              for qualifying businesses.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* SEDFA Info Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl">About SEDFA</CardTitle>
                  <Banknote className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold text-card-foreground">What They Offer</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Direct Lending: Asset and property financing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Wholesale Lending: Credit guarantees and equity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Post-funding business development support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Technical and commercial support</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-card-foreground">Priority Sectors</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Services</Badge>
                    <Badge variant="outline">Manufacturing</Badge>
                    <Badge variant="outline">Agriculture</Badge>
                    <Badge variant="outline">Construction</Badge>
                    <Badge variant="outline">Green Industries</Badge>
                    <Badge variant="outline">IT</Badge>
                  </div>
                </div>
                <div className="pt-4">
                  <Button asChild className="w-full">
                    <a
                      href="https://www.sedfa.org.za/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit SEDFA Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SEDFA How-To Guide */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl">How to Apply for SEDFA Funding</CardTitle>
                  <FileText className="h-8 w-8 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      1
                    </span>
                    <div>
                      <h4 className="font-semibold text-card-foreground">Prepare Your Documents</h4>
                      <p className="text-sm text-muted-foreground">
                        Certified ID copies, business registration (CIPC), and compliance documents
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      2
                    </span>
                    <div>
                      <h4 className="font-semibold text-card-foreground">Create Business Plan</h4>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive plan showing viability, growth potential, and financial projections
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      3
                    </span>
                    <div>
                      <h4 className="font-semibold text-card-foreground">Financial Statements</h4>
                      <p className="text-sm text-muted-foreground">
                        Personal income/expenditure schedule, assets and liabilities statement, tax clearance
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      4
                    </span>
                    <div>
                      <h4 className="font-semibold text-card-foreground">Submit Application</h4>
                      <p className="text-sm text-muted-foreground">
                        Apply online at sefa.finfind.co.za or email helpline@sefa.org.za
                      </p>
                    </div>
                  </li>
                </ol>
                <div className="mt-6 rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Contact SEDFA: <a href="tel:0127489600" className="text-primary hover:underline">012 748 9600</a> | 
                    <a href="mailto:helpline@sefa.org.za" className="ml-1 text-primary hover:underline">helpline@sefa.org.za</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* NYDA Funding Section */}
      <section id="nyda" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
              Youth Funding
            </Badge>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              NYDA Grants for Young Entrepreneurs
            </h2>
            <p className="max-w-3xl text-muted-foreground">
              The National Youth Development Agency (NYDA) provides grants from R1,000 to R250,000 
              for young South African entrepreneurs aged 18-35.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* NYDA Info Card */}
            <Card className="border-2 border-secondary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl">About NYDA Grants</CardTitle>
                  <Users className="h-8 w-8 text-secondary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold text-card-foreground">Grant Amounts</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Standard grants: R1,000 - R200,000</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Agriculture & Tech projects: Up to R250,000</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-card-foreground">Non-Financial Support Included</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Mentorship from experienced entrepreneurs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Business Consultancy Services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Market Linkages & Networking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>Business Management Training</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-4">
                  <Button asChild className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <a
                      href="https://www.nyda.gov.za/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit NYDA Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* NYDA How-To Guide */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl">How to Apply for NYDA Funding</CardTitle>
                  <FileText className="h-8 w-8 text-secondary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 rounded-lg bg-secondary/10 p-4">
                  <h4 className="mb-2 font-semibold text-card-foreground">Eligibility Requirements</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- South African citizen aged 18-35</li>
                    <li>- Business operates within South Africa</li>
                    <li>- Skills/experience relevant to your business</li>
                    <li>- Active involvement in day-to-day operations</li>
                  </ul>
                </div>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                      1
                    </span>
                    <div>
                      <h4 className="font-semibold text-card-foreground">Visit NYDA Branch</h4>
                      <p className="text-sm text-muted-foreground">
                        Find your nearest NYDA branch or call the toll-free line
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                      2
                    </span>
                    <div>
                      <h4 className="font-semibold text-card-foreground">Complete Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        Business needs assessment to determine suitable support
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                      3
                    </span>
                    <div>
                      <h4 className="font-semibold text-card-foreground">Submit Application</h4>
                      <p className="text-sm text-muted-foreground">
                        Complete application form with required documents (ID, business plan)
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                      4
                    </span>
                    <div>
                      <h4 className="font-semibold text-card-foreground">Await Approval</h4>
                      <p className="text-sm text-muted-foreground">
                        NYDA reviews application and provides feedback
                      </p>
                    </div>
                  </li>
                </ol>
                <div className="mt-6 rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    NYDA Toll-Free: <a href="tel:0800585858" className="text-primary hover:underline">0800 58 58 58</a> | 
                    <a href="mailto:info@nyda.gov.za" className="ml-1 text-primary hover:underline">info@nyda.gov.za</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Government Resources Section */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
              Official Resources
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Government Registration Links
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((resource) => (
              <Card
                key={resource.title}
                className="group transition-all hover:border-primary hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <resource.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-lg text-card-foreground">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{resource.description}</CardDescription>
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Visit Website
                    <ExternalLink className="ml-1 h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Development Websites */}
      <section id="directory" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">
              Our Development Websites
            </p>
            <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Our Development Websites We Built
            </h2>
            <p className="mb-6 text-muted-foreground">
              Support your community by exploring the projects we have launched.
            </p>
          </div>

          {builtWebsites.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {builtWebsites.map((site) => (
                  <Card key={site.url} className="transition-all hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="font-serif text-lg text-card-foreground">
                        {site.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="overflow-hidden rounded-lg border border-border bg-muted">
                        <div className="relative aspect-video w-full">
                          <iframe
                            src={site.url}
                            title={`${site.name} preview`}
                            className="h-full w-full pointer-events-none"
                            loading="lazy"
                            scrolling="no"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                          />
                        </div>
                      </div>
                      <CardDescription>{site.description}</CardDescription>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                      >
                        Visit Website
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>

            </>
          ) : (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
              No websites are listed yet. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* Register CTA */}
      <section id="register" className="bg-primary py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Globe className="mx-auto mb-6 h-12 w-12 text-secondary" />
            <h2 className="mb-4 font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
              List Your Business
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Join our SME directory and connect with the community. Registration is free
              for OCIU-affiliated businesses.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Link href="/sme-portal/register">
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
