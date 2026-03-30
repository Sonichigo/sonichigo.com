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
    title: "Animesh Pathak",
    description: "DevRel, OSS Contributor & Writer",
    url: "https://sonichigo.com",
    siteName: "sonichigo.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@sonichigo1219",
  },
  icons: { icon: "/favicon.ico" },
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
