import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';

export const OG_SIZE = { width: 1200, height: 630 };

const C = {
  graphite: '#121211',
  graphite2: '#1a1a18',
  ivory: '#edeae4',
  signal: '#ff5a1f',
  muted: '#a8a59e',
  faint: '#8b8984',
  line: '#2a2a27',
};

// Bundled locally (SIL OFL, see src/assets/fonts): nothing is fetched at build time.
const FONTS_DIR = path.join(process.cwd(), 'src/assets/fonts');
let fonts: Promise<[Buffer, Buffer]> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([
    readFile(path.join(FONTS_DIR, 'cormorant-garamond-latin-500-normal.woff')),
    readFile(path.join(FONTS_DIR, 'ibm-plex-mono-latin-500-normal.woff')),
  ]));

/** Reads an image from public/ and returns it as a PNG data URI (satori does not decode WebP). */
async function pngDataUri(publicPath: string, width: number): Promise<string> {
  const buf = await sharp(path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', publicPath)).resize({ width }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

type Card = {
  eyebrow?: string;
  /** Title runs; accent runs are set in signal. */
  title: { text: string; accent?: boolean }[];
  titleSize: number;
  footer: string;
  /** A capture shown in a frame on the right, bleeding off the edge. */
  capture?: string;
  /** A transparent still (the DNA helix) shown on the right without a frame. */
  still?: string;
};

export async function ogCard({ eyebrow, title, titleSize, footer, capture, still }: Card): Promise<ImageResponse> {
  const [[serif, mono], captureUri, stillUri] = await Promise.all([
    loadFonts(),
    capture ? pngDataUri(capture, 720) : undefined,
    still ? pngDataUri(still, 560) : undefined,
  ]);
  const hasVisual = Boolean(captureUri || stillUri);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: C.graphite, fontFamily: 'Cormorant' }}>
        {captureUri && (
          <div style={{ position: 'absolute', left: 660, top: 118, display: 'flex', border: `1px solid ${C.line}`, background: C.graphite2 }}>
            <img src={captureUri} width={720} height={450} style={{ objectFit: 'cover', objectPosition: 'top' }} alt="" />
          </div>
        )}
        {stillUri && (
          <img src={stillUri} width={560} height={700} style={{ position: 'absolute', right: -40, top: -40 }} alt="" />
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: hasVisual ? 600 : 1200,
            height: '100%',
            padding: '64px 0 60px 72px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: C.ivory, fontSize: 40, fontWeight: 500 }}>
            RP
            <div style={{ width: 44, height: 1, background: C.signal }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', paddingRight: 48 }}>
            {eyebrow && (
              <div style={{ fontFamily: 'Plex Mono', fontSize: 18, letterSpacing: 3, textTransform: 'uppercase', color: C.signal, marginBottom: 22 }}>
                {eyebrow}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: titleSize, lineHeight: 1.04, color: C.ivory, letterSpacing: -1 }}>
              {words(title).map((w, i) => (
                <span key={i} style={{ color: w.accent ? C.signal : C.ivory, marginRight: titleSize * 0.24 }}>{w.text}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 40 }}>
              <div style={{ width: 56, height: 1, background: C.signal }} />
              <div style={{ fontFamily: 'Plex Mono', fontSize: 17, color: C.faint }}>{footer}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Cormorant', data: serif, weight: 500, style: 'normal' },
        { name: 'Plex Mono', data: mono, weight: 500, style: 'normal' },
      ],
    },
  );
}

/** Splits runs into words (satori wraps flex items, not inline text); punctuation sticks to the word before. */
function words(runs: { text: string; accent?: boolean }[]) {
  const out: { text: string; accent?: boolean }[] = [];
  for (const run of runs) {
    for (const w of run.text.split(/\s+/).filter(Boolean)) {
      if (/^[,.;:!?]/.test(w) && out.length > 0) out[out.length - 1].text += w;
      else out.push({ text: w, accent: run.accent });
    }
  }
  return out;
}

/** Title size that keeps long project names on two lines at most. */
export function titleSizeFor(text: string, hasVisual: boolean): number {
  const n = text.length;
  if (hasVisual) return n <= 10 ? 104 : n <= 16 ? 84 : 68;
  return n <= 16 ? 128 : n <= 26 ? 104 : 84;
}
