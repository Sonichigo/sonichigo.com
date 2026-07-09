import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Technical articles and tutorials by Animesh Pathak on Database DevOps, Kubernetes, eBPF, API testing, cloud-native development, and developer tooling — published on Hashnode, Keploy, and Harness.",
  keywords: [
    "Animesh Pathak blog",
    "Database DevOps articles",
    "Kubernetes tutorials",
    "eBPF blog",
    "API testing",
    "cloud native tutorials",
    "DevRel writing",
    "Harness blog",
    "Keploy blog",
    "developer tooling",
  ],
  alternates: {
    canonical: "https://sonichigo.com/posts",
  },
  openGraph: {
    title: "Writing by Animesh Pathak",
    description:
      "Technical articles on Database DevOps, Kubernetes, eBPF, and cloud-native development.",
    url: "https://sonichigo.com/posts",
    type: "website",
  },
};

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
