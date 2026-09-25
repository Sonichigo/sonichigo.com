import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Social card generator, styled to match the site's terminal aesthetic:
 * dark canvas, dashed window chrome, JetBrains Mono / Syne, accent per section.
 *
 * /api/og?title=...&subtitle=...&type=post|talk|travel|default
 */

const WIDTH = 1200;
const HEIGHT = 630;

// Mirrors the `.dark` block in globals.css — keep in sync.
const COLOR = {
  bg: '#0a0a0a',
  surface: '#141414',
  border: '#262626',
  textPrimary: '#f5f5f5',
  textSecondary: '#a3a3a3',
  textTertiary: '#8a8a8a',
  blue: '#3b82f6',
  green: '#10b981',
  orange: '#ff6b35',
  amber: '#fbbf24',
};

type CardType = 'post' | 'talk' | 'travel' | 'default';

/** Per-section accent + window-chrome path + prompt, so each card reads distinctly. */
const VARIANT: Record<CardType, { accent: string; path: string; prompt: string; badge: string | null }> = {
  post: { accent: COLOR.blue, path: '~/posts', prompt: 'cat post.md', badge: 'BLOG POST' },
  talk: { accent: COLOR.orange, path: '~/talks', prompt: 'cat talk.md', badge: 'TALK' },
  travel: { accent: COLOR.green, path: '~/travels', prompt: 'cat travel.md', badge: 'TRAVEL' },
  default: { accent: COLOR.blue, path: '~', prompt: 'whoami', badge: null },
};

/**
 * Fetch a Google font as TTF for Satori (which cannot read woff2). The `text`
 * param subsets the file to just the glyphs this card renders, which keeps the
 * edge fetch small.
 */
async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url =
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}` +
      `&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
    if (!resource) return null;

    const res = await fetch(resource[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    // A missing font is a cosmetic problem — fall back to Satori's default
    // rather than serving no card at all.
    return null;
  }
}

/** Long titles must shrink, or they overflow the card instead of wrapping into it. */
function titleSize(title: string): number {
  if (title.length <= 32) return 76;
  if (title.length <= 60) return 60;
  if (title.length <= 95) return 48;
  return 40;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = truncate(searchParams.get('title') || 'Animesh Pathak', 120);
    const subtitle = truncate(
      searchParams.get('subtitle') || 'DevRel, OSS Contributor & Cloud Native',
      140
    );
    const rawType = (searchParams.get('type') || 'default') as CardType;
    const variant = VARIANT[rawType] ?? VARIANT.default;

    // Optional `tags=a,b,c`. Capped at 4 so the row can't wrap out of the card.
    const tags = (searchParams.get('tags') || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 4)
      .map((t) => truncate(t, 24));

    const site = 'sonichigo.com';
    const promptLine = `${variant.path} $ ${variant.prompt}`;

    // Subset each font to only the glyphs it actually draws.
    const [syne, mono] = await Promise.all([
      loadGoogleFont('Syne', 700, title),
      loadGoogleFont(
        'JetBrains Mono',
        400,
        `${subtitle}${promptLine}${site}${variant.badge ?? ''}${tags.join('')}▌·`
      ),
    ]);

    const fonts = [
      syne && { name: 'Syne', data: syne, weight: 700 as const, style: 'normal' as const },
      mono && { name: 'JetBrains Mono', data: mono, weight: 400 as const, style: 'normal' as const },
    ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 700 | 400; style: 'normal' }[];

    const headingFont = syne ? 'Syne' : 'sans-serif';
    const monoFont = mono ? 'JetBrains Mono' : 'monospace';

    return new ImageResponse(
      (
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'flex',
            backgroundColor: COLOR.bg,
            fontFamily: monoFont,
          }}
        >
          {/* Faint 48px grid — the same graph-paper texture the site uses behind content. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(to right, #ffffff0a 1px, transparent 1px), linear-gradient(to bottom, #ffffff0a 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />

          {/* Accent bloom, bled off the top-right corner. */}
          <div
            style={{
              position: 'absolute',
              top: -260,
              right: -200,
              width: 720,
              height: 720,
              borderRadius: 9999,
              background: `radial-gradient(circle, ${variant.accent}2e 0%, ${variant.accent}00 70%)`,
            }}
          />

          {/* Terminal window */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              margin: 44,
              flex: 1,
              borderRadius: 14,
              border: `1px dashed ${COLOR.border}`,
              backgroundColor: COLOR.surface,
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 56,
                paddingLeft: 24,
                paddingRight: 24,
                borderBottom: `1px dashed ${COLOR.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[COLOR.orange, COLOR.amber, COLOR.green].map((dot) => (
                  <div
                    key={dot}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 9999,
                      backgroundColor: dot,
                      marginRight: 9,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  justifyContent: 'center',
                  fontSize: 17,
                  color: COLOR.textTertiary,
                }}
              >
                {`animesh@sonichigo: ${variant.path}`}
              </div>
              {/* Balances the traffic lights so the path stays optically centred. */}
              <div style={{ display: 'flex', width: 63 }} />
            </div>

            {/* Body */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                paddingTop: 44,
                paddingBottom: 40,
                paddingLeft: 52,
                paddingRight: 52,
              }}
            >
              {/* flex:1 + centring keeps short titles from leaving a void above the footer. */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: 21,
                    color: variant.accent,
                    marginBottom: 22,
                  }}
                >
                  {promptLine}
                </div>

                <div
                  style={{
                    display: 'flex',
                    fontFamily: headingFont,
                    fontWeight: 700,
                    fontSize: titleSize(title),
                    lineHeight: 1.12,
                    letterSpacing: '-0.02em',
                    color: COLOR.textPrimary,
                    marginBottom: 20,
                  }}
                >
                  {title}
                </div>

                <div
                  style={{
                    display: 'flex',
                    fontSize: 22,
                    lineHeight: 1.5,
                    color: COLOR.textSecondary,
                  }}
                >
                  {subtitle}
                </div>

                {tags.length > 0 && (
                  <div style={{ display: 'flex', marginTop: 28 }}>
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        style={{
                          display: 'flex',
                          fontSize: 17,
                          color: COLOR.textTertiary,
                          border: `1px dashed ${COLOR.border}`,
                          borderRadius: 8,
                          paddingTop: 6,
                          paddingBottom: 6,
                          paddingLeft: 14,
                          paddingRight: 14,
                          marginRight: 10,
                        }}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer: site name with a cursor block, plus the section badge. */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 24 }}>
                  <span style={{ color: COLOR.textPrimary }}>{site}</span>
                  <span style={{ color: variant.accent, marginLeft: 4 }}>▌</span>
                </div>

                {variant.badge && (
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 16,
                      letterSpacing: '0.12em',
                      color: variant.accent,
                      border: `1px solid ${variant.accent}66`,
                      backgroundColor: `${variant.accent}1f`,
                      borderRadius: 9999,
                      paddingTop: 7,
                      paddingBottom: 7,
                      paddingLeft: 18,
                      paddingRight: 18,
                    }}
                  >
                    {variant.badge}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        fonts: fonts.length ? fonts : undefined,
      }
    );
  } catch (e) {
    console.error('Error generating OG image:', e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
