import type { Metadata } from "next";
import { DonationForm } from "@/components/donate/donation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, FileText, Building } from "lucide-react";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Our Community In Unity with a donation. Your contribution directly impacts education, job creation, and community development in Cape Town.",
};

const impactAreas = [
  {
    amount: "R50",
    impact: "Provides school supplies for one child for a month",
  },
  {
    amount: "R250",
    impact: "Sponsors a youth for our mentorship program",
  },
  {
    amount: "R500",
    impact: "Funds a skills training workshop for 10 people",
  },
  {
    amount: "R1000",
    impact: "Supports a family with emergency assistance",
  },
];

export default function DonatePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
            <Heart className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="mb-4 font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
            Support Our Mission
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
            Your generosity helps us empower communities through education, job creation,
            and sustainable development. Every contribution makes a difference.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-background py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Donation Form */}
            <div>
              <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">
                Make a Donation
              </h2>
              <DonationForm />
            </div>

            {/* Impact & Info */}
            <div className="space-y-8">
              {/* Impact Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-card-foreground">
                    Your Impact
                  </CardTitle>
                  <CardDescription>
                    See how your donation makes a real difference in our community.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {impactAreas.map((item) => (
                    <div
                      key={item.amount}
                      className="flex items-center gap-4 rounded-lg bg-muted p-4"
                    >
                      <span className="shrink-0 font-serif text-2xl font-bold text-primary">
                        {item.amount}
                      </span>
                      <span className="text-sm text-muted-foreground">{item.impact}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Trust Signals */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-card-foreground">
                    Why Donate to OCIU?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">Registered NPO</p>
                      <p className="text-sm text-muted-foreground">
                        NPC Registration No: 2024/812217/08
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">Secure Payments</p>
                      <p className="text-sm text-muted-foreground">
                        All transactions are encrypted and secure via Stripe.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">Tax Certificates</p>
                      <p className="text-sm text-muted-foreground">
                        Section 18A tax certificates available for qualifying donations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banking Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-card-foreground">
                    Bank Transfer Details
                  </CardTitle>
                  <CardDescription>
                    Prefer to donate via direct bank transfer? Use these details:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted p-4 font-mono text-sm space-y-1">
                    <p className="text-card-foreground">
                      <span className="text-muted-foreground">Bank:</span> Nedbank
                    </p>
                    <p className="text-card-foreground">
                      <span className="text-muted-foreground">Account Name:</span> Our Community
                      In Unity NPC
                    </p>
                    <p className="text-card-foreground">
                      <span className="text-muted-foreground">Account No:</span> 1328807983
                    </p>
                    <p className="text-card-foreground">
                      <span className="text-muted-foreground">Account Type:</span> Current Account
                    </p>
                    <p className="text-card-foreground">
                      <span className="text-muted-foreground">Branch:</span> Vangate City
                    </p>
                    <p className="text-card-foreground">
                      <span className="text-muted-foreground">Branch Code:</span> 198765
                    </p>
                    <p className="text-card-foreground">
                      <span className="text-muted-foreground">SWIFT:</span> NEDSZAJJ
                    </p>
                    <p className="text-card-foreground">
                      <span className="text-muted-foreground">Reference:</span> Your Name +
                      Donation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
