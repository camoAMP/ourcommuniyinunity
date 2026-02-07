"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  Home,
  Leaf,
  Menu,
  Mic,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Services", href: "/services", icon: Wrench },
  { name: "Garden", href: "/garden", icon: Leaf },
  { name: "Podcast", href: "/podcast", icon: Mic },
  { name: "StudyBuddy", href: "/studybuddy", icon: GraduationCap },
  { name: "SME Portal", href: "/sme-portal", icon: Building2 },
  { name: "AI Builder", href: "/webflow-ai-builder", icon: Sparkles },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
          <SheetContent
            side="right"
            className="w-[min(420px,100vw)] border-l border-sidebar-border bg-sidebar text-sidebar-foreground p-0 [&>button]:hidden"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="relative flex h-full flex-col">
              <div className="pointer-events-none absolute inset-0 opacity-70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sidebar-primary/35 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-black/20 via-transparent to-transparent" />
              </div>

              <div className="relative flex items-center justify-between gap-4 px-5 pb-4 pt-5">
                <Link
                  href="/"
                  className="flex items-center gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <Image
                    src="/images/logo-square.png"
                    alt="Our Community In Unity"
                    width={44}
                    height={44}
                    className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/20"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-serif text-lg font-bold leading-5 text-sidebar-foreground">
                      OCIU
                    </p>
                    <p className="truncate text-xs text-sidebar-foreground/70">
                      Each one teach one
                    </p>
                  </div>
                </Link>

                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-full border border-sidebar-border/60 bg-sidebar-accent/20 text-sidebar-foreground hover:bg-sidebar-accent"
                  >
                    <X className="size-5" />
                    <span className="sr-only">Close menu</span>
                  </Button>
                </SheetClose>
              </div>

              <nav className="relative flex-1 overflow-y-auto px-3 pb-5">
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-9 items-center justify-center rounded-lg border transition-colors",
                            isActive
                              ? "border-sidebar-primary/50 bg-sidebar-primary text-sidebar-primary-foreground"
                              : "border-sidebar-border/60 bg-sidebar-accent/20 text-sidebar-foreground group-hover:border-sidebar-border group-hover:bg-sidebar-accent/40",
                          )}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              <div className="relative border-t border-sidebar-border/80 p-4">
                <Button
                  asChild
                  className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                >
                  <Link href="/donate" onClick={() => setIsOpen(false)}>
                    <Heart className="mr-2 h-4 w-4" />
                    Donate
                  </Link>
                </Button>
                <p className="mt-3 text-center text-[11px] text-sidebar-foreground/70">
                  Join the mission. Support community learning.
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
