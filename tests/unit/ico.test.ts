import { describe, expect, it } from 'vitest';
import { pngsToIco } from '../../scripts/ico.mjs';

const fakePng = (n: number) => Uint8Array.from({ length: n }, (_, i) => i % 256);

describe('pngsToIco', () => {
  it('writes a valid ICONDIR header and one entry per image', () => {
    const a = fakePng(10);
    const b = fakePng(20);
    const ico = pngsToIco([{ size: 16, png: a }, { size: 32, png: b }]);
    const view = new DataView(ico.buffer, ico.byteOffset, ico.byteLength);
    expect(view.getUint16(0, true)).toBe(0); // reserved
    expect(view.getUint16(2, true)).toBe(1); // type = icon
    expect(view.getUint16(4, true)).toBe(2); // count
    // entry 1
    expect(ico[6]).toBe(16);
    expect(ico[7]).toBe(16);
    expect(view.getUint32(6 + 8, true)).toBe(10); // byte size
    expect(view.getUint32(6 + 12, true)).toBe(6 + 16 * 2); // offset
    // entry 2
    expect(ico[22]).toBe(32);
    expect(view.getUint32(22 + 12, true)).toBe(6 + 32 + 10);
    expect(ico.byteLength).toBe(6 + 32 + 10 + 20);
  });

  it('encodes 256 px as 0 per the ICO format', () => {
    const ico = pngsToIco([{ size: 256, png: fakePng(4) }]);
    expect(ico[6]).toBe(0);
    expect(ico[7]).toBe(0);
  });
});
