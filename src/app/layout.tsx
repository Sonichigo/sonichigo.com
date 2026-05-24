import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Animesh Pathak | DevRel, OSS Contributor & Writer",
    template: "%s — Animesh Pathak",
  },
  description:
    "Developer Relations Engineer. Open source contributor, speaker, and writer. Building and breaking tools to learn more.",
  metadataBase: new URL("https://sonichigo.com"),
  openGraph: {
    title: "Animesh Pathak | DevRel, OSS Contributor & Writer",
    description: "Developer Relations Engineer. Open source contributor, speaker, and writer. Building and breaking tools to learn more.",
    url: "https://sonichigo.com",
    siteName: "sonichigo.com",
    type: "website",
    images: [
      {
        url: "/api/og?title=Animesh%20Pathak&subtitle=DevRel%2C%20OSS%20Contributor%20%26%20Writer&type=default",
        width: 1200,
        height: 630,
        alt: "Animesh Pathak - DevRel, OSS Contributor & Writer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@sonichigo1219",
    title: "Animesh Pathak | DevRel, OSS Contributor & Writer",
    description: "Developer Relations Engineer. Open source contributor, speaker, and writer. Building and breaking tools to learn more.",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-mono antialiased">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
