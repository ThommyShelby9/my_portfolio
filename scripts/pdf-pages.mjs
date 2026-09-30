// Page count of a PDF written by Chromium: one `/Type /Page` object per page (`/Type /Pages` is the tree root).
export function countPdfPages(bytes) {
  return (Buffer.from(bytes).toString('latin1').match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? []).length;
}
