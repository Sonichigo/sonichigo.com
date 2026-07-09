import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import {BootSequence} from "@/components/BootSequence";
import "./globals.css";

export const metadata: Metadata = {
  verification: {
    google: "cZ_3DAOYl2wChO4aj_e6XI92-GDHBjvB9DFhFEhLMgA",
  },
  title: {
    default: "Animesh Pathak | Developer Relations Engineer & Cloud Native Speaker",
    template: "%s | Animesh Pathak",
  },
  description:
    "Animesh Pathak — Developer Relations Engineer at Harness, focused on Database DevOps, cloud-native, and eBPF testing. OSS contributor, CNCF community organizer, conference speaker, and technical writer.",
  keywords: [
    "Animesh Pathak",
    "sonichigo",
    "Developer Relations Engineer",
    "DevRel",
    "Database DevOps",
    "Harness",
    "Keploy",
    "eBPF testing",
    "cloud native",
    "CNCF",
    "CNCG Noida",
    "open source contributor",
    "Kubernetes",
    "technical writer",
    "conference speaker India",
    "Gold Microsoft Learn Student Ambassador",
  ],
  metadataBase: new URL("https://sonichigo.com"),
  alternates: {
    canonical: "https://sonichigo.com",
  },
  openGraph: {
    title: "Animesh Pathak | Developer Relations Engineer & Cloud Native Speaker",
    description: "DevRel at Harness. OSS contributor, CNCF community organizer, and technical writer focused on Database DevOps, Kubernetes, and eBPF testing.",
    url: "https://sonichigo.com",
    siteName: "Animesh Pathak",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/api/og?title=Animesh%20Pathak&subtitle=DevRel%2C%20OSS%20Contributor%20%26%20Writer&type=default",
        width: 1200,
        height: 630,
        alt: "Animesh Pathak | Developer Relations Engineer & Cloud Native Speaker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@sonichigo",
    title: "Animesh Pathak | Developer Relations Engineer & Cloud Native Speaker",
    description: "DevRel at Harness. OSS contributor, CNCF community organizer, and technical writer focused on Database DevOps, Kubernetes, and eBPF testing.",
    images: ["/api/og?title=Animesh%20Pathak&subtitle=DevRel%2C%20OSS%20Contributor%20%26%20Writer&type=default"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Animesh Pathak",
    alternateName: "sonichigo",
    url: "https://sonichigo.com",
    image: "https://sonichigo.com/profile.png",
    jobTitle: "Developer Relations Engineer",
    worksFor: { "@type": "Organization", name: "Harness", url: "https://harness.io" },
    description:
      "Developer Relations Engineer at Harness focused on Database DevOps, cloud-native, and eBPF testing. OSS contributor, CNCF community organizer, conference speaker, and Gold Microsoft Learn Student Ambassador.",
    sameAs: [
      "https://github.com/sonichigo",
      "https://linkedin.com/in/sonichigo",
      "https://x.com/sonichigo",
      "https://sonichigo.hashnode.dev",
    ],
    knowsAbout: [
      "Database DevOps",
      "Kubernetes",
      "eBPF",
      "API Testing",
      "Cloud Native",
      "Developer Relations",
      "Open Source",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-mono antialiased">
        <ThemeProvider>
          <BootSequence />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
