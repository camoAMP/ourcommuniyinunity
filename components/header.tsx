"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Heart } from "lucide-react";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Garden", href: "/garden" },
  { name: "Podcast", href: "/podcast" },
  { name: "StudyBuddy", href: "/studybuddy" },
  { name: "SME Portal", href: "/sme-portal" },
  { name: "AI Builder", href: "/webflow-ai-builder" },
  { name: "Jobs", href: "/jobs" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo-square.png"
            alt="Our Community In Unity"
            width={48}
            height={48}
            className="font-normal rounded-md border-secondary-foreground py-0 opacity-100"
          />
          <div className="hidden sm:block">
            <span className="font-serif text-lg font-bold text-primary">
              Our Community In Unity
            </span>
            <p className="text-xs text-muted-foreground">Each one teach one</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
          <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link href="/donate">
              <Heart className="mr-2 h-4 w-4" />
              Donate
            </Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-sidebar text-sidebar-foreground">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-6">
              <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <Image
                  src="/images/logo-square.png"
                  alt="Our Community In Unity"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="font-serif text-lg font-bold text-sidebar-foreground">OCIU</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-base font-medium text-sidebar-foreground/80 transition-colors hover:text-sidebar-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-4 w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                >
                  <Link href="/donate" onClick={() => setIsOpen(false)}>
                    <Heart className="mr-2 h-4 w-4" />
                    Donate
                  </Link>
                </Button>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
