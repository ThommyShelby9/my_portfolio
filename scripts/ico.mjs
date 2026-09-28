/**
 * Encodes a set of PNG images into a single Windows ICO buffer.
 *
 * @param {{ size: number; png: Uint8Array }[]} images
 * @returns {Uint8Array}
 */
export function pngsToIco(images) {
  const headerSize = 6 + 16 * images.length;
  const total = headerSize + images.reduce((sum, i) => sum + i.png.byteLength, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, images.length, true);
  let offset = headerSize;
  images.forEach((img, index) => {
    const entry = 6 + 16 * index;
    out[entry] = img.size >= 256 ? 0 : img.size;
    out[entry + 1] = img.size >= 256 ? 0 : img.size;
    out[entry + 2] = 0; // palette
    out[entry + 3] = 0; // reserved
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, img.png.byteLength, true);
    view.setUint32(entry + 12, offset, true);
    out.set(img.png, offset);
    offset += img.png.byteLength;
  });
  return out;
}
