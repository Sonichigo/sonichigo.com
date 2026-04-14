import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/posts", label: "Posts" },
  { href: "/talks", label: "Talks" },
  { href: "/travels", label: "Travels" },
  { href: "/about", label: "About" },
];

const SOCIALS = [
  { href: "https://github.com/sonichigo", label: "GitHub" },
  { href: "https://linkedin.com/in/sonichigo", label: "LinkedIn" },
  { href: "https://x.com/sonichigo1219", label: "X" },
  { href: "https://sonichigo.hashnode.dev", label: "Blog" },
  { href: "https://www.credly.com/users/sonichigo", label: "Credly" },
];

export function Footer() {
  return (
    <footer className="border-t mt-20" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row justify-between gap-6">
          <div className="flex gap-6 text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:underline underline-offset-4 transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex gap-6 text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>
            {SOCIALS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-4 transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <p className="text-xs font-mono mt-8" style={{ color: "var(--text-tertiary)" }}>
          &copy; {new Date().getFullYear()} Animesh Pathak. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
