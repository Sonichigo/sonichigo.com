import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Animesh Pathak';
    const subtitle = searchParams.get('subtitle') || 'DevRel, OSS Contributor & Writer';
    const type = searchParams.get('type') || 'default';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '60px',
              width: '100%',
              height: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: type === 'post' ? '56px' : '72px',
                  fontWeight: 800,
                  color: '#1a202c',
                  lineHeight: 1.2,
                  marginBottom: '20px',
                  display: 'flex',
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: '28px',
                  color: '#4a5568',
                  lineHeight: 1.4,
                  display: 'flex',
                }}
              >
                {subtitle}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  color: '#667eea',
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                sonichigo.com
              </div>
              {type === 'post' && (
                <div
                  style={{
                    fontSize: '24px',
                    color: '#718096',
                    display: 'flex',
                  }}
                >
                  📝 Blog Post
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('Error generating OG image:', e);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
