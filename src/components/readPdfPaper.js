// Render the reusable first page locally. The template never leaves the browser.
export async function readPdfPaper(file) {
  const base = new URL(import.meta.env.BASE_URL + "pdfjs/", document.baseURI).href;
  const { getDocument, GlobalWorkerOptions } = await import(/* @vite-ignore */ base + "pdf.min.mjs");
  GlobalWorkerOptions.workerSrc = base + "pdf.worker.min.mjs";
  const task = getDocument({
    data: await file.arrayBuffer(), isEvalSupported: false,
    cMapUrl: base + "cmaps/", cMapPacked: true,
    standardFontDataUrl: base + "standard_fonts/", wasmUrl: base + "wasm/",
  });
  try {
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const size = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 1800 / Math.max(size.width, size.height) });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.92);
  } finally {
    await task.destroy();
  }
}
