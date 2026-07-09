import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travels",
  description:
    "Places Animesh Pathak has visited — conferences, community meetups, and explorations across India and the world.",
  keywords: [
    "Animesh Pathak travels",
    "tech conferences visited",
    "DevRel travel",
    "cloud native events",
  ],
  alternates: {
    canonical: "https://sonichigo.com/travels",
  },
  openGraph: {
    title: "Travels — Animesh Pathak",
    description: "Conferences, meetups, and places visited by Animesh Pathak.",
    url: "https://sonichigo.com/travels",
    type: "website",
  },
};

export default function TravelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
