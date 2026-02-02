"use client";

import { ChangeEvent, DragEvent, FormEvent, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Download,
  Globe,
  GripVertical,
  Home,
  Lock,
  ClipboardCopy,
  Copy,
  Eye,
  Library,
  LogIn,
  LogOut,
  Monitor,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  UserPlus,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type ProjectType =
  | "Landing Page"
  | "SaaS Site"
  | "Portfolio"
  | "Component Library"
  | "Marketing Site";

type MarketplaceMode = "yes" | "no";
type MaturityLevel = "1-2" | "2-3" | "3-4";
type LicenseType = "" | "FREE" | "COMMERCIAL" | "FREEMIUM";
type StudioTab = "Design" | "CMS" | "App Gen" | "Insights";
type StudioPanel = "library" | "canvas" | "inspector";
type ViewportMode = "desktop" | "tablet" | "mobile";
type InspectorMode = "Style" | "Settings" | "Interactions";
type AuthMode = "signin" | "signup";
type VariableSection = "colors" | "typography" | "sizes" | "interactions";
type TemplateFilter = "all" | (typeof previewPageOptions)[number];

type DesignTokens = {
  colors: {
    surface: string;
    brand: string;
    heading: string;
    body: string;
    buttonText: string;
    border: string;
    sectionBorder: string;
    gradientFrom: string;
    gradientVia: string;
    gradientTo: string;
  };
  typography: {
    headingMin: number;
    headingMax: number;
    headingLineHeight: number;
    bodySize: number;
    navSize: number;
    headingFont: string;
    bodyFont: string;
  };
  sizes: {
    frameRadius: number;
    sectionGap: number;
    buttonRadius: number;
    gradientHeight: number;
    previewInset: number;
  };
  interactions: {
    hoverLiftEnabled: boolean;
    softShadowEnabled: boolean;
    transitionMs: number;
  };
};

type DesignTokenPatch = {
  colors?: Partial<DesignTokens["colors"]>;
  typography?: Partial<DesignTokens["typography"]>;
  sizes?: Partial<DesignTokens["sizes"]>;
  interactions?: Partial<DesignTokens["interactions"]>;
};

type BrandKit = {
  id: string;
  name: string;
  description: string;
  patch: DesignTokenPatch;
};

type PreviewContent = {
  eyebrow: string;
  heading: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
};

type SiteTemplate = {
  id: string;
  name: string;
  description: string;
  page: (typeof previewPageOptions)[number];
  components: string[];
  brandKitId: string;
  preview: PreviewContent;
  heroImageUrl?: string;
};

type SiteVariableCollection = {
  id: string;
  name: string;
};

const projectTypes: ProjectType[] = [
  "Landing Page",
  "SaaS Site",
  "Portfolio",
  "Component Library",
  "Marketing Site",
];

const studioTabs: StudioTab[] = ["Design", "CMS", "App Gen", "Insights"];
const inspectorTabs: InspectorMode[] = ["Style", "Settings", "Interactions"];
const previewPageOptions = ["Home", "Services", "Jobs", "Podcast"] as const;
const previewWidths: Record<ViewportMode, { label: string; width: number }> = {
  desktop: { label: "1555px", width: 1555 },
  tablet: { label: "991px", width: 991 },
  mobile: { label: "390px", width: 390 },
};

const variableSections: { id: VariableSection; label: string }[] = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "sizes", label: "Sizes" },
  { id: "interactions", label: "Interactions" },
];

const fontOptions: { label: string; value: string }[] = [
  { label: "Playfair Display", value: "'Playfair Display', 'Times New Roman', serif" },
  { label: "Open Sans", value: "'Open Sans', 'Segoe UI', sans-serif" },
  { label: "Georgia Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Avenir Sans", value: "'Avenir Next', 'Segoe UI', sans-serif" },
  { label: "Trebuchet Sans", value: "'Trebuchet MS', 'Segoe UI', sans-serif" },
  { label: "Source Sans", value: "'Source Sans Pro', 'Segoe UI', sans-serif" },
  { label: "Helvetica Neue", value: "'Helvetica Neue', Arial, sans-serif" },
];

const emptyPreviewContent: PreviewContent = {
  eyebrow: "",
  heading: "",
  body: "",
  primaryCta: "",
  secondaryCta: "",
};

const createDefaultDesignTokens = (): DesignTokens => ({
  colors: {
    surface: "#f6f4ff",
    brand: "#4c36b3",
    heading: "#2d2468",
    body: "#4f4a76",
    buttonText: "#f8f7ff",
    border: "#c9c2ea",
    sectionBorder: "#d8d3ef",
    gradientFrom: "#e4d278",
    gradientVia: "#ece5cb",
    gradientTo: "#ddd6f5",
  },
  typography: {
    headingMin: 52,
    headingMax: 122,
    headingLineHeight: 95,
    bodySize: 20,
    navSize: 16,
    headingFont: "'Playfair Display', 'Times New Roman', serif",
    bodyFont: "'Open Sans', 'Segoe UI', sans-serif",
  },
  sizes: {
    frameRadius: 18,
    sectionGap: 36,
    buttonRadius: 14,
    gradientHeight: 144,
    previewInset: 12,
  },
  interactions: {
    hoverLiftEnabled: true,
    softShadowEnabled: true,
    transitionMs: 180,
  },
});

const cloneDesignTokens = (tokens: DesignTokens): DesignTokens => ({
  colors: { ...tokens.colors },
  typography: { ...tokens.typography },
  sizes: { ...tokens.sizes },
  interactions: { ...tokens.interactions },
});

const mergeDesignTokens = (base: DesignTokens, patch: DesignTokenPatch): DesignTokens => ({
  colors: {
    ...base.colors,
    ...patch.colors,
  },
  typography: {
    ...base.typography,
    ...patch.typography,
  },
  sizes: {
    ...base.sizes,
    ...patch.sizes,
  },
  interactions: {
    ...base.interactions,
    ...patch.interactions,
  },
});

const brandKits: BrandKit[] = [
  {
    id: "ociu",
    name: "OCIU Core Brand",
    description: "Primary violet + secondary gold palette used across the OCIU website.",
    patch: {
      colors: {
        surface: "#f6f4ff",
        brand: "#4c36b3",
        heading: "#2d2468",
        body: "#4f4a76",
        buttonText: "#f8f7ff",
        border: "#c9c2ea",
        sectionBorder: "#d8d3ef",
        gradientFrom: "#e4d278",
        gradientVia: "#ece5cb",
        gradientTo: "#ddd6f5",
      },
      typography: {
        headingFont: "'Playfair Display', 'Times New Roman', serif",
        bodyFont: "'Open Sans', 'Segoe UI', sans-serif",
      },
    },
  },
  {
    id: "startup",
    name: "Indigo Startup",
    description: "High-contrast SaaS style with clean sans typography.",
    patch: {
      colors: {
        surface: "#f3f6ff",
        brand: "#2437d0",
        heading: "#1c2ca8",
        body: "#31408f",
        buttonText: "#eef2ff",
        border: "#b7c3f3",
        sectionBorder: "#cad3f7",
        gradientFrom: "#cfd8ff",
        gradientVia: "#e3e8ff",
        gradientTo: "#ccd9ff",
      },
      typography: {
        headingFont: "'Avenir Next', 'Segoe UI', sans-serif",
        bodyFont: "'Helvetica Neue', Arial, sans-serif",
      },
    },
  },
  {
    id: "earth",
    name: "Earthy Studio",
    description: "Muted greens and tactile tones for service brands.",
    patch: {
      colors: {
        surface: "#ebece4",
        brand: "#355c49",
        heading: "#254436",
        body: "#466355",
        buttonText: "#eef4ef",
        border: "#acc5b6",
        sectionBorder: "#c2d5ca",
        gradientFrom: "#c8d8cf",
        gradientVia: "#d8e2dc",
        gradientTo: "#c3d2c9",
      },
      typography: {
        headingFont: "Georgia, 'Times New Roman', serif",
        bodyFont: "'Trebuchet MS', 'Segoe UI', sans-serif",
      },
    },
  },
];

const defaultVariableCollections: SiteVariableCollection[] = [
  { id: "base", name: "Base collection" },
];

const accountStoreKey = "webflow_builder_accounts_v1";
const accountSessionKey = "webflow_builder_session_v1";

type AccountRecord = {
  email: string;
  password: string;
  createdAt: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const getInitialSessionEmail = () => {
  if (typeof window === "undefined") return "";
  try {
    return normalizeEmail(localStorage.getItem(accountSessionKey) ?? "");
  } catch {
    return "";
  }
};

type LibraryComponent = {
  id: string;
  name: string;
  summary: string;
  includes: string;
  previewHint: string;
};

const componentCards: LibraryComponent[] = [
  {
    id: "navigation",
    name: "Navigation",
    summary: "Brand, links, mobile menu behavior",
    includes: "Logo, nav links, responsive toggle",
    previewHint: "Keep nav shallow and action-focused on small screens.",
  },
  {
    id: "hero",
    name: "Hero Section",
    summary: "Headline + value proposition + CTA",
    includes: "Headline, subtext, CTA, supporting media",
    previewHint: "Answer the core user question in the first two lines.",
  },
  {
    id: "feature-grid",
    name: "Feature Grid",
    summary: "Show key outcomes and proof points",
    includes: "Icon cards, benefits list, responsive rows",
    previewHint: "Use 3-up on desktop, stack to single column on mobile.",
  },
  {
    id: "testimonial",
    name: "Testimonial",
    summary: "Social proof and customer outcomes",
    includes: "Quote, attribution, metadata",
    previewHint: "Pair each quote with role/company for credibility.",
  },
  {
    id: "cta",
    name: "Call To Action",
    summary: "Single conversion objective",
    includes: "Offer, supporting copy, primary CTA",
    previewHint: "One CTA per section to avoid diluted intent.",
  },
  {
    id: "footer",
    name: "Footer",
    summary: "Site map and legal links",
    includes: "Link groups, copyright, contact routes",
    previewHint: "Include legal, contact, and support links by default.",
  },
];

const componentCardMap = Object.fromEntries(
  componentCards.map((component) => [component.id, component]),
) as Record<string, LibraryComponent>;

const defaultCanvasComponentIds: string[] = [];

const prebuiltSiteTemplates: SiteTemplate[] = [
  {
    id: "ociu-community-hub",
    name: "OCIU Community Hub",
    description: "OCIU-aligned homepage for programs, jobs, podcast, and donation pathways.",
    page: "Home",
    components: ["navigation", "hero", "feature-grid", "testimonial", "cta", "footer"],
    brandKitId: "ociu",
    preview: {
      eyebrow: "Each one teach one",
      heading: "Empower Through Collective Knowledge",
      body:
        "OCIU connects communities through mentorship, local job access, study support, and practical services that strengthen families and neighborhoods.",
      primaryCta: "Explore Programs",
      secondaryCta: "Support OCIU",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ociu-studybuddy-campus",
    name: "OCIU StudyBuddy Campus",
    description: "Education-focused site for tutoring, mentorship, and study resources.",
    page: "Services",
    components: ["navigation", "hero", "feature-grid", "cta", "footer"],
    brandKitId: "ociu",
    preview: {
      eyebrow: "Study support for every learner",
      heading: "Learn Faster With Mentors Who Care",
      body:
        "Offer practical tutoring, exam prep tracks, and accountability check-ins designed for students and adult learners in local communities.",
      primaryCta: "Join StudyBuddy",
      secondaryCta: "View Learning Tracks",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ociu-jobs-board-plus",
    name: "OCIU Jobs Board Plus",
    description: "Jobs-first layout with candidate resources and employer pathways.",
    page: "Jobs",
    components: ["navigation", "hero", "feature-grid", "testimonial", "cta", "footer"],
    brandKitId: "ociu",
    preview: {
      eyebrow: "Local opportunities, real impact",
      heading: "Connect Job Seekers With Employers Faster",
      body:
        "Publish openings, support applicants with CV guidance, and help local employers hire skilled candidates through one clear process.",
      primaryCta: "Browse Open Roles",
      secondaryCta: "Post a Vacancy",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ociu-podcast-network",
    name: "OCIU Podcast Network",
    description: "Podcast-centered website with episodes, guests, and community stories.",
    page: "Podcast",
    components: ["navigation", "hero", "feature-grid", "testimonial", "footer"],
    brandKitId: "ociu",
    preview: {
      eyebrow: "Voices from our communities",
      heading: "Share Stories That Inspire Action",
      body:
        "Publish episodes, highlight guests, and organize community conversations into playlists people can explore by topic and relevance.",
      primaryCta: "Listen to Episodes",
      secondaryCta: "Suggest a Guest",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ociu-volunteer-drive",
    name: "OCIU Volunteer Drive",
    description: "Volunteer recruitment template with role listings and onboarding path.",
    page: "Home",
    components: ["navigation", "hero", "feature-grid", "cta", "footer"],
    brandKitId: "ociu",
    preview: {
      eyebrow: "Serve where it matters most",
      heading: "Recruit Volunteers For Every Program",
      body:
        "Match volunteers to causes, show weekly commitments, and provide simple onboarding steps so contributors can start helping quickly.",
      primaryCta: "Become a Volunteer",
      secondaryCta: "See Open Roles",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ociu-donation-campaign",
    name: "OCIU Donation Campaign",
    description: "Fundraising page template for campaigns, impact proof, and trust signals.",
    page: "Home",
    components: ["navigation", "hero", "testimonial", "cta", "footer"],
    brandKitId: "ociu",
    preview: {
      eyebrow: "Fuel real community outcomes",
      heading: "Launch Donation Campaigns With Clear Impact",
      body:
        "Present campaign milestones, beneficiary stories, and transparent goals that help donors see where support goes and why it matters.",
      primaryCta: "Donate Now",
      secondaryCta: "View Impact Report",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1531206715517-5c2f35717a9f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "ociu-sme-growth-hub",
    name: "OCIU SME Growth Hub",
    description: "Service portal for SME support, grants, and business growth resources.",
    page: "Services",
    components: ["navigation", "hero", "feature-grid", "cta", "footer"],
    brandKitId: "ociu",
    preview: {
      eyebrow: "Grow local enterprises",
      heading: "Support SMEs With Tools, Mentors, and Funding Paths",
      body:
        "Show grant tracks, coaching options, and practical resources that help entrepreneurs launch, stabilize, and scale community businesses.",
      primaryCta: "Explore SME Support",
      secondaryCta: "Book Advisor Session",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "community-garden-collective",
    name: "Community Garden Collective",
    description: "Program template for garden projects, produce drives, and events.",
    page: "Services",
    components: ["navigation", "hero", "feature-grid", "testimonial", "footer"],
    brandKitId: "earth",
    preview: {
      eyebrow: "Grow food, grow connection",
      heading: "Turn Shared Green Spaces Into Community Assets",
      body:
        "Coordinate volunteers, publish harvest schedules, and showcase local outcomes from gardening programs that feed and educate families.",
      primaryCta: "Join Garden Program",
      secondaryCta: "View Event Calendar",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "youth-mentorship-network",
    name: "Youth Mentorship Network",
    description: "Mentorship-first template for youth pathways and leadership support.",
    page: "Services",
    components: ["navigation", "hero", "feature-grid", "testimonial", "cta", "footer"],
    brandKitId: "earth",
    preview: {
      eyebrow: "Guidance that changes futures",
      heading: "Build Mentorship Pipelines for Youth Success",
      body:
        "Pair mentors and mentees, map progression milestones, and share stories that demonstrate educational and professional growth.",
      primaryCta: "Apply for Mentorship",
      secondaryCta: "Become a Mentor",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "local-events-portal",
    name: "Local Events Portal",
    description: "Events-driven homepage for workshops, meetings, and local campaigns.",
    page: "Home",
    components: ["navigation", "hero", "feature-grid", "cta", "footer"],
    brandKitId: "ociu",
    preview: {
      eyebrow: "Stay connected to every initiative",
      heading: "Publish Community Events With Clear Next Steps",
      body:
        "List workshops, town halls, and partner activations with registration flows that help members join and participate without friction.",
      primaryCta: "View Upcoming Events",
      secondaryCta: "Submit an Event",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "saas-launch",
    name: "SaaS Product Launch",
    description: "Conversion-focused SaaS homepage with proof and onboarding CTA.",
    page: "Services",
    components: ["navigation", "hero", "feature-grid", "testimonial", "cta", "footer"],
    brandKitId: "startup",
    preview: {
      eyebrow: "The AI workflow command center for lean teams",
      heading: "Ship campaigns in hours, not sprint cycles",
      body:
        "Plan, launch, and optimize every growth campaign from one dashboard. Track performance in real time and automate repetitive marketing tasks.",
      primaryCta: "Start free trial",
      secondaryCta: "Book demo",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "mobile-app-release",
    name: "Mobile App Release",
    description: "Template for app launch campaigns, waitlists, and feature rollouts.",
    page: "Home",
    components: ["navigation", "hero", "feature-grid", "cta", "footer"],
    brandKitId: "startup",
    preview: {
      eyebrow: "Built for on-the-go communities",
      heading: "Launch Your Mobile App With Confidence",
      body:
        "Show key features, collect beta signups, and onboard users with a clear path from first visit to active product adoption.",
      primaryCta: "Join the Waitlist",
      secondaryCta: "See Product Tour",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "creator-podcast-network",
    name: "Creator Podcast Network",
    description: "Podcast and media template for content teams and creators.",
    page: "Podcast",
    components: ["navigation", "hero", "feature-grid", "testimonial", "footer"],
    brandKitId: "startup",
    preview: {
      eyebrow: "Audio-first storytelling platform",
      heading: "Scale Your Podcast Audience Episode by Episode",
      body:
        "Feature your latest episodes, host profiles, and curated playlists while giving listeners easy subscribe and follow options.",
      primaryCta: "Play Latest Episode",
      secondaryCta: "Browse Seasons",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "recruiting-hub",
    name: "Talent & Recruiting Hub",
    description: "Recruiting website with jobs focus, trust proof, and contact CTA.",
    page: "Jobs",
    components: ["navigation", "hero", "feature-grid", "testimonial", "cta", "footer"],
    brandKitId: "earth",
    preview: {
      eyebrow: "Hiring pipelines built for fast-moving teams",
      heading: "Find qualified candidates before your competitors do",
      body:
        "Publish roles, manage candidate funnels, and coordinate interview panels with one structured hiring workspace tailored for growing companies.",
      primaryCta: "View open roles",
      secondaryCta: "Talk to recruiting",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "nonprofit-impact-report",
    name: "Nonprofit Impact Report",
    description: "Story-first nonprofit site for annual impact and transparency.",
    page: "Home",
    components: ["navigation", "hero", "testimonial", "cta", "footer"],
    brandKitId: "earth",
    preview: {
      eyebrow: "Transparent outcomes, shared progress",
      heading: "Present Impact Data in a Human-Centered Format",
      body:
        "Combine reports, beneficiary stories, and milestone data to communicate measurable community outcomes and build donor confidence.",
      primaryCta: "Read Impact Report",
      secondaryCta: "Support the Mission",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "neighborhood-support-center",
    name: "Neighborhood Support Center",
    description: "Support services template for counseling, food, and emergency aid.",
    page: "Services",
    components: ["navigation", "hero", "feature-grid", "cta", "footer"],
    brandKitId: "earth",
    preview: {
      eyebrow: "Direct support when people need it most",
      heading: "Coordinate Community Relief and Support Services",
      body:
        "Centralize counseling pathways, food support programs, and emergency contact resources in one trusted destination for local residents.",
      primaryCta: "Find Support Services",
      secondaryCta: "Refer a Family",
    },
    heroImageUrl:
      "https://images.unsplash.com/photo-1476725376606-78bd56004997?auto=format&fit=crop&w=1200&q=80",
  },
];

const qaChecklistItems = [
  { id: "qa1", label: "Design is professional, consistent, and intentional" },
  { id: "qa2", label: "All components work without breaking or extra setup" },
  { id: "qa3", label: "Class names use readable, consistent prefixes" },
  { id: "qa4", label: "Demo site matches the library exactly" },
  { id: "qa5", label: "Responsive on desktop, tablet, and mobile" },
  { id: "qa6", label: "No custom code dependencies that break portability" },
  { id: "qa7", label: "No hard-coded content users must remove" },
  { id: "qa8", label: "Components are reusable across projects" },
  { id: "qa9", label: "All assets are owned or properly licensed" },
  { id: "qa10", label: "Clone-tested in a clean Webflow project" },
] as const;

type QaKey = (typeof qaChecklistItems)[number]["id"];
type DragPayload =
  | { source: "library"; componentId: string }
  | { source: "canvas"; componentId: string; index: number };

const maturityInfo: Record<MaturityLevel, string> = {
  "1-2":
    "Focus: get the basics right with llms.txt, FAQPage schema, and question-led content structure.",
  "2-3":
    "Focus: expand schema by page type, tighten semantics, and build content clusters with internal links.",
  "3-4":
    "Focus: add research-backed data modules, measurement loops, and comprehensive schema coverage for every page.",
};

const maturityInstructions: Record<MaturityLevel, string> = {
  "1-2":
    '"Prioritize llms.txt, FAQPage schema, and question-driven content. Keep schema to Organization + FAQPage first."',
  "2-3":
    '"Expand schema across page types. Ensure semantic structure is airtight. Build clear content clusters and internal links."',
  "3-4":
    '"Include original research data blocks, programmatic content pathways, and systematic measurement. Cover every page type in schema."',
};

type BuilderFormState = {
  projectType: ProjectType;
  useCase: string;
  targetAudience: string;
  primaryGoal: string;
  brandVoice: string;
  visualStyle: string;
  domain: string;
  maxPages: number;
  maxComponents: number;
  isMarketplace: MarketplaceMode;
  licenseType: LicenseType;
  libraryPurpose: string;
  targetUseCase: string;
  maturityLevel: MaturityLevel;
  brandName: string;
  contactEmail: string;
  socialProfiles: string;
  industryTerms: string;
  authorityReferences: string;
  qaChecks: Record<QaKey, boolean>;
};

const defaultQaChecks = qaChecklistItems.reduce((acc, item) => {
  acc[item.id] = true;
  return acc;
}, {} as Record<QaKey, boolean>);

const initialFormState: BuilderFormState = {
  projectType: "Component Library",
  useCase:
    "Build a marketplace-ready Webflow toolkit aligned to OCIU's community empowerment mission and visual identity.",
  targetAudience:
    "Community organizations, NGOs, local initiatives, and Webflow creators building impact-focused websites.",
  primaryGoal:
    "Generate a clone-ready page system that communicates trust quickly and drives volunteer signups, donations, and service engagement.",
  brandVoice: "Warm, empowering, community-centered, and practical",
  visualStyle:
    "OCIU violet and gold palette, clean cards, strong readability, welcoming hero storytelling, and clear CTA hierarchy",
  domain: "https://cptcommunityadults.fun",
  maxPages: 9,
  maxComponents: 12,
  isMarketplace: "yes",
  licenseType: "COMMERCIAL",
  libraryPurpose:
    "Reusable community-focused sections for services, jobs, study support, podcasts, and donation pathways.",
  targetUseCase:
    "Teams launching non-profit and social impact sites with Webflow-native sections and CMS-ready structure.",
  maturityLevel: "2-3",
  brandName: "Our Community In Unity",
  contactEmail: "info@cptcommunityadults.fun",
  socialProfiles:
    "https://www.instagram.com/ourcommunityinunity\nhttps://www.facebook.com/ourcommunityinunity",
  industryTerms:
    "community empowerment, non-profit services, youth development, local job access, social impact programs",
  authorityReferences:
    "Western Cape Government community resources, W3C WCAG 2.2, South African NGO guidelines, Google Search Central documentation",
  qaChecks: defaultQaChecks,
};

function buildMasterPrompt(formData: BuilderFormState, canvasComponentIds: string[]): string {
  const projectUseCase =
    formData.useCase.trim() ||
    "Build a marketplace-ready Webflow component library for service-led businesses.";
  const targetAudience =
    formData.targetAudience.trim() ||
    "Webflow designers, agencies, and freelancers shipping client sites quickly.";
  const primaryGoal =
    formData.primaryGoal.trim() ||
    "Deliver a reusable conversion-focused page system with clear CTA pathways.";
  const brandVoice = formData.brandVoice.trim() || "Confident, clear, and strategic";
  const visualStyle = formData.visualStyle.trim() || "Editorial, clean, and conversion-led";
  const industryTerms =
    formData.industryTerms.trim() ||
    "Webflow component libraries, conversion UX, responsive section systems, CMS content architecture";
  const authorityReferences =
    formData.authorityReferences.trim() ||
    "Webflow University, WCAG 2.2, Nielsen Norman Group, Google Search Central";
  const licenseType = formData.licenseType || "COMMERCIAL";
  const libraryPurpose =
    formData.libraryPurpose.trim() ||
    "Reusable conversion-oriented sections for portfolios, service pages, and lead-generation sites.";
  const targetUseCase =
    formData.targetUseCase.trim() ||
    "Freelancers and agencies launching polished marketing sites with minimal rework.";

  const requestedDomain = formData.domain.trim();
  const normalizedDomain =
    requestedDomain.length > 0
      ? /^https?:\/\//i.test(requestedDomain)
        ? requestedDomain
        : `https://${requestedDomain}`
      : "https://cptcommunityadults.fun";

  let domain = normalizedDomain;
  let domainHost = "cptcommunityadults.fun";
  try {
    const parsed = new URL(normalizedDomain);
    domain = parsed.origin;
    domainHost = parsed.hostname.replace(/^www\./, "");
  } catch {
    // Keep normalized fallback values if URL parsing fails.
  }

  const brandName = formData.brandName.trim() || "Our Community In Unity";
  const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const socialFallback = [
    `https://www.linkedin.com/company/${brandSlug || domainHost.replace(/\./g, "")}`,
    `https://x.com/${brandSlug || domainHost.replace(/\./g, "")}`,
    `https://www.instagram.com/${brandSlug || domainHost.replace(/\./g, "")}`,
  ];
  const contactEmail = formData.contactEmail.trim() || `hello@${domainHost}`;

  const socialProfilesArray = (formData.socialProfiles.trim() ? formData.socialProfiles.split(/\r?\n/) : socialFallback)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => `  "${url}"`)
    .join(",\n");

  const llmsSummary = `${brandName} creates reusable Webflow libraries and structured page systems for service-led brands. The library focuses on fast implementation, strong conversion hierarchy, and Marketplace-grade portability.`;

  const selectedComponents =
    canvasComponentIds.length > 0
      ? canvasComponentIds
          .map((id, index) => `${index + 1}. ${componentCardMap[id]?.name ?? id}`)
          .join("\n")
      : "1. Hero Section\n2. Feature Grid\n3. Call To Action";

  const marketplaceBlock =
    formData.isMarketplace === "yes"
      ? `
This library is being prepared for Webflow Marketplace submission. Manual review will evaluate:

**Library Purpose & Scope:**
${libraryPurpose}

**Target Use Case:**
${targetUseCase}

**Quality Standards (Non-Negotiable):**

1. **Design Quality**
   - Visually polished with consistent design language
   - Intentional spacing, typography, and color usage
   - Accessible contrast ratios (WCAG AA minimum)
   - Readable font sizes across all breakpoints
   - Modern, clean, professional aesthetic
   - Even minimal libraries must feel intentional, not unfinished

2. **Functionality**
   - Every component works as described without errors
   - No broken layouts on clone
   - Responsive across desktop (1920px), tablet (768px), mobile (375px)
   - Forms function correctly (if included)
   - CMS collections properly configured with clear documentation
   - Interactions work smoothly without glitches

3. **Clarity & Usability**
   - Components are self-explanatory in Designer panel
   - Class naming is readable and predictable (lib-, ui-, section- prefixes)
   - No cryptic or auto-generated class names
   - Logical structure that matches user mental models
   - Minimal overrides needed by end users
   - Clear empty states for CMS-driven components

4. **Reusability & Portability**
   - Each component works independently without hidden dependencies
   - Can be cloned into a fresh Webflow project with zero extra setup
   - No hard-coded content users must manually delete
   - Works across different project types and contexts
   - Variables and utility classes used consistently

5. **Supported Elements Only**
   Stick to native, reusable Webflow elements:
   - Sections, containers, divs, grid, flexbox
   - Headings (H1-H6), text blocks, rich text
   - Buttons, links, images, forms, CMS collections
   - Native Webflow interactions, utilities, and variables

6. **Unsupported Elements (Avoid)**
   - Custom code dependencies that break on clone
   - Embedded scripts or external API calls
   - Experimental or beta Webflow features
   - Third-party integrations without clear documentation
   - Overly complex interactions without explanation

**Demo Site Requirements:**

The demo site is your showroom. It must:
- Display every layout and component clearly
- Use real-world example content (not lorem everywhere)
- Demonstrate responsive behavior at key breakpoints
- Match the library exactly (what you see = what you clone)
- Show components in realistic usage contexts
- Be publicly accessible for review

**Naming Conventions (Clarity > Cleverness):**

- Use consistent prefixes throughout:
  - lib-* for library-specific components
  - ui-* for interface elements
  - section-* for page sections
  - util-* for utility classes

**Licensing & Legal:**

- License type: ${licenseType}
- You must own or have proper rights to all assets (icons, fonts, images)
- State usage rights clearly in the library description
- Comply with the Webflow Creator Agreement

**Pre-Submission Checklist:**

Before final output, verify:

[ ] Library has focused purpose (not bloated)
[ ] Solves a clear, repeatable user problem
[ ] Design is professional and consistent
[ ] Components function correctly without setup
[ ] Naming is readable with consistent prefixes
[ ] Demo site matches library exactly
[ ] Responsive across desktop, tablet, mobile
[ ] No custom code dependencies
[ ] No hard-coded content to delete
[ ] All assets owned or properly licensed
[ ] Clone-tested in fresh project
[ ] Documentation/README included
[ ] CMS empty states handled
[ ] Accessibility checks pass

**Review Process:**

- Submissions are manually reviewed by the Webflow Marketplace team
- "Satisfactory" submissions may receive feedback
- Libraries must reach "Good" quality within 2 feedback rounds
- If standards are not met after 2 rounds, submission may be rejected
- Be prepared to iterate on feedback
`
      : "- Components should be reusable, but Marketplace standards do not apply";

  const marketplaceStandards =
    formData.isMarketplace === "yes"
      ? `
## SECTION 8 - WEBFLOW MARKETPLACE STANDARDS

Every component must meet these standards:

**Design Quality**
- Consistent visual system
- Intentional spacing, typography, and colors
- Accessible contrast and readable type
- Modern, clean, professional feel

**Reusability**
- Components work independently, no hidden dependencies
- Minimal overrides required by end users
- Logical empty states for CMS-driven components
- Clone-ready with zero setup

**Naming & Structure**
- Class names use lib-, ui-, or section- prefixes
- No cryptic or auto-generated naming
- Components are easy to identify in Designer

**Licensing**
- License type: ${licenseType}
- All assets owned or properly licensed

**Demo Site Requirements**
- Every component shown in context with real content
- Responsiveness shown across desktop, tablet, and mobile
- Demo matches library exactly
`
      : "";

  const marketplaceQualityGate =
    formData.isMarketplace === "yes"
      ? `
[ ] Library has focused purpose and clear scope
[ ] All marketplace checklist items validated
[ ] Design is professional, consistent, and intentional
[ ] Components work without extra setup
[ ] Class naming uses consistent prefixes
[ ] Demo matches library exactly
[ ] Responsive on all breakpoints
[ ] No custom code dependencies
[ ] No hard-coded content to remove
[ ] All assets are owned or properly licensed
[ ] Clone-tested in fresh Webflow project
[ ] Components are independently reusable
[ ] README/documentation included
[ ] Empty states are handled logically
[ ] Accessibility standards are met
`
      : "";

  return `# Master Prompt: AI Webflow Site & Library Builder
AEO-Optimized + Marketplace-Ready

## SECTION 1 - PROJECT DEFINITION

Project Type: ${formData.projectType}
Use Case: ${projectUseCase}
Target Audience: ${targetAudience}
Primary Goal: ${primaryGoal}
Brand Voice: ${brandVoice}
Visual Style: ${visualStyle}
Domain: ${domain}

## SECTION 2 - OUTPUT SPECIFICATION

The AI must produce all deliverables below.

**Deliverable 1: Webflow Designer Structure**
Output Webflow-native sections, divs, classes, and CMS fields only. Do not output raw HTML/CSS.

**Deliverable 2: Component & Class Naming Map**
List every class, component, and CMS field with purpose, prefix, and usage.

**Selected Library Components (Drag-and-Drop Preview Order)**
${selectedComponents}

**Deliverable 3: llms.txt File Content**
Draft a complete llms.txt aligned to this site's structure.

**Deliverable 4: Schema Markup (JSON-LD)**
Generate schema for each page type as ready-to-paste script blocks.

**Deliverable 5: Demo Site Layout Plan**
Page-by-page section map with production-ready example content and responsive notes.

**Deliverable 6: FAQ Content + Schema**
Provide 8-12 real user questions with answers and matching FAQPage schema.

## SECTION 3 - SCOPE CONSTRAINTS

These are hard limits.

- Maximum pages: ${formData.maxPages}
- Maximum components/sections: ${formData.maxComponents}
- No custom code dependencies that break portability
- No hard-coded content users must delete
- No unstable/experimental Webflow features
- No filler sections

${marketplaceBlock}

## SECTION 4 - AEO CONTENT STRATEGY (Pillar 1: Content)

The AI must structure content for answer engines.

**Rule 1: Answer First**
Each page answers clearly in the first 2-3 sentences.

**Rule 2: Question-Driven Structure**
Headings should mirror real user questions.

**Rule 3: Quotable Statements**
Include standalone statements that can be cited directly.

**Rule 4: Content Clusters**
Use one cornerstone page with 2-4 supporting pages and bidirectional internal linking.

**Rule 5: Freshness Signals**
Add visible updated dates and version cues where relevant.

**Rule 6: No JavaScript-Only Critical Content**
Key answer-first content must exist in initial HTML.

**Rule 7: Entity & Co-occurrence Clarity**
- Use consistent industry terminology: ${industryTerms}
- Reference third-party authority sources: ${authorityReferences}

## SECTION 5 - TECHNICAL FOUNDATIONS (Pillar 2: Technical)

### 5A: Semantic Structure Requirements
- Single H1 per page
- H2/H3 hierarchy with no skipped levels
- Descriptive alt text for all images
- Clear action labels on links and buttons
- No empty scaffolding containers in final output

### 5B: llms.txt Structure Template

Generate using this format:

\`\`\`
# ${brandName}

> ${llmsSummary}

## Key Pages
- Homepage (${domain}): Conversion-focused overview and primary CTA entry point.
- About (${domain}/about): Team credibility, approach, and trust-building proof.
- Products/Services (${domain}/products): Detailed offerings, pricing context, and conversion CTAs.

## FAQ
- FAQ (${domain}/faq): Answer-first responses to high-intent buyer questions.

## Blog / Insights
- Blog Index (${domain}/blog): Topic clusters, authority content, and evergreen guides.

## Contact
- Email: ${contactEmail}
- Support: ${domain}/contact

## Attribution
Please attribute sourced content to ${brandName} and link back to the original URL.
\`\`\`

Also generate llms-full.txt if the site has fewer than 10 pages.

### 5C: Schema Markup Requirements

Generate schema for each page type:

| Page Type | Schema Required |
|-----------|------------------|
| Homepage / About | Organization + WebSite |
| Team / Author Pages | Person |
| FAQ Page | FAQPage |
| Blog / Article Pages | Article or BlogPosting |
| Product Pages | Product |
| How-To Pages | HowTo |
| Reviews / Testimonials | Review |

**sameAs requirement:**

\`\`\`json
"sameAs": [
${socialProfilesArray}
]
\`\`\`

**Nesting requirement:**
- Article/BlogPosting -> Person in author
- Person -> Organization in worksFor

### 5D: Webflow Technical Checklist
- Clean sitemap and URL hierarchy
- Mobile-first responsiveness
- Basic performance and image optimization guidance
- No broken internal links

## SECTION 6 - AUTHORITY SIGNALS (Pillar 3: Authority)

Build these into the structure:
- About/Story page with verifiable claims
- As Seen In or Trusted By section with verified publication slots
- Insights/blog area with topic clusters
- Reviews/testimonials area with schema-ready fields
- Clear author attribution on content pages

## SECTION 7 - MEASUREMENT INFRASTRUCTURE (Pillar 4: Measurement)

Build into site structure:
- UTM-friendly URLs
- Distinct landing paths for AI-referred traffic
- A page documenting how AI systems should interpret the brand

Recommend monthly tracking:
- Query brand + core topic in major AI answer engines
- Check if brand appears and summary is accurate
- Track referral traffic from AI platforms
- Log trends over 30-90 days

${marketplaceStandards}

## SECTION 9 - QUALITY GATE

Before final output, verify:

[ ] Every page has a clear H1
[ ] llms.txt matches real site structure
[ ] llms-full.txt included if under 10 pages
[ ] Schema generated for all page types
[ ] Organization and Person include sameAs
[ ] Author/worksFor nesting implemented
[ ] FAQ has 8-12 real questions with schema
[ ] Content uses inverted pyramid structure
[ ] No critical JS-only content
[ ] Terminology and authority sources are consistent
[ ] Class names use consistent prefixes
[ ] No custom code dependencies or hard-coded content
[ ] Demo uses real content and responsive notes
[ ] Internal links between clusters are mapped
[ ] Scope remains within ${formData.maxPages} pages and ${formData.maxComponents} components
${marketplaceQualityGate}

## SECTION 10 - MATURITY CALIBRATION

Maturity Level: ${formData.maturityLevel}

Add this instruction: ${maturityInstructions[formData.maturityLevel]}

---

Built for: ${formData.projectType}
Target Audience: ${targetAudience}
Primary Goal: ${primaryGoal}

This prompt is ready. Paste into your AI website builder to generate a production-ready, AEO-optimized Webflow site structure.`;
}

export function WebflowAiBuilderPage() {
  const [form, setForm] = useState<BuilderFormState>(initialFormState);
  const [canvasComponentIds, setCanvasComponentIds] = useState<string[]>(defaultCanvasComponentIds);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    defaultCanvasComponentIds[0] ?? null,
  );
  const [selectedSiteTemplateId, setSelectedSiteTemplateId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<PreviewContent>(emptyPreviewContent);
  const [heroImageSource, setHeroImageSource] = useState("");
  const [imageLinkInput, setImageLinkInput] = useState("");
  const [assetMessage, setAssetMessage] = useState<string | null>(null);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [templateFilter, setTemplateFilter] = useState<TemplateFilter>("all");
  const [studioPanel, setStudioPanel] = useState<StudioPanel>("canvas");
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>("Design");
  const [selectedPreviewPage, setSelectedPreviewPage] = useState<(typeof previewPageOptions)[number]>(
    "Home",
  );
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>("Style");
  const [siteVariablesOpen, setSiteVariablesOpen] = useState(true);
  const [designSystemOpen, setDesignSystemOpen] = useState(true);
  const [variableCollections, setVariableCollections] = useState<SiteVariableCollection[]>(
    defaultVariableCollections,
  );
  const [activeCollectionId, setActiveCollectionId] = useState(defaultVariableCollections[0].id);
  const [activeVariableSection, setActiveVariableSection] = useState<VariableSection>("colors");
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string>(brandKits[0]?.id ?? "ociu");
  const [collectionTokens, setCollectionTokens] = useState<Record<string, DesignTokens>>(() => ({
    [defaultVariableCollections[0].id]: createDefaultDesignTokens(),
  }));
  const [draggingComponentId, setDraggingComponentId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [accountEmail, setAccountEmail] = useState(getInitialSessionEmail);
  const [accountPassword, setAccountPassword] = useState("");
  const [currentAccountEmail, setCurrentAccountEmail] = useState<string | null>(() => {
    const sessionEmail = getInitialSessionEmail();
    return sessionEmail || null;
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);

  const readStoredAccounts = (): AccountRecord[] => {
    try {
      const raw = localStorage.getItem(accountStoreKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (entry): entry is AccountRecord =>
          typeof entry === "object" &&
          entry !== null &&
          typeof entry.email === "string" &&
          typeof entry.password === "string" &&
          typeof entry.createdAt === "string",
      );
    } catch {
      return [];
    }
  };

  const writeStoredAccounts = (accounts: AccountRecord[]) => {
    localStorage.setItem(accountStoreKey, JSON.stringify(accounts));
  };

  const qaCheckedCount = useMemo(
    () => Object.values(form.qaChecks).filter(Boolean).length,
    [form.qaChecks],
  );
  const effectiveCollectionId = useMemo(() => {
    if (variableCollections.some((collection) => collection.id === activeCollectionId)) {
      return activeCollectionId;
    }
    return variableCollections[0]?.id ?? defaultVariableCollections[0].id;
  }, [activeCollectionId, variableCollections]);
  const activeVariableCollection = useMemo(
    () => variableCollections.find((collection) => collection.id === effectiveCollectionId) ?? null,
    [effectiveCollectionId, variableCollections],
  );
  const activeDesignTokens =
    collectionTokens[effectiveCollectionId] ??
    collectionTokens[defaultVariableCollections[0].id] ??
    createDefaultDesignTokens();
  const selectedBrandKit = useMemo(
    () => brandKits.find((kit) => kit.id === selectedBrandKitId) ?? brandKits[0] ?? null,
    [selectedBrandKitId],
  );
  const selectedSiteTemplate = useMemo(
    () =>
      selectedSiteTemplateId
        ? prebuiltSiteTemplates.find((template) => template.id === selectedSiteTemplateId) ?? null
        : null,
    [selectedSiteTemplateId],
  );
  const filteredSiteTemplates = useMemo(
    () =>
      templateFilter === "all"
        ? prebuiltSiteTemplates
        : prebuiltSiteTemplates.filter((template) => template.page === templateFilter),
    [templateFilter],
  );
  const selectedComponent = selectedComponentId ? componentCardMap[selectedComponentId] : null;
  const activePreview = previewWidths[viewportMode];
  const previewButtonTransition = `all ${activeDesignTokens.interactions.transitionMs}ms ease`;
  const isCanvasBlank = canvasComponentIds.length === 0;
  const previewCopy: PreviewContent = {
    eyebrow: previewContent.eyebrow || "Each one teach one",
    heading: previewContent.heading || "Build an OCIU-aligned community website",
    body:
      previewContent.body ||
      "Start from a complete site template or build from blank canvas. Apply OCIU brand kits, adjust fonts, and add real visuals before generating output.",
    primaryCta: previewContent.primaryCta || "Explore Programs",
    secondaryCta: previewContent.secondaryCta || "Support OCIU",
  };

  const updateField = <K extends keyof BuilderFormState>(field: K, value: BuilderFormState[K]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleQaItem = (id: QaKey, checked: boolean) => {
    setForm((current) => ({
      ...current,
      qaChecks: {
        ...current.qaChecks,
        [id]: checked,
      },
    }));
  };

  const updateActiveTokens = <K extends keyof DesignTokens>(
    section: K,
    patch: Partial<DesignTokens[K]>,
  ) => {
    setCollectionTokens((current) => {
      const existing = current[effectiveCollectionId] ?? createDefaultDesignTokens();
      return {
        ...current,
        [effectiveCollectionId]: {
          ...existing,
          [section]: {
            ...existing[section],
            ...patch,
          },
        },
      };
    });
  };

  const applyBrandKitToActiveCollection = (brandKitId: string) => {
    const kit = brandKits.find((item) => item.id === brandKitId);
    if (!kit) return;
    setCollectionTokens((current) => {
      const baseTokens = current[effectiveCollectionId] ?? createDefaultDesignTokens();
      return {
        ...current,
        [effectiveCollectionId]: mergeDesignTokens(baseTokens, kit.patch),
      };
    });
    setSelectedBrandKitId(brandKitId);
  };

  const handleLoadSiteTemplate = (templateId: string) => {
    const template = prebuiltSiteTemplates.find((item) => item.id === templateId);
    if (!template) return;

    setSelectedSiteTemplateId(template.id);
    setCanvasComponentIds(template.components);
    setSelectedComponentId(template.components[0] ?? null);
    setSelectedPreviewPage(template.page);
    setPreviewContent(template.preview);
    setHeroImageSource(template.heroImageUrl ?? "");
    setImageLinkInput(template.heroImageUrl ?? "");
    setAssetError(null);
    setAssetMessage(`${template.name} loaded.`);
    applyBrandKitToActiveCollection(template.brandKitId);
    setStudioPanel("canvas");
  };

  const handleAssetUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAssetError("Please upload an image file.");
      setAssetMessage(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setHeroImageSource(result);
      setImageLinkInput("");
      setAssetError(null);
      setAssetMessage(`${file.name} uploaded.`);
    };
    reader.onerror = () => {
      setAssetError("Image upload failed. Please try another file.");
      setAssetMessage(null);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleApplyImageLink = () => {
    const nextValue = imageLinkInput.trim();
    if (!nextValue) {
      setAssetError("Paste a valid image URL first.");
      setAssetMessage(null);
      return;
    }

    try {
      const parsedUrl = new URL(nextValue);
      if (!/^https?:$/.test(parsedUrl.protocol)) {
        setAssetError("Only HTTP/HTTPS image links are supported.");
        setAssetMessage(null);
        return;
      }
      setHeroImageSource(parsedUrl.toString());
      setAssetError(null);
      setAssetMessage("Image link applied.");
    } catch {
      setAssetError("Invalid image URL.");
      setAssetMessage(null);
    }
  };

  const clearHeroImage = () => {
    setHeroImageSource("");
    setImageLinkInput("");
    setAssetError(null);
    setAssetMessage("Hero image cleared.");
  };

  const handleAddVariableCollection = () => {
    const nextId = `collection-${Date.now().toString(36)}`;
    const newCollectionName = `Collection ${variableCollections.length + 1}`;

    setVariableCollections((current) => [
      ...current,
      {
        id: nextId,
        name: newCollectionName,
      },
    ]);
    setCollectionTokens((current) => ({
      ...current,
      [nextId]: cloneDesignTokens(activeDesignTokens),
    }));
    setActiveCollectionId(nextId);
    setSiteVariablesOpen(true);
    setDesignSystemOpen(true);
  };

  const handleRenameCollection = (collectionId: string, nextName: string) => {
    setVariableCollections((current) =>
      current.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              name: nextName,
            }
          : collection,
      ),
    );
  };

  const parseDragPayload = (event: DragEvent<HTMLElement>): DragPayload | null => {
    const rawData =
      event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain");
    if (!rawData) return null;

    try {
      const payload = JSON.parse(rawData) as DragPayload;
      if (payload.source === "library" && typeof payload.componentId === "string") {
        return payload;
      }
      if (
        payload.source === "canvas" &&
        typeof payload.componentId === "string" &&
        typeof payload.index === "number"
      ) {
        return payload;
      }
      return null;
    } catch {
      return null;
    }
  };

  const applyCanvasDrop = (payload: DragPayload, targetIndex: number) => {
    let reachedMax = false;

    setCanvasComponentIds((current) => {
      if (payload.source === "canvas") {
        const fromIndex = payload.index;
        if (fromIndex < 0 || fromIndex >= current.length) {
          return current;
        }
        const boundedTarget = Math.max(0, Math.min(targetIndex, current.length));
        const adjustedTarget = fromIndex < boundedTarget ? boundedTarget - 1 : boundedTarget;
        if (fromIndex === adjustedTarget) {
          return current;
        }

        const next = [...current];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(adjustedTarget, 0, moved);
        return next;
      }

      const componentId = payload.componentId;
      const existingIndex = current.indexOf(componentId);
      const boundedTarget = Math.max(0, Math.min(targetIndex, current.length));

      if (existingIndex !== -1) {
        const adjustedTarget = existingIndex < boundedTarget ? boundedTarget - 1 : boundedTarget;
        if (existingIndex === adjustedTarget) {
          return current;
        }

        const next = [...current];
        const [moved] = next.splice(existingIndex, 1);
        next.splice(adjustedTarget, 0, moved);
        return next;
      }

      if (current.length >= form.maxComponents) {
        reachedMax = true;
        return current;
      }

      const next = [...current];
      next.splice(boundedTarget, 0, componentId);
      return next;
    });

    if (reachedMax) {
      const maxError = `Preview canvas is full (max ${form.maxComponents} components). Increase the limit or remove one item.`;
      setErrors((current) => [
        ...current.filter((error) => error !== maxError),
        maxError,
      ]);
      return;
    }
    setSelectedComponentId(payload.componentId);
  };

  const handleLibraryDragStart = (event: DragEvent<HTMLDivElement>, componentId: string) => {
    const payload: DragPayload = { source: "library", componentId };
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "copyMove";
    setDraggingComponentId(componentId);
  };

  const handleCanvasDragStart = (
    event: DragEvent<HTMLDivElement>,
    componentId: string,
    index: number,
  ) => {
    const payload: DragPayload = { source: "canvas", componentId, index };
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
    setDraggingComponentId(componentId);
  };

  const handleCanvasDragOver = (event: DragEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropIndex(index);
  };

  const handleCanvasDrop = (event: DragEvent<HTMLElement>, index: number) => {
    event.preventDefault();
    const payload = parseDragPayload(event);
    if (!payload) return;
    if (payload.source === "library") {
      setSelectedSiteTemplateId(null);
    }
    applyCanvasDrop(payload, index);
    setDropIndex(null);
    setDraggingComponentId(null);
  };

  const handleAddToCanvas = (componentId: string) => {
    applyCanvasDrop({ source: "library", componentId }, canvasComponentIds.length);
    setSelectedSiteTemplateId(null);
    setStudioPanel("canvas");
  };

  const handleRemoveFromCanvas = (index: number) => {
    setCanvasComponentIds((current) => {
      const removedId = current[index];
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      if (removedId && removedId === selectedComponentId) {
        setSelectedComponentId(next[0] ?? null);
      }
      if (next.length === 0) {
        setSelectedSiteTemplateId(null);
      }
      return next;
    });
  };

  const clearCanvas = () => {
    setCanvasComponentIds([]);
    setSelectedComponentId(null);
    setSelectedSiteTemplateId(null);
    setPreviewContent(emptyPreviewContent);
    setHeroImageSource("");
    setImageLinkInput("");
    setAssetError(null);
    setAssetMessage("Canvas cleared.");
    setDropIndex(null);
    setDraggingComponentId(null);
  };

  const cyclePreviewPage = () => {
    setSelectedPreviewPage((current) => {
      const currentIndex = previewPageOptions.indexOf(current);
      const nextIndex = (currentIndex + 1) % previewPageOptions.length;
      return previewPageOptions[nextIndex];
    });
  };

  const validateForm = () => {
    const nextErrors: string[] = [];

    if (!form.useCase.trim()) nextErrors.push("Use Case is required.");
    if (!form.targetAudience.trim()) nextErrors.push("Target Audience is required.");
    if (!form.primaryGoal.trim()) nextErrors.push("Primary Goal is required.");
    if (!form.brandVoice.trim()) nextErrors.push("Brand Voice is required.");
    if (!form.visualStyle.trim()) nextErrors.push("Visual Style is required.");

    if (!Number.isFinite(form.maxPages) || form.maxPages < 1 || form.maxPages > 50) {
      nextErrors.push("Maximum Pages must be between 1 and 50.");
    }
    if (!Number.isFinite(form.maxComponents) || form.maxComponents < 1 || form.maxComponents > 30) {
      nextErrors.push("Maximum Components must be between 1 and 30.");
    }
    if (canvasComponentIds.length === 0) {
      nextErrors.push("Add at least one component to the drag-and-drop preview canvas.");
    }

    if (form.isMarketplace === "yes") {
      if (!form.licenseType) nextErrors.push("License Type is required for Marketplace mode.");
      if (!form.libraryPurpose.trim()) {
        nextErrors.push("Library Purpose is required for Marketplace mode.");
      }
      if (!form.targetUseCase.trim()) {
        nextErrors.push("Target Use Case is required for Marketplace mode.");
      }
      if (qaCheckedCount !== qaChecklistItems.length) {
        nextErrors.push("Check all Marketplace QA items before generating the prompt.");
      }
    }

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      setPrompt("");
      return;
    }

    setPrompt(buildMasterPrompt(form, canvasComponentIds));
    setCopied(false);

    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleCopyPrompt = async () => {
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrors((current) => [
        ...current,
        "Clipboard copy failed. Please copy manually from the output panel.",
      ]);
    }
  };

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setAuthInfo(null);

    const email = normalizeEmail(accountEmail);
    const password = accountPassword;

    if (!email.includes("@")) {
      setAuthError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    const accounts = readStoredAccounts();
    const existing = accounts.find((account) => normalizeEmail(account.email) === email);

    if (authMode === "signup") {
      if (existing) {
        setAuthError("An account with this email already exists. Try signing in.");
        return;
      }
      const nextAccounts = [
        ...accounts,
        {
          email,
          password,
          createdAt: new Date().toISOString(),
        },
      ];
      writeStoredAccounts(nextAccounts);
      localStorage.setItem(accountSessionKey, email);
      setCurrentAccountEmail(email);
      setAccountPassword("");
      setAuthInfo("Account created. Downloads are now unlocked.");
      return;
    }

    if (!existing || existing.password !== password) {
      setAuthError("Invalid email or password.");
      return;
    }

    localStorage.setItem(accountSessionKey, email);
    setCurrentAccountEmail(email);
    setAccountPassword("");
    setAuthInfo("Signed in successfully.");
  };

  const handleLogout = () => {
    localStorage.removeItem(accountSessionKey);
    setCurrentAccountEmail(null);
    setAccountPassword("");
    setAuthInfo("Signed out.");
    setAuthError(null);
  };

  const handleDownloadSitePackage = () => {
    if (!prompt) return;
    if (!currentAccountEmail) {
      setAuthError("Sign in to download the site package.");
      setAuthInfo(null);
      return;
    }

    const packagePayload = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: currentAccountEmail,
        projectType: form.projectType,
        projectTitle: form.brandName || form.projectType,
      },
      builderState: {
        form,
        selectedTemplateId: selectedSiteTemplate?.id ?? null,
        selectedTemplateName: selectedSiteTemplate?.name ?? null,
        selectedBrandKit: selectedBrandKit?.name ?? null,
        previewContent,
        heroImageSource,
        canvasOrder: canvasComponentIds.map((componentId, index) => ({
          order: index + 1,
          id: componentId,
          name: componentCardMap[componentId]?.name ?? componentId,
        })),
      },
      output: {
        masterPrompt: prompt,
      },
    };

    const fileSafeTitle = (form.brandName || form.projectType)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const fileName = `${fileSafeTitle || "webflow-site"}-package.json`;
    const blob = new Blob([JSON.stringify(packagePayload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setAuthError(null);
    setAuthInfo("Site package downloaded.");
  };

  const handleReset = () => {
    setForm(initialFormState);
    setCanvasComponentIds(defaultCanvasComponentIds);
    setSelectedComponentId(defaultCanvasComponentIds[0] ?? null);
    setStudioPanel("canvas");
    setActiveStudioTab("Design");
    setSelectedPreviewPage("Home");
    setViewportMode("desktop");
    setInspectorMode("Style");
    setSiteVariablesOpen(true);
    setDesignSystemOpen(true);
    setVariableCollections(defaultVariableCollections);
    setActiveCollectionId(defaultVariableCollections[0].id);
    setActiveVariableSection("colors");
    setSelectedBrandKitId(brandKits[0]?.id ?? "ociu");
    setCollectionTokens({
      [defaultVariableCollections[0].id]: createDefaultDesignTokens(),
    });
    setSelectedSiteTemplateId(null);
    setPreviewContent(emptyPreviewContent);
    setHeroImageSource("");
    setImageLinkInput("");
    setAssetMessage(null);
    setAssetError(null);
    setTemplateFilter("all");
    setDropIndex(null);
    setDraggingComponentId(null);
    setErrors([]);
    setPrompt("");
    setCopied(false);
    setAuthError(null);
    setAuthInfo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-primary py-16 md:py-20">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-secondary via-transparent to-transparent" />
        </div>
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <Sparkles className="size-3.5" />
              Webflow Marketplace Toolkit
            </Badge>
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl">
              Webflow AI Builder
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/85">
              Build a complete, reusable Webflow prompt with AEO structure, Marketplace constraints,
              and implementation-ready output.
            </p>
          </div>
        </div>
      </section>

      <div className="w-full py-0">
        <div className="w-full">
          <Card className="min-h-[calc(100vh-96px)] overflow-hidden rounded-none border-x-0 border-border bg-card text-card-foreground shadow-xl">
              <div className="border-b border-border bg-primary/95 px-3 py-2 text-primary-foreground">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <Badge className="h-6 rounded bg-secondary px-2 text-secondary-foreground">W</Badge>
                    {studioTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveStudioTab(tab)}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-[11px] transition-colors sm:text-xs",
                          activeStudioTab === tab
                            ? "border-secondary bg-secondary text-secondary-foreground"
                            : "border-primary-foreground/30 text-primary-foreground/85 hover:bg-primary-foreground/15",
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={cyclePreviewPage}
                      className="hidden items-center gap-1 rounded-md border border-primary-foreground/35 bg-primary-foreground/10 px-2 py-1 text-primary-foreground sm:inline-flex"
                    >
                      <Home className="size-3.5" />
                      {selectedPreviewPage}
                      <ChevronDown className="size-3.5 text-primary-foreground/70" />
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-primary-foreground/35 bg-primary-foreground/10 px-2 py-1 text-primary-foreground"
                    >
                      Share
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-secondary bg-secondary px-2 py-1 text-secondary-foreground"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-b border-border bg-muted/60 p-2 xl:hidden">
                <div className="grid grid-cols-3 overflow-hidden rounded-md border border-border">
                  <button
                    type="button"
                    onClick={() => setStudioPanel("library")}
                    className={cn(
                      "px-2 py-1.5 text-xs",
                      studioPanel === "library" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    Library
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioPanel("canvas")}
                    className={cn(
                      "border-x border-border px-2 py-1.5 text-xs",
                      studioPanel === "canvas" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioPanel("inspector")}
                    className={cn(
                      "px-2 py-1.5 text-xs",
                      studioPanel === "inspector" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    Inspector
                  </button>
                </div>
              </div>

              <div className="grid xl:min-h-[790px] xl:grid-cols-[52px_228px_minmax(0,1fr)_286px]">
                <aside className="hidden border-r border-border bg-sidebar p-2 text-sidebar-foreground xl:flex xl:flex-col xl:items-center xl:justify-between">
                  <div className="space-y-2">
                    {[Home, Library, Globe, Sparkles, Wand2].map((Icon, index) => (
                      <button
                        key={index}
                        type="button"
                        className={cn(
                          "flex size-8 items-center justify-center rounded border transition-colors",
                          index === 1
                            ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                            : "border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent",
                        )}
                      >
                        <Icon className="size-4" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="flex size-8 items-center justify-center rounded border border-sidebar-border text-sidebar-foreground/70 hover:bg-sidebar-accent"
                  >
                    <Plus className="size-4" />
                  </button>
                </aside>

                <aside
                  className={cn(
                    "order-2 border-t border-border bg-sidebar/95 p-3 text-sidebar-foreground sm:p-4",
                    studioPanel === "library" ? "block" : "hidden",
                    "xl:order-none xl:block xl:border-t-0 xl:border-r",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-100">Variables</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-zinc-300"
                      onClick={handleAddVariableCollection}
                      title="Add variable collection"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSiteVariablesOpen((current) => !current)}
                    className="mb-2 flex w-full items-center justify-between rounded border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-left text-xs text-zinc-200"
                  >
                    Site variable collections
                    <ChevronDown
                      className={cn("size-3.5 transition-transform", !siteVariablesOpen && "-rotate-90")}
                    />
                  </button>
                  {siteVariablesOpen && (
                    <div className="mb-3 space-y-2 rounded border border-zinc-800 bg-zinc-950 px-2 py-2 text-[11px]">
                      <div className="space-y-1">
                        {variableCollections.map((collection) => (
                          <button
                            key={collection.id}
                            type="button"
                            onClick={() => setActiveCollectionId(collection.id)}
                            className={cn(
                              "flex w-full items-center justify-between rounded border px-2 py-1.5 text-left transition-colors",
                              collection.id === effectiveCollectionId
                                ? "border-amber-500/60 bg-amber-500/15 text-zinc-100"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200",
                            )}
                          >
                            <span>{collection.name || "Untitled collection"}</span>
                            {collection.id === effectiveCollectionId && (
                              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px]">Active</span>
                            )}
                          </button>
                        ))}
                      </div>
                      {activeVariableCollection && (
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase tracking-wide text-zinc-500">
                            Collection Name
                          </Label>
                          <Input
                            value={activeVariableCollection.name}
                            onChange={(event) =>
                              handleRenameCollection(activeVariableCollection.id, event.target.value)
                            }
                            className="h-7 border-zinc-700 bg-zinc-900 text-xs text-zinc-200"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setDesignSystemOpen((current) => !current)}
                    className="mb-2 flex w-full items-center justify-between rounded border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-left text-xs text-zinc-200"
                  >
                    Design System
                    <ChevronDown
                      className={cn("size-3.5 transition-transform", !designSystemOpen && "-rotate-90")}
                    />
                  </button>

                  {designSystemOpen && (
                    <div className="mb-3 space-y-2">
                      <div className="rounded border border-zinc-800 bg-zinc-950 p-2 text-[11px] text-zinc-300">
                        <Label className="mb-1 block text-[10px] uppercase tracking-wide text-zinc-500">
                          Brand Kit
                        </Label>
                        <Select
                          value={selectedBrandKit?.id ?? ""}
                          onValueChange={(value) => applyBrandKitToActiveCollection(value)}
                        >
                          <SelectTrigger className="h-7 border-zinc-700 bg-zinc-900 text-xs text-zinc-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {brandKits.map((kit) => (
                              <SelectItem key={kit.id} value={kit.id}>
                                {kit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedBrandKit && (
                          <p className="mt-1.5 text-[10px] leading-4 text-zinc-500">
                            {selectedBrandKit.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        {variableSections.map((section) => (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => setActiveVariableSection(section.id)}
                            className={cn(
                              "rounded border px-2 py-1.5 text-left transition-colors",
                              activeVariableSection === section.id
                                ? "border-amber-500/60 bg-amber-500/15 text-zinc-100"
                                : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200",
                            )}
                          >
                            {section.label}
                          </button>
                        ))}
                      </div>

                      <div className="rounded border border-zinc-800 bg-zinc-950 p-2 text-[11px] text-zinc-400">
                        {activeVariableSection === "colors" && (
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                              <span>Surface</span>
                              <input
                                type="color"
                                value={activeDesignTokens.colors.surface}
                                onChange={(event) =>
                                  updateActiveTokens("colors", { surface: event.target.value })
                                }
                                className="h-6 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
                              />
                            </div>
                            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                              <span>Brand</span>
                              <input
                                type="color"
                                value={activeDesignTokens.colors.brand}
                                onChange={(event) =>
                                  updateActiveTokens("colors", { brand: event.target.value })
                                }
                                className="h-6 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
                              />
                            </div>
                            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                              <span>Heading</span>
                              <input
                                type="color"
                                value={activeDesignTokens.colors.heading}
                                onChange={(event) =>
                                  updateActiveTokens("colors", { heading: event.target.value })
                                }
                                className="h-6 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
                              />
                            </div>
                            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                              <span>Body</span>
                              <input
                                type="color"
                                value={activeDesignTokens.colors.body}
                                onChange={(event) =>
                                  updateActiveTokens("colors", { body: event.target.value })
                                }
                                className="h-6 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
                              />
                            </div>
                            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                              <span>Gradient From</span>
                              <input
                                type="color"
                                value={activeDesignTokens.colors.gradientFrom}
                                onChange={(event) =>
                                  updateActiveTokens("colors", { gradientFrom: event.target.value })
                                }
                                className="h-6 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
                              />
                            </div>
                            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                              <span>Gradient To</span>
                              <input
                                type="color"
                                value={activeDesignTokens.colors.gradientTo}
                                onChange={(event) =>
                                  updateActiveTokens("colors", { gradientTo: event.target.value })
                                }
                                className="h-6 w-8 cursor-pointer rounded border border-zinc-700 bg-transparent"
                              />
                            </div>
                          </div>
                        )}

                        {activeVariableSection === "typography" && (
                          <div className="space-y-2">
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase tracking-wide text-zinc-500">
                                Heading Font
                              </Label>
                              <Select
                                value={activeDesignTokens.typography.headingFont}
                                onValueChange={(value) =>
                                  updateActiveTokens("typography", { headingFont: value })
                                }
                              >
                                <SelectTrigger className="h-7 border-zinc-700 bg-zinc-900 text-xs text-zinc-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {fontOptions.map((font) => (
                                    <SelectItem key={`heading-${font.value}`} value={font.value}>
                                      {font.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase tracking-wide text-zinc-500">
                                Body Font
                              </Label>
                              <Select
                                value={activeDesignTokens.typography.bodyFont}
                                onValueChange={(value) =>
                                  updateActiveTokens("typography", { bodyFont: value })
                                }
                              >
                                <SelectTrigger className="h-7 border-zinc-700 bg-zinc-900 text-xs text-zinc-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {fontOptions.map((font) => (
                                    <SelectItem key={`body-${font.value}`} value={font.value}>
                                      {font.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span>Heading min</span>
                                <span>{activeDesignTokens.typography.headingMin}px</span>
                              </div>
                              <input
                                type="range"
                                min={36}
                                max={80}
                                value={activeDesignTokens.typography.headingMin}
                                onChange={(event) =>
                                  updateActiveTokens("typography", {
                                    headingMin: Number(event.target.value),
                                  })
                                }
                                className="w-full accent-amber-500"
                              />
                            </div>
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span>Heading max</span>
                                <span>{activeDesignTokens.typography.headingMax}px</span>
                              </div>
                              <input
                                type="range"
                                min={80}
                                max={160}
                                value={activeDesignTokens.typography.headingMax}
                                onChange={(event) =>
                                  updateActiveTokens("typography", {
                                    headingMax: Number(event.target.value),
                                  })
                                }
                                className="w-full accent-amber-500"
                              />
                            </div>
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span>Body size</span>
                                <span>{activeDesignTokens.typography.bodySize}px</span>
                              </div>
                              <input
                                type="range"
                                min={14}
                                max={28}
                                value={activeDesignTokens.typography.bodySize}
                                onChange={(event) =>
                                  updateActiveTokens("typography", {
                                    bodySize: Number(event.target.value),
                                  })
                                }
                                className="w-full accent-amber-500"
                              />
                            </div>
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span>Line height</span>
                                <span>{activeDesignTokens.typography.headingLineHeight}%</span>
                              </div>
                              <input
                                type="range"
                                min={80}
                                max={120}
                                value={activeDesignTokens.typography.headingLineHeight}
                                onChange={(event) =>
                                  updateActiveTokens("typography", {
                                    headingLineHeight: Number(event.target.value),
                                  })
                                }
                                className="w-full accent-amber-500"
                              />
                            </div>
                          </div>
                        )}

                        {activeVariableSection === "sizes" && (
                          <div className="space-y-2">
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span>Frame radius</span>
                                <span>{activeDesignTokens.sizes.frameRadius}px</span>
                              </div>
                              <input
                                type="range"
                                min={8}
                                max={30}
                                value={activeDesignTokens.sizes.frameRadius}
                                onChange={(event) =>
                                  updateActiveTokens("sizes", {
                                    frameRadius: Number(event.target.value),
                                  })
                                }
                                className="w-full accent-amber-500"
                              />
                            </div>
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span>Section gap</span>
                                <span>{activeDesignTokens.sizes.sectionGap}px</span>
                              </div>
                              <input
                                type="range"
                                min={20}
                                max={64}
                                value={activeDesignTokens.sizes.sectionGap}
                                onChange={(event) =>
                                  updateActiveTokens("sizes", {
                                    sectionGap: Number(event.target.value),
                                  })
                                }
                                className="w-full accent-amber-500"
                              />
                            </div>
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span>Button radius</span>
                                <span>{activeDesignTokens.sizes.buttonRadius}px</span>
                              </div>
                              <input
                                type="range"
                                min={6}
                                max={28}
                                value={activeDesignTokens.sizes.buttonRadius}
                                onChange={(event) =>
                                  updateActiveTokens("sizes", {
                                    buttonRadius: Number(event.target.value),
                                  })
                                }
                                className="w-full accent-amber-500"
                              />
                            </div>
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span>Gradient height</span>
                                <span>{activeDesignTokens.sizes.gradientHeight}px</span>
                              </div>
                              <input
                                type="range"
                                min={80}
                                max={260}
                                value={activeDesignTokens.sizes.gradientHeight}
                                onChange={(event) =>
                                  updateActiveTokens("sizes", {
                                    gradientHeight: Number(event.target.value),
                                  })
                                }
                                className="w-full accent-amber-500"
                              />
                            </div>
                          </div>
                        )}

                        {activeVariableSection === "interactions" && (
                          <div className="space-y-2">
                            <Label className="flex items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-[11px]">
                              <span>Hover lift</span>
                              <Checkbox
                                checked={activeDesignTokens.interactions.hoverLiftEnabled}
                                onCheckedChange={(checked) =>
                                  updateActiveTokens("interactions", {
                                    hoverLiftEnabled: checked === true,
                                  })
                                }
                              />
                            </Label>
                            <Label className="flex items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-[11px]">
                              <span>Soft shadow</span>
                              <Checkbox
                                checked={activeDesignTokens.interactions.softShadowEnabled}
                                onCheckedChange={(checked) =>
                                  updateActiveTokens("interactions", {
                                    softShadowEnabled: checked === true,
                                  })
                                }
                              />
                            </Label>
                            <div>
                              <div className="mb-1 flex items-center justify-between">
                                <span>Transition speed</span>
                                <span>{activeDesignTokens.interactions.transitionMs}ms</span>
                              </div>
                              <input
                                type="range"
                                min={80}
                                max={500}
                                step={10}
                                value={activeDesignTokens.interactions.transitionMs}
                                onChange={(event) =>
                                  updateActiveTokens("interactions", {
                                    transitionMs: Number(event.target.value),
                                  })
                                }
                                className="w-full accent-amber-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mb-3 rounded border border-zinc-800 bg-zinc-950 p-2 text-[11px]">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Prebuilt Sites
                      </p>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                        {filteredSiteTemplates.length}/{prebuiltSiteTemplates.length}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <Select
                        value={templateFilter}
                        onValueChange={(value) => setTemplateFilter(value as TemplateFilter)}
                      >
                        <SelectTrigger className="h-7 border-zinc-700 bg-zinc-900 text-xs text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Templates</SelectItem>
                          {previewPageOptions.map((page) => (
                            <SelectItem key={`template-filter-${page}`} value={page}>
                              {page} Templates
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5 sm:grid-cols-2 xl:max-h-72 xl:grid-cols-1 xl:overflow-y-auto xl:pr-1">
                      {filteredSiteTemplates.length === 0 ? (
                        <p className="rounded border border-zinc-800 bg-zinc-900 px-2 py-2 text-[10px] text-zinc-500">
                          No templates in this filter yet.
                        </p>
                      ) : (
                        filteredSiteTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => handleLoadSiteTemplate(template.id)}
                            className={cn(
                              "w-full rounded border px-2 py-1.5 text-left transition-colors",
                              selectedSiteTemplateId === template.id
                                ? "border-amber-500/60 bg-amber-500/15 text-zinc-100"
                                : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-100",
                            )}
                          >
                            <p className="text-[11px] font-semibold">{template.name}</p>
                            <p className="mt-0.5 text-[10px] text-zinc-500">{template.description}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mb-3 rounded border border-zinc-800 bg-zinc-950 p-2 text-[11px]">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Visual Assets
                    </p>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAssetUpload}
                        className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-200 file:mr-2 file:rounded file:border-0 file:bg-zinc-700 file:px-2 file:py-1 file:text-[10px] file:text-zinc-100"
                      />
                      <Label className="text-[10px] uppercase tracking-wide text-zinc-500">
                        Image URL
                      </Label>
                      <Input
                        value={imageLinkInput}
                        onChange={(event) => setImageLinkInput(event.target.value)}
                        className="h-7 border-zinc-700 bg-zinc-900 text-xs text-zinc-200"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="h-7 text-[11px]"
                          onClick={handleApplyImageLink}
                        >
                          Use Link
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 border-zinc-700 text-[11px] text-zinc-200"
                          onClick={clearHeroImage}
                        >
                          Clear Image
                        </Button>
                      </div>
                      {heroImageSource && (
                        <img
                          src={heroImageSource}
                          alt="Selected visual asset"
                          className="h-16 w-full rounded border border-zinc-800 object-cover"
                        />
                      )}
                      {assetError && <p className="text-[10px] text-red-400">{assetError}</p>}
                      {assetMessage && <p className="text-[10px] text-emerald-400">{assetMessage}</p>}
                    </div>
                  </div>

                  <Separator className="mb-3 bg-zinc-800" />

                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Library</p>
                    <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                      {componentCards.length}
                    </Badge>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:max-h-[470px] xl:grid-cols-1 xl:overflow-y-auto xl:pr-1">
                    {componentCards.map((card) => {
                      const isOnCanvas = canvasComponentIds.includes(card.id);
                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={(event) => handleLibraryDragStart(event, card.id)}
                          onDragEnd={() => {
                            setDropIndex(null);
                            setDraggingComponentId(null);
                          }}
                          onClick={() => {
                            setSelectedComponentId(card.id);
                            setStudioPanel("inspector");
                          }}
                          className={cn(
                            "cursor-grab rounded-md border p-2.5 transition-colors active:cursor-grabbing",
                            isOnCanvas
                              ? "border-amber-600/50 bg-amber-500/10"
                              : "border-zinc-800 bg-zinc-900 hover:border-zinc-700",
                            draggingComponentId === card.id && "border-amber-500 bg-amber-500/15",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-zinc-100">{card.name}</p>
                            {isOnCanvas && (
                              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">
                                Added
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] leading-4 text-zinc-400">{card.summary}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-7 w-full justify-start px-2 text-[11px] text-zinc-200 hover:bg-zinc-800"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleAddToCanvas(card.id);
                            }}
                          >
                            <Plus className="mr-1.5 size-3.5" />
                            Add To Canvas
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </aside>

                <div
                  className={cn(
                    "order-1 border-t border-border bg-muted/60 p-3 md:p-4",
                    studioPanel === "canvas" ? "block" : "hidden",
                    "xl:order-none xl:block xl:border-t-0 xl:border-r",
                  )}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Globe className="size-3.5" />
                      <span>{activePreview.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewportMode("desktop")}
                        className={cn(
                          "rounded border p-1 transition-colors",
                          viewportMode === "desktop"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        <Monitor className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewportMode("tablet")}
                        className={cn(
                          "rounded border p-1 transition-colors",
                          viewportMode === "tablet"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        <Tablet className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewportMode("mobile")}
                        className={cn(
                          "rounded border p-1 transition-colors",
                          viewportMode === "mobile"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        <Smartphone className="size-3.5" />
                      </button>
                      <button type="button" className="rounded border border-border p-1 text-muted-foreground">
                        <MoreHorizontal className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="relative rounded-xl border border-border bg-card/60"
                    style={{ padding: `${activeDesignTokens.sizes.previewInset}px` }}
                  >
                    {isCanvasBlank ? (
                      <div
                        className="mx-auto rounded-xl border border-dashed border-zinc-700 bg-zinc-900/70 px-6 py-14 text-center"
                        style={{ width: "100%", maxWidth: `${activePreview.width}px` }}
                      >
                        <p className="text-sm font-semibold text-zinc-100">Blank canvas</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          Load a complete prebuilt site or drag sections from the library.
                        </p>
                        <div className="mx-auto mt-4 max-w-xs">
                          <Select
                            value={templateFilter}
                            onValueChange={(value) => setTemplateFilter(value as TemplateFilter)}
                          >
                            <SelectTrigger className="h-8 border-zinc-700 bg-zinc-900 text-xs text-zinc-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Templates</SelectItem>
                              {previewPageOptions.map((page) => (
                                <SelectItem key={`blank-filter-${page}`} value={page}>
                                  {page} Templates
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="mt-5 max-h-[360px] overflow-y-auto pr-1">
                          {filteredSiteTemplates.length === 0 ? (
                            <p className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-400">
                              No templates found for this page filter.
                            </p>
                          ) : (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                              {filteredSiteTemplates.map((template) => (
                                <button
                                  key={`blank-${template.id}`}
                                  type="button"
                                  onClick={() => handleLoadSiteTemplate(template.id)}
                                  className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-left text-[11px] text-zinc-200 transition-colors hover:border-zinc-500"
                                >
                                  <p className="font-semibold">{template.name}</p>
                                  <p className="mt-0.5 text-zinc-400">{template.page}</p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="mx-auto transition-all duration-300"
                          style={{ width: "100%", maxWidth: `${activePreview.width}px` }}
                        >
                          <div
                            className={cn(
                              "overflow-hidden border border-zinc-700",
                              activeDesignTokens.interactions.softShadowEnabled
                                ? "shadow-2xl shadow-black/20"
                                : "shadow-none",
                            )}
                            style={{
                              backgroundColor: activeDesignTokens.colors.surface,
                              borderRadius: `${activeDesignTokens.sizes.frameRadius}px`,
                              fontFamily: activeDesignTokens.typography.bodyFont,
                            }}
                          >
                            <div
                              className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                              style={{
                                borderBottomColor: activeDesignTokens.colors.sectionBorder,
                                color: activeDesignTokens.colors.brand,
                                fontSize: `${activeDesignTokens.typography.navSize}px`,
                              }}
                            >
                              <p>{previewCopy.eyebrow}</p>
                              <button
                                type="button"
                                className={cn(
                                  "w-full px-5 py-2 font-medium sm:w-auto",
                                  activeDesignTokens.interactions.hoverLiftEnabled &&
                                    "hover:-translate-y-0.5 hover:brightness-105",
                                )}
                                style={{
                                  borderRadius: `${Math.max(6, activeDesignTokens.sizes.buttonRadius - 2)}px`,
                                  backgroundColor: activeDesignTokens.colors.brand,
                                  color: activeDesignTokens.colors.buttonText,
                                  transition: previewButtonTransition,
                                }}
                              >
                                {previewCopy.secondaryCta}
                              </button>
                            </div>
                            <div
                              className="grid px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-2"
                              style={{ gap: `${activeDesignTokens.sizes.sectionGap}px` }}
                            >
                              <h2
                                className="max-w-md"
                                style={{
                                  color: activeDesignTokens.colors.heading,
                                  lineHeight: activeDesignTokens.typography.headingLineHeight / 100,
                                  fontSize: `clamp(${activeDesignTokens.typography.headingMin}px, 8vw, ${activeDesignTokens.typography.headingMax}px)`,
                                  fontFamily: activeDesignTokens.typography.headingFont,
                                }}
                              >
                                {previewCopy.heading}
                              </h2>
                              <div
                                className="max-w-md space-y-5"
                                style={{
                                  color: activeDesignTokens.colors.body,
                                  fontSize: `${activeDesignTokens.typography.bodySize}px`,
                                }}
                              >
                                <p className="leading-relaxed">{previewCopy.body}</p>
                                <div className="flex flex-wrap gap-3">
                                  <button
                                    type="button"
                                    className={cn(
                                      "px-5 py-3 font-medium",
                                      activeDesignTokens.interactions.hoverLiftEnabled &&
                                        "hover:-translate-y-0.5 hover:brightness-105",
                                    )}
                                    style={{
                                      borderRadius: `${activeDesignTokens.sizes.buttonRadius}px`,
                                      backgroundColor: activeDesignTokens.colors.brand,
                                      color: activeDesignTokens.colors.buttonText,
                                      transition: previewButtonTransition,
                                    }}
                                  >
                                    {previewCopy.primaryCta}
                                  </button>
                                  <button
                                    type="button"
                                    className={cn(
                                      "border bg-transparent px-5 py-3 font-medium",
                                      activeDesignTokens.interactions.hoverLiftEnabled &&
                                        "hover:-translate-y-0.5 hover:bg-black/5",
                                    )}
                                    style={{
                                      borderRadius: `${activeDesignTokens.sizes.buttonRadius}px`,
                                      borderColor: activeDesignTokens.colors.border,
                                      color: activeDesignTokens.colors.brand,
                                      transition: previewButtonTransition,
                                    }}
                                  >
                                    {previewCopy.secondaryCta}
                                  </button>
                                </div>
                                {heroImageSource && (
                                  <img
                                    src={heroImageSource}
                                    alt="Custom site visual"
                                    className="h-44 w-full rounded-lg border border-zinc-500/30 object-cover"
                                  />
                                )}
                              </div>
                            </div>
                            <div
                              style={{
                                height: `${activeDesignTokens.sizes.gradientHeight}px`,
                                background: `linear-gradient(90deg, ${activeDesignTokens.colors.gradientFrom} 0%, ${activeDesignTokens.colors.gradientVia} 50%, ${activeDesignTokens.colors.gradientTo} 100%)`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="pointer-events-none absolute right-6 top-24 hidden items-center rounded-md border border-zinc-700 bg-zinc-900/95 p-1.5 text-zinc-300 md:flex">
                          <ChevronLeft className="size-3.5" />
                          <ChevronRight className="ml-2 size-3.5" />
                        </div>

                        <div className="pointer-events-none absolute bottom-4 right-4 hidden w-[320px] rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 text-zinc-200 xl:block">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <p className="font-semibold">Get started</p>
                            <span className="text-zinc-400">1 of 6 complete</span>
                          </div>
                          <div className="mb-3 h-1.5 rounded-full bg-zinc-800">
                            <div className="h-full w-1/6 rounded-full bg-sky-500" />
                          </div>
                          <div className="space-y-1 text-[11px] text-zinc-400">
                            {[
                              "Create a site",
                              "Update your site theme",
                              "Generate more pages",
                              "Generate a section",
                              "Preview your site",
                              "Publish your site",
                            ].map((task, index) => (
                              <p
                                key={task}
                                className={cn(
                                  "rounded border px-2 py-1.5",
                                  index === 0
                                    ? "border-zinc-600 bg-zinc-800 text-zinc-100"
                                    : "border-zinc-800 bg-zinc-900",
                                )}
                              >
                                {task}
                              </p>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                    <div className="mt-3 rounded-xl border border-border bg-card p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-300">
                        <Eye className="size-3.5" />
                        Preview Section Stack
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-zinc-700 text-zinc-200">
                          {canvasComponentIds.length}/{form.maxComponents}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px] text-zinc-300 hover:bg-zinc-800"
                          onClick={clearCanvas}
                          disabled={canvasComponentIds.length === 0}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div
                      onDragOver={(event) => handleCanvasDragOver(event, 0)}
                      onDrop={(event) => handleCanvasDrop(event, 0)}
                      className={cn(
                        "h-2 rounded-full transition-colors",
                        dropIndex === 0 ? "bg-amber-500/70" : "bg-transparent",
                      )}
                    />

                    {canvasComponentIds.length === 0 ? (
                      <div
                        onDragOver={(event) => handleCanvasDragOver(event, 0)}
                        onDrop={(event) => handleCanvasDrop(event, 0)}
                        className="mt-3 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 px-4 py-10 text-center"
                      >
                        <p className="text-sm font-medium text-zinc-100">Drop components here</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          Arrange your section order before generating the prompt.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto pr-1">
                        {canvasComponentIds.map((componentId, index) => {
                          const component = componentCardMap[componentId];
                          if (!component) return null;

                          return (
                            <div key={`${componentId}-${index}`} className="space-y-1.5">
                              <div
                                onDragOver={(event) => handleCanvasDragOver(event, index)}
                                onDrop={(event) => handleCanvasDrop(event, index)}
                                className={cn(
                                  "h-2 rounded-full transition-colors",
                                  dropIndex === index ? "bg-amber-500/70" : "bg-transparent",
                                )}
                              />
                              <div
                                draggable
                                onClick={() => {
                                  setSelectedComponentId(componentId);
                                  setStudioPanel("inspector");
                                }}
                                onDragStart={(event) => handleCanvasDragStart(event, componentId, index)}
                                onDragEnd={() => {
                                  setDropIndex(null);
                                  setDraggingComponentId(null);
                                }}
                                className={cn(
                                  "cursor-grab rounded-md border px-3 py-2 active:cursor-grabbing",
                                  selectedComponentId === componentId
                                    ? "border-amber-500/70 bg-amber-500/10"
                                    : "border-zinc-700 bg-zinc-900",
                                  draggingComponentId === componentId && "border-amber-400 bg-amber-400/15",
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-zinc-100">
                                      {index + 1}. {component.name}
                                    </p>
                                    <p className="mt-1 text-[11px] leading-4 text-zinc-400">
                                      {component.previewHint}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <GripVertical className="size-3.5 text-zinc-500" />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="size-6 text-zinc-400 hover:bg-zinc-800"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleRemoveFromCanvas(index);
                                      }}
                                      aria-label={`Remove ${component.name}`}
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              <div
                                onDragOver={(event) => handleCanvasDragOver(event, index + 1)}
                                onDrop={(event) => handleCanvasDrop(event, index + 1)}
                                className={cn(
                                  "h-2 rounded-full transition-colors",
                                  dropIndex === index + 1 ? "bg-amber-500/70" : "bg-transparent",
                                )}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <aside
                  className={cn(
                    "order-3 border-t border-border bg-sidebar/95 p-3 text-sidebar-foreground sm:p-4",
                    studioPanel === "inspector" ? "block" : "hidden",
                    "xl:order-none xl:block xl:border-t-0",
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-zinc-100">
                      {selectedComponent ? `${selectedComponent.name} selected` : "None Selected"}
                    </p>
                    <Badge className="border-zinc-700 bg-zinc-800 text-zinc-300" variant="outline">
                      {inspectorMode}
                    </Badge>
                  </div>

                  <div className="mb-3 grid grid-cols-3 overflow-hidden rounded-md border border-zinc-800 text-xs">
                    {inspectorTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setInspectorMode(tab)}
                        className={cn(
                          "border-zinc-800 px-2 py-1.5",
                          tab !== inspectorTabs[0] && "border-l",
                          inspectorMode === tab
                            ? "bg-zinc-800 font-medium text-zinc-100"
                            : "text-zinc-400",
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {inspectorMode === "Style" && (
                    <div className="space-y-3">
                      <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500">Style selector</p>
                        <p className="mt-1 text-sm text-zinc-200">
                          {selectedComponent ? selectedComponent.name : "None"}
                        </p>
                      </div>
                      <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
                        <p className="mb-1 font-semibold uppercase tracking-wide text-zinc-500">
                          Typography
                        </p>
                        <p>Heading font: {activeDesignTokens.typography.headingFont}</p>
                        <p>Body font: {activeDesignTokens.typography.bodyFont}</p>
                        <p>
                          Size: {activeDesignTokens.typography.headingMin}-{activeDesignTokens.typography.headingMax}
                          px
                        </p>
                        <p>Line height: {activeDesignTokens.typography.headingLineHeight}%</p>
                        <p className="pt-1 text-zinc-500">
                          Collection: {activeVariableCollection?.name ?? "Base collection"}
                        </p>
                      </div>
                    </div>
                  )}

                  {inspectorMode === "Settings" && (
                    <div className="space-y-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-xs text-zinc-400">
                      <p className="font-semibold uppercase tracking-wide text-zinc-500">Element settings</p>
                      <p>Element tag: section</p>
                      <p>Visibility: All breakpoints</p>
                      <p>ARIA label: {selectedComponent?.name ?? "N/A"}</p>
                    </div>
                  )}

                  {inspectorMode === "Interactions" && (
                    <div className="space-y-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-xs text-zinc-400">
                      <p className="font-semibold uppercase tracking-wide text-zinc-500">Interactions</p>
                      <p>No animation assigned.</p>
                      <Button type="button" variant="outline" className="h-7 w-full border-zinc-700 text-xs">
                        Create interaction
                      </Button>
                    </div>
                  )}

                  <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-center">
                    {selectedComponent ? (
                      <div className="space-y-3 text-left">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Component Details
                        </p>
                        <p className="text-sm font-semibold text-zinc-100">{selectedComponent.summary}</p>
                        <p className="text-xs leading-5 text-zinc-400">
                          <span className="font-medium text-zinc-300">Includes:</span>{" "}
                          {selectedComponent.includes}
                        </p>
                        <Separator className="bg-zinc-800" />
                        <p className="text-xs leading-5 text-zinc-400">{selectedComponent.previewHint}</p>
                      </div>
                    ) : (
                      <>
                        <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                          <Library className="size-6 text-zinc-500" />
                        </div>
                        <p className="text-sm font-medium text-zinc-200">Make a selection</p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Choose a component from the canvas to edit its panel details.
                        </p>
                      </>
                    )}
                  </div>
                </aside>
              </div>
          </Card>
        </div>

        <div className="container mx-auto px-4 pt-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">1. Project Definition</CardTitle>
                  <CardDescription>
                    Define the outcome, audience, and voice before adding technical constraints.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Project Type</Label>
                    <RadioGroup
                      value={form.projectType}
                      onValueChange={(value) => updateField("projectType", value as ProjectType)}
                      className="grid gap-3 md:grid-cols-2"
                    >
                      {projectTypes.map((type) => {
                        const id = `project-${type.replace(/\s+/g, "-").toLowerCase()}`;
                        return (
                          <Label
                            key={type}
                            htmlFor={id}
                            className={cn(
                              "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                              form.projectType === type
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40",
                            )}
                          >
                            <RadioGroupItem id={id} value={type} className="mt-0.5" />
                            <span className="text-sm leading-5">{type}</span>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="useCase">Use Case</Label>
                    <Textarea
                      id="useCase"
                      value={form.useCase}
                      onChange={(event) => updateField("useCase", event.target.value)}
                      className="min-h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      value={form.targetAudience}
                      onChange={(event) => updateField("targetAudience", event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryGoal">Primary Goal</Label>
                    <Textarea
                      id="primaryGoal"
                      value={form.primaryGoal}
                      onChange={(event) => updateField("primaryGoal", event.target.value)}
                      className="min-h-24"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="brandVoice">Brand Voice</Label>
                      <Input
                        id="brandVoice"
                        value={form.brandVoice}
                        onChange={(event) => updateField("brandVoice", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visualStyle">Visual Style</Label>
                      <Input
                        id="visualStyle"
                        value={form.visualStyle}
                        onChange={(event) => updateField("visualStyle", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain (optional)</Label>
                    <Input
                      id="domain"
                      type="url"
                      value={form.domain}
                      onChange={(event) => updateField("domain", event.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">2. Scope Constraints</CardTitle>
                  <CardDescription>
                    Lock the limits first to prevent scope creep and maintain portability.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="maxPages">Maximum Pages</Label>
                      <Input
                        id="maxPages"
                        type="number"
                        min={1}
                        max={50}
                        value={form.maxPages}
                        onChange={(event) =>
                          updateField("maxPages", Number.parseInt(event.target.value || "0", 10))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxComponents">Maximum Components/Sections</Label>
                      <Input
                        id="maxComponents"
                        type="number"
                        min={1}
                        max={30}
                        value={form.maxComponents}
                        onChange={(event) =>
                          updateField("maxComponents", Number.parseInt(event.target.value || "0", 10))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">
                      Is this for Webflow Marketplace submission?
                    </Label>
                    <RadioGroup
                      value={form.isMarketplace}
                      onValueChange={(value) => updateField("isMarketplace", value as MarketplaceMode)}
                      className="grid gap-3 md:grid-cols-2"
                    >
                      <Label
                        htmlFor="marketplace-yes"
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                          form.isMarketplace === "yes"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <RadioGroupItem id="marketplace-yes" value="yes" className="mt-0.5" />
                        <span className="text-sm leading-5">Yes - full Marketplace compliance</span>
                      </Label>
                      <Label
                        htmlFor="marketplace-no"
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                          form.isMarketplace === "no"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <RadioGroupItem id="marketplace-no" value="no" className="mt-0.5" />
                        <span className="text-sm leading-5">No - personal/client project</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {form.isMarketplace === "yes" && (
                    <div className="space-y-6 rounded-lg border border-secondary/40 bg-secondary/10 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="licenseType">License Type</Label>
                        <Select
                          value={form.licenseType}
                          onValueChange={(value) => updateField("licenseType", value as LicenseType)}
                        >
                          <SelectTrigger id="licenseType" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FREE">FREE - No cost to users</SelectItem>
                            <SelectItem value="COMMERCIAL">COMMERCIAL - Paid license</SelectItem>
                            <SelectItem value="FREEMIUM">FREEMIUM - Free with upgrades</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="libraryPurpose">Library Purpose</Label>
                        <Textarea
                          id="libraryPurpose"
                          value={form.libraryPurpose}
                          onChange={(event) => updateField("libraryPurpose", event.target.value)}
                          className="min-h-20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="targetUseCase">Target Use Case</Label>
                        <Textarea
                          id="targetUseCase"
                          value={form.targetUseCase}
                          onChange={(event) => updateField("targetUseCase", event.target.value)}
                          className="min-h-20"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-sm font-semibold">Quality Assurance Checklist</Label>
                          <Badge variant="outline">{qaCheckedCount}/10 checked</Badge>
                        </div>
                        <div className="space-y-3">
                          {qaChecklistItems.map((item) => (
                            <Label
                              key={item.id}
                              htmlFor={item.id}
                              className="flex items-start gap-3 rounded-md border border-border/70 bg-background/70 p-3"
                            >
                              <Checkbox
                                id={item.id}
                                checked={form.qaChecks[item.id]}
                                onCheckedChange={(checked) => toggleQaItem(item.id, checked === true)}
                                className="mt-0.5"
                              />
                              <span className="text-sm leading-5 text-muted-foreground">{item.label}</span>
                            </Label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">3. AEO Maturity Level</CardTitle>
                  <CardDescription>
                    Tune output depth based on your current AEO maturity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={form.maturityLevel}
                    onValueChange={(value) => updateField("maturityLevel", value as MaturityLevel)}
                    className="grid gap-3 md:grid-cols-3"
                  >
                    {([
                      { value: "1-2", label: "Level 1-2: New to AEO" },
                      { value: "2-3", label: "Level 2-3: SEO foundation" },
                      { value: "3-4", label: "Level 3-4: Advanced" },
                    ] as const).map((level) => (
                      <Label
                        key={level.value}
                        htmlFor={`maturity-${level.value}`}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                          form.maturityLevel === level.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <RadioGroupItem
                          id={`maturity-${level.value}`}
                          value={level.value}
                          className="mt-0.5"
                        />
                        <span className="text-sm leading-5">{level.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>

                  <Alert>
                    <Sparkles className="size-4" />
                    <AlertTitle>Current Guidance</AlertTitle>
                    <AlertDescription>{maturityInfo[form.maturityLevel]}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">4. Additional Options</CardTitle>
                  <CardDescription>
                    Optional but useful inputs for schema, entity linking, and authority context.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="brandName">Brand Name</Label>
                      <Input
                        id="brandName"
                        value={form.brandName}
                        onChange={(event) => updateField("brandName", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={form.contactEmail}
                        onChange={(event) => updateField("contactEmail", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialProfiles">Social Media Profiles (one per line)</Label>
                    <Textarea
                      id="socialProfiles"
                      value={form.socialProfiles}
                      onChange={(event) => updateField("socialProfiles", event.target.value)}
                      className="min-h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industryTerms">Key Industry Terms / Entities</Label>
                    <Textarea
                      id="industryTerms"
                      value={form.industryTerms}
                      onChange={(event) => updateField("industryTerms", event.target.value)}
                      className="min-h-20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authorityReferences">Third-Party Authority References</Label>
                    <Textarea
                      id="authorityReferences"
                      value={form.authorityReferences}
                      onChange={(event) => updateField("authorityReferences", event.target.value)}
                      className="min-h-20"
                    />
                  </div>
                </CardContent>
              </Card>

              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertTitle>Cannot generate prompt yet</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" size="lg" className="w-full gap-2">
                <Wand2 className="size-4" />
                Generate Master Prompt
              </Button>
            </form>

            {prompt && (
              <div ref={outputRef}>
                <Card className="border-primary/40">
                  <CardHeader>
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                          <CheckCircle2 className="size-5 text-primary" />
                          Your Generated Master Prompt
                        </CardTitle>
                        <CardDescription>
                          Copy this directly into your AI website builder.
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant={currentAccountEmail ? "default" : "outline"}
                          onClick={handleDownloadSitePackage}
                          className="gap-2"
                          disabled={!currentAccountEmail}
                        >
                          {currentAccountEmail ? (
                            <Download className="size-4" />
                          ) : (
                            <Lock className="size-4" />
                          )}
                          {currentAccountEmail ? "Download Site Package" : "Sign In To Download"}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCopyPrompt} className="gap-2">
                          {copied ? <ClipboardCopy className="size-4" /> : <Copy className="size-4" />}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleReset} className="gap-2">
                          <RefreshCcw className="size-4" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="max-h-[720px] overflow-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-xs leading-6 whitespace-pre-wrap">
                      {prompt}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Account Access</CardTitle>
                <CardDescription>
                  Site package downloads are unlocked only for signed-in users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentAccountEmail ? (
                  <div className="space-y-3">
                    <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                      <p className="font-medium">Signed in as</p>
                      <p className="text-muted-foreground">{currentAccountEmail}</p>
                    </div>
                    <Button type="button" variant="outline" onClick={handleLogout} className="w-full gap-2">
                      <LogOut className="size-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 overflow-hidden rounded-md border border-border text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signin");
                          setAuthError(null);
                          setAuthInfo(null);
                        }}
                        className={cn(
                          "px-3 py-2",
                          authMode === "signin"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground",
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          <LogIn className="size-3.5" />
                          Sign In
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signup");
                          setAuthError(null);
                          setAuthInfo(null);
                        }}
                        className={cn(
                          "border-l border-border px-3 py-2",
                          authMode === "signup"
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground",
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          <UserPlus className="size-3.5" />
                          Sign Up
                        </span>
                      </button>
                    </div>

                    <form className="space-y-3" onSubmit={handleAuthSubmit}>
                      <div className="space-y-1.5">
                        <Label htmlFor="account-email">Email</Label>
                        <Input
                          id="account-email"
                          type="email"
                          value={accountEmail}
                          onChange={(event) => setAccountEmail(event.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="account-password">Password</Label>
                        <Input
                          id="account-password"
                          type="password"
                          value={accountPassword}
                          onChange={(event) => setAccountPassword(event.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full gap-2">
                        {authMode === "signup" ? (
                          <>
                            <UserPlus className="size-4" />
                            Create Account
                          </>
                        ) : (
                          <>
                            <LogIn className="size-4" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>
                  </>
                )}

                {authError && (
                  <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {authError}
                  </p>
                )}
                {authInfo && (
                  <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700">
                    {authInfo}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Builder Snapshot</CardTitle>
                <CardDescription>Live summary of your current configuration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Project</span>
                  <Badge variant="outline">{form.projectType}</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Marketplace Mode</span>
                  <Badge variant={form.isMarketplace === "yes" ? "secondary" : "outline"}>
                    {form.isMarketplace === "yes" ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Download Access</span>
                  <Badge variant={currentAccountEmail ? "secondary" : "outline"}>
                    {currentAccountEmail ? "Unlocked" : "Locked"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Variable Collection</span>
                  <Badge variant="outline">{activeVariableCollection?.name ?? "Base collection"}</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Brand Kit</span>
                  <Badge variant="outline">{selectedBrandKit?.name ?? "None"}</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Site Template</span>
                  <Badge variant={selectedSiteTemplate ? "secondary" : "outline"}>
                    {selectedSiteTemplate?.name ?? "Blank canvas"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Hero Asset</span>
                  <Badge variant={heroImageSource ? "secondary" : "outline"}>
                    {heroImageSource ? "Attached" : "None"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Pages</span>
                  <span className="font-medium">{form.maxPages}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Canvas Components</span>
                  <span className="font-medium">
                    {canvasComponentIds.length}/{form.maxComponents}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Maturity</span>
                  <Badge variant="outline">Level {form.maturityLevel}</Badge>
                </div>
                {form.isMarketplace === "yes" && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">QA Completion</span>
                    <span className="font-medium">
                      {qaCheckedCount}/{qaChecklistItems.length}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Preview Order
                  </p>
                  {canvasComponentIds.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No components selected yet.</p>
                  ) : (
                    <ol className="space-y-1 text-xs text-muted-foreground">
                      {canvasComponentIds.map((componentId, index) => (
                        <li key={`${componentId}-snapshot-${index}`}>
                          {index + 1}. {componentCardMap[componentId]?.name ?? componentId}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">Output Includes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>- Blank-canvas start with prebuilt complete site templates</p>
                <p>- Brand kit and font controls tied to live preview</p>
                <p>- Uploaded or linked hero image asset support</p>
                <p>- Webflow-native structure and naming map</p>
                <p>- llms.txt and llms-full.txt guidance</p>
                <p>- JSON-LD schema requirements by page type</p>
                <p>- FAQ pack + quality gates + QA checklist</p>
                <p>- AEO + authority + measurement instructions</p>
              </CardContent>
            </Card>
          </aside>
        </div>
        </div>
      </div>
    </div>
  );
}
