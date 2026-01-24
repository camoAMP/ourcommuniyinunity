import type { Metadata } from "next";
import StudyBuddyApp from "@/components/studybuddy/studybuddy-app";

export const metadata: Metadata = {
  title: "StudyBuddy AI",
  description:
    "StudyBuddy AI is a free, adaptive tutor that helps learners with math, science, and biology using online and offline modes.",
};

export default function StudyBuddyPage() {
  return <StudyBuddyApp />;
}
