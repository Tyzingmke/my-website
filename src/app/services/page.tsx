import type { Metadata } from "next";
import { ServicesCatalogue } from "@/components/ServicesCatalogue";

export const metadata: Metadata = {
  title: "Web Design Services in Kenya",
  description: "Explore Tony Consults portfolio websites, business website packs, e-commerce tiers and a clear delivery process for Kenyan businesses and professionals.",
  alternates: { canonical: "/services/" },
};

export default function ServicesPage() {
  return <ServicesCatalogue />;
}
