import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talks",
  description:
    "Conference talks, meetup sessions, and keynotes by Animesh Pathak — covering DevOps, cloud-native, Kubernetes, eBPF, and developer tooling across India and internationally.",
  keywords: [
    "Animesh Pathak talks",
    "DevRel conference speaker",
    "cloud native talks India",
    "Kubernetes speaker",
    "eBPF conference talk",
    "CNCG Noida",
    "developer conference India",
    "DevOps speaker",
  ],
  alternates: {
    canonical: "https://sonichigo.com/talks",
  },
  openGraph: {
    title: "Talks by Animesh Pathak",
    description:
      "Conference talks and sessions on DevOps, cloud-native, Kubernetes, and developer tooling.",
    url: "https://sonichigo.com/talks",
    type: "website",
  },
};

export default function TalksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
