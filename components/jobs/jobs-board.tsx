"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Clock,
  Banknote,
  Building2,
  Briefcase,
  ArrowRight,
  FileText,
  Users,
  CheckCircle2,
} from "lucide-react";

const jobListings = [
  {
    id: 1,
    title: "Administrative Assistant",
    company: "Cape Business Services",
    location: "Cape Town CBD",
    type: "Full-time",
    salary: "R8,000 - R12,000",
    posted: "2 days ago",
    category: "Admin",
    description:
      "Seeking an organized individual for general office duties, filing, and customer service.",
    requirements: ["Matric certificate", "Computer literacy", "Good communication"],
  },
  {
    id: 2,
    title: "Security Officer",
    company: "SafeGuard Security",
    location: "Various Locations",
    type: "Full-time",
    salary: "R6,500 - R8,000",
    posted: "1 day ago",
    category: "Security",
    description: "Licensed security officers needed for various sites across Cape Town.",
    requirements: ["PSIRA Grade C/B", "Clear criminal record", "Own transport advantageous"],
  },
  {
    id: 3,
    title: "Junior Electrician",
    company: "Spark Electric",
    location: "Bellville",
    type: "Full-time",
    salary: "R10,000 - R15,000",
    posted: "3 days ago",
    category: "Trades",
    description:
      "Qualified or semi-qualified electrician for residential and commercial installations.",
    requirements: ["Electrical qualification", "Valid driver's license", "2+ years experience"],
  },
  {
    id: 4,
    title: "Retail Sales Associate",
    company: "Fashion Hub",
    location: "Canal Walk",
    type: "Part-time",
    salary: "R4,500 - R5,500",
    posted: "1 week ago",
    category: "Retail",
    description: "Customer-focused individual for busy retail environment.",
    requirements: ["Previous retail experience", "Friendly personality", "Flexible hours"],
  },
  {
    id: 5,
    title: "Driver / Delivery Person",
    company: "Quick Logistics",
    location: "Parow",
    type: "Full-time",
    salary: "R7,000 - R9,000",
    posted: "4 days ago",
    category: "Transport",
    description: "Reliable driver needed for local deliveries.",
    requirements: ["Valid Code 10 license", "PDP", "Knowledge of Cape Town area"],
  },
  {
    id: 6,
    title: "Call Center Agent",
    company: "Connect SA",
    location: "Century City",
    type: "Full-time",
    salary: "R6,000 - R8,500",
    posted: "5 days ago",
    category: "Customer Service",
    description: "Inbound call center position with training provided.",
    requirements: ["Matric", "Clear speaking voice", "Computer basics"],
  },
];

const categories = [
  "All Categories",
  "Admin",
  "Security",
  "Trades",
  "Retail",
  "Transport",
  "Customer Service",
  "Hospitality",
  "Construction",
];

const jobTypes = ["All Types", "Full-time", "Part-time", "Contract", "Internship"];

export function JobsBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [jobType, setJobType] = useState("All Types");

  const filteredJobs = jobListings.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "All Categories" || job.category === category;
    const matchesType = jobType === "All Types" || job.type === jobType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <>
      {/* Job Listings Section */}
      <section id="listings" className="bg-background py-20">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="mb-8 rounded-xl bg-muted p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="search" className="sr-only">
                  Search jobs
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Search by title, company, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category" className="sr-only">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jobType" className="sr-only">
                  Job Type
                </Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="mb-6 text-muted-foreground">
            Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""}
          </p>

          {/* Job Cards */}
          {filteredJobs.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                No jobs found matching your criteria.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("");
                  setCategory("All Categories");
                  setJobType("All Types");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="font-serif text-xl text-card-foreground">
                          {job.title}
                        </CardTitle>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </p>
                      </div>
                      <Badge variant="secondary">{job.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>{job.description}</CardDescription>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Banknote className="h-4 w-4" />
                        {job.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.posted}
                      </span>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Requirements
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {job.requirements.map((req) => (
                          <li key={req}>
                            <Badge variant="outline" className="font-normal">
                              {req}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CV Help Section */}
      <section id="cv-help" className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <FileText className="h-4 w-4" />
                Free Service
              </div>
              <h2 className="mb-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                CV Assistance Program
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Need help creating or improving your CV? Our team provides free CV writing
                assistance to help you stand out to employers.
              </p>
              <ul className="mb-8 space-y-3">
                {[
                  "Professional CV writing and formatting",
                  "Cover letter assistance",
                  "Interview preparation tips",
                  "Career guidance counseling",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg">
                Book a Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="rounded-2xl bg-card p-8 shadow-lg">
              <h3 className="mb-6 font-serif text-xl font-semibold text-card-foreground">
                Request CV Help
              </h3>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" className="mt-1" required />
                </div>
                <div>
                  <Label htmlFor="helpType">What do you need help with?</Label>
                  <Select>
                    <SelectTrigger id="helpType" className="mt-1">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Create new CV</SelectItem>
                      <SelectItem value="improve">Improve existing CV</SelectItem>
                      <SelectItem value="cover">Cover letter help</SelectItem>
                      <SelectItem value="interview">Interview preparation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Submit Request
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* For Employers Section */}
      <section id="employers" className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <Users className="mx-auto mb-6 h-12 w-12 text-secondary" />
          <h2 className="mb-4 font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
            For Employers
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/80">
            Partner with OCIU to find reliable, motivated employees from our community.
            Post jobs for free and access our pool of pre-screened candidates.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              Post a Job
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              Partner With Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
