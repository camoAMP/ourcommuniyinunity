import React from "react"
import type { Metadata } from "next";
import { Playfair_Display, Open_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Our Community In Unity | Empower Through Collective Knowledge",
    template: "%s | Our Community In Unity",
  },
  description:
    "Our Community In Unity (OCIU) is a non-profit organization empowering communities through collective knowledge. Each one teach one. NPC Reg No: 2024/812217/08",
  keywords: [
    "OCIU",
    "Our Community In Unity",
    "NPO",
    "non-profit",
    "community empowerment",
    "Cape Town",
    "Bonteheuwel",
    "South Africa",
    "education",
    "Unspoken Truths",
  ],
  authors: [{ name: "Our Community In Unity" }],
  creator: "Our Community In Unity",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://ourcommunityinunity.org",
    siteName: "Our Community In Unity",
    title: "Our Community In Unity | Empower Through Collective Knowledge",
    description:
      "Empowering communities through collective knowledge. Each one teach one.",
    images: [
      {
        url: "/images/logo-banner.png",
        width: 851,
        height: 315,
        alt: "Our Community In Unity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Community In Unity",
    description: "Empowering communities through collective knowledge.",
    images: ["/images/logo-banner.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  metadataBase: new URL("https://ourcommunityinunity.org"),
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${openSans.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
