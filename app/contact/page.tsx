import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Our Community In Unity via phone, WhatsApp, or email.",
};

const CONTACT_PHONE_DISPLAY = "081 569 3926";
const CONTACT_PHONE_E164 = "+27815693926";
const WHATSAPP_NUMBER = "27815693926";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
const CONTACT_EMAIL = "info@ourcommunityinunity.org";

export default function ContactPage() {
  return (
    <>
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-3 font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
            Reach out for support, services, volunteering, or partnerships. We reply as soon as possible.
          </p>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  WhatsApp
                </CardTitle>
                <CardDescription>Fastest way to reach us.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  WhatsApp us on <span className="font-medium text-foreground">{CONTACT_PHONE_DISPLAY}</span>.
                </p>
                <Button asChild className="w-full">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    Open WhatsApp Chat
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                  <Phone className="h-5 w-5 text-primary" />
                  Call
                </CardTitle>
                <CardDescription>Talk to a team member.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Phone: <span className="font-medium text-foreground">{CONTACT_PHONE_DISPLAY}</span>
                </p>
                <Button asChild variant="secondary" className="w-full">
                  <a href={`tel:${CONTACT_PHONE_E164}`}>Call Now</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
                <CardDescription>For longer messages and documents.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{CONTACT_EMAIL}</span>
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a href={`mailto:${CONTACT_EMAIL}`}>Send Email</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card className="border-border/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
                <CardDescription>Where we operate.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Bonteheuwel, Cape Town, South Africa
                </p>
                <Button asChild variant="outline">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Bonteheuwel%2C%20Cape%20Town%2C%20South%20Africa"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Maps
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

