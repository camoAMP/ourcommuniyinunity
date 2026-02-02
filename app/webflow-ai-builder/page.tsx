import type { Metadata } from "next";
import { WebflowAiBuilderPage } from "@/components/webflow-ai-builder/webflow-ai-builder-page";

export const metadata: Metadata = {
  title: "Webflow AI Builder",
  description: "Webflow Marketplace AI prompt builder with typed state and reusable output.",
};

export default function WebflowAiBuilderRoute() {
  return <WebflowAiBuilderPage />;
}
