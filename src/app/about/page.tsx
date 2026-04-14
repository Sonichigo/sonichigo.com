import { fetchGitHubProfile } from "@/lib/github";

export const revalidate = 3600;

export const metadata = {
  title: "About",
};

export default async function AboutPage() {
  const profile = await fetchGitHubProfile();

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="page-title">About</h1>
      <p className="page-subtitle">A bit about me, what I do, and where to find me.</p>

      <div className="space-y-10">
        {/* Bio */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.2em] mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            // who am I
          </h2>
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            <p>
              I&apos;m <strong style={{ color: "var(--text-primary)" }}>Animesh Pathak</strong> — a Developer Relations
              Engineer currently at{" "}
              <a
                href="https://harness.io"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-1"
                style={{ color: "var(--accent)" }}
              >
                Harness
              </a>
              , focused on Database DevOps, APIs, testing, and open-source
              innovation. Previously, I worked at{" "}
              <a
                href="https://keploy.io"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 decoration-1"
                style={{ color: "var(--accent)" }}
              >
                Keploy
              </a>{" "}
              where I evangelized eBPF-based testing tools.
            </p>
            <p>
              I&apos;m an open source contributor, avid tech community enthusiast,
              and a Gold Microsoft Learn Student Ambassador. I have a passion for
              learning and sharing knowledge with others as publicly as possible.
            </p>
            <p>
              When I&apos;m not building or breaking tools, I love reading books,
              tinkering with side projects, and discovering new technologies to
              document my experience with them.
            </p>
          </div>
        </section>

        {/* What I do */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.2em] mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            // what I do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: "Developer Relations",
                desc: "Building communities, creating content, and bridging the gap between developers and products.",
              },
              {
                label: "Open Source",
                desc: "Contributing to OSS projects, maintaining tools, and advocating for open development.",
              },
              {
                label: "Technical Writing",
                desc: "Deep-dives, tutorials, and articles on DevOps, cloud-native, eBPF, and testing.",
              },
              {
                label: "Public Speaking",
                desc: "Talks at conferences and meetups across India and internationally.",
              },
            ].map((item) => (
              <div key={item.label} className="card-base">
                <h3 className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  {item.label}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Connect */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.2em] mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            // connect
          </h2>
          <div className="space-y-2">
            {[
              { label: "GitHub", url: "https://github.com/sonichigo", handle: "@sonichigo" },
              { label: "LinkedIn", url: "https://linkedin.com/in/sonichigo", handle: "in/sonichigo" },
              { label: "X / Twitter", url: "https://x.com/sonichigo1219", handle: "@sonichigo1219" },
              { label: "Blog", url: "https://sonichigo.hashnode.dev", handle: "sonichigo.hashnode.dev" },
              { label: "Credly", url: "https://www.credly.com/users/sonichigo", handle: "Certifications & Badges" },
              { label: "Sponsor", url: "https://github.com/sponsors/sonichigo", handle: "Buy me a coffee" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-2 border-t text-sm hover:underline underline-offset-4 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <span>{social.label}</span>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {social.handle} ↗
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* GitHub stats */}
        {profile && (
          <section>
            <h2
              className="text-xs uppercase tracking-[0.2em] mb-4"
              style={{ color: "var(--text-tertiary)" }}
            >
              // github
            </h2>
            <div className="card-base">
              <div className="flex items-center gap-4 mb-3">
                {profile.avatar_url && (
                  <img
                    src={profile.avatar_url}
                    alt="Animesh Pathak"
                    className="w-12 h-12 rounded-full"
                    style={{ border: "2px solid var(--accent)" }}
                  />
                )}
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {profile.name || "Animesh Pathak"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {profile.bio || "DevRel, OSS Contributor, Writer"}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>
                <span>
                  <span style={{ color: "var(--accent-green)" }}>{profile.public_repos}</span> repos
                </span>
                <span>
                  <span style={{ color: "var(--accent-orange)" }}>{profile.followers}</span> followers
                </span>
                <span>
                  <span style={{ color: "var(--accent)" }}>{profile.following}</span> following
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
