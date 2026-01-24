import type { Metadata } from "next";
import { JobsBoard } from "@/components/jobs/jobs-board";
import { JobsHero } from "@/components/jobs/jobs-hero";

export const metadata: Metadata = {
  title: "Jobs Board",
  description:
    "Find employment opportunities in Cape Town. Browse job listings, get CV assistance, and connect with employers through Our Community In Unity.",
};

export default function JobsPage() {
  return (
    <>
      <JobsHero />
      <JobsBoard />
    </>
  );
}
