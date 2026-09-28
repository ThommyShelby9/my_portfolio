// Generates the favicon set in public/ from src/assets/brand/favicon.svg.
import { readFile, writeFile, copyFile } from 'node:fs/promises';
import sharp from 'sharp';
import { pngsToIco } from './ico.mjs';

const SRC = 'src/assets/brand/favicon.svg';
const svg = await readFile(SRC);

const png = (size, { pad = 0 } = {}) =>
  sharp(svg, { density: 384 })
    .resize(size - pad * 2, size - pad * 2)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: '#0e0d0c' })
    .png()
    .toBuffer();

await copyFile(SRC, 'public/favicon.svg');
const ico = pngsToIco(
  await Promise.all([16, 32, 48].map(async (size) => ({ size, png: new Uint8Array(await png(size)) }))),
);
await writeFile('public/favicon.ico', ico);
await writeFile('public/apple-touch-icon.png', await png(180));
await writeFile('public/icon-192.png', await png(192));
await writeFile('public/icon-512.png', await png(512));
await writeFile('public/icon-maskable-512.png', await png(512, { pad: 64 }));
console.log('favicons written to public/');
