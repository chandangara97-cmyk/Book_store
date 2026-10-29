/**
 * Renders page 1 of a PDF to a small JPEG (data URL) so it can be used as the product cover.
 * pdf.js is loaded from cdnjs only when the admin actually picks a PDF, so the storefront bundle stays small.
 */
const PDFJS_VERSION = '3.11.174';
const BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
let loader: Promise<any> | null = null;

function loadPdfJs(): Promise<any> {
  const w = window as any;
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib);
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `${BASE}/pdf.min.js`;
      s.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (!lib) { reject(new Error('PDF reader failed to load.')); return; }
        lib.GlobalWorkerOptions.workerSrc = `${BASE}/pdf.worker.min.js`;
        resolve(lib);
      };
      s.onerror = () => reject(new Error('Could not load the PDF reader. Check your internet connection.'));
      document.head.appendChild(s);
    }).catch(e => { loader = null; throw e; });
  }
  return loader;
}

export async function pdfFirstPageCover(file: File, width = 480, quality = 0.78): Promise<string> {
  const lib = await loadPdfJs();
  const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  try {
    const page = await pdf.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: width / base.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not draw the cover.');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    try { pdf.destroy?.(); } catch { /* ignore */ }
  }
}
