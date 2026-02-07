import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const CONTACT_PHONE_DISPLAY = "081 569 3926";
const CONTACT_PHONE_E164 = "+27815693926";
const WHATSAPP_NUMBER = "27815693926";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const footerLinks = {
  organization: [
    { name: "About Us", href: "/about" },
    { name: "Our Services", href: "/services" },
    { name: "Community Garden", href: "/garden" },
    { name: "SME Portal", href: "/sme-portal" },
    { name: "Jobs Board", href: "/jobs" },
  ],
  resources: [
    { name: "Podcast", href: "/podcast" },
    { name: "StudyBuddy AI", href: "/studybuddy" },
    { name: "Events", href: "/events" },
    { name: "Gallery", href: "/gallery" },
    { name: "Blog", href: "/blog" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "POPIA Compliance", href: "/popia" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo-square.png"
                alt="Our Community In Unity"
                width={56}
                height={56}
                className="rounded-full"
              />
              <div>
                <span className="font-serif text-lg font-bold text-sidebar-foreground">
                  Our Community In Unity
                </span>
                <p className="text-xs text-sidebar-foreground/70">
                  NPC Reg No: 2024/812217/08
                </p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-sidebar-foreground/80">
              Empower through collective knowledge. Each one teach one.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/ourcommunityinunity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sidebar-foreground/70 transition-colors hover:text-sidebar-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/ourcommunityinunity"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sidebar-foreground/70 transition-colors hover:text-sidebar-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Organization Links */}
          <div>
            <h3 className="mb-4 font-serif text-sm font-semibold uppercase tracking-wider text-sidebar-primary">
              Organization
            </h3>
            <ul className="space-y-3">
              {footerLinks.organization.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-4 font-serif text-sm font-semibold uppercase tracking-wider text-sidebar-primary">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-serif text-sm font-semibold uppercase tracking-wider text-sidebar-primary">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-sidebar-foreground/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Bonteheuwel, Cape Town, South Africa</span>
              </li>
              <li>
                <a
                  href="mailto:info@ourcommunityinunity.org"
                  className="flex items-center gap-2 text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">info@ourcommunityinunity.org</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT_PHONE_E164}`}
                  className="flex items-center gap-2 text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
                >
                  <Phone className="h-4 w-4" />
                  <span>{CONTACT_PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-sidebar-border pt-8 md:flex-row">
          <p className="text-center text-xs text-sidebar-foreground/60">
            &copy; {new Date().getFullYear()} Our Community In Unity NPC. All rights reserved.
          </p>
          <div className="flex gap-4">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
