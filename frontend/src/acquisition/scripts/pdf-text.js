/**
 * Pure heuristic: does extracted PDF text look empty/garbage (scanned PDF,
 * no text layer)? No I/O, no pdf.js — testable in Node without a browser.
 *
 * Threshold is deliberately generous: a real article's first page alone is
 * thousands of characters. Anything under it is noise (stray glyphs, OCR
 * artifacts pdf.js sometimes emits for image-only pages) or nothing at all.
 */
function isPdfTextEmpty(text) {
  return !text || text.trim().length < 50;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isPdfTextEmpty };
}
