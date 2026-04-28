/** Сжатие загрузок в админке: по возможности WebP (меньше JSON/БД и быстрее сайт). */

const DEFAULT_MAX_EDGE = 2560;
const WEBP_QUALITY = 0.82;
const JPEG_FALLBACK_QUALITY = 0.88;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}

/** Canvas → data URL (WebP, иначе JPEG, иначе PNG через toDataURL). */
export async function canvasToStorageDataUrl(canvas: HTMLCanvasElement, quality = WEBP_QUALITY): Promise<string> {
  const webp = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
  if (webp) return blobToDataUrl(webp);
  const jpeg = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", JPEG_FALLBACK_QUALITY));
  if (jpeg) return blobToDataUrl(jpeg);
  return canvas.toDataURL("image/png");
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/**
 * Растровый файл → WebP data URL (с ограничением длинной стороны).
 * Не подходит для SVG/ошибок декодирования — тогда пусть вызывающий сделает fallback.
 */
export async function fileToWebpDataUrl(
  file: File,
  options?: { maxEdge?: number; quality?: number }
): Promise<string> {
  const maxEdge = options?.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = options?.quality ?? WEBP_QUALITY;
  if (!file.type.startsWith("image/")) {
    throw new Error("Не изображение");
  }
  const bitmap = await createImageBitmap(file);
  try {
    let w = bitmap.width;
    let h = bitmap.height;
    const scale = Math.min(1, maxEdge / Math.max(w, h, 1));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));
    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas");
    ctx.drawImage(bitmap, 0, 0, tw, th);
    return await canvasToStorageDataUrl(canvas, quality);
  } finally {
    bitmap.close();
  }
}

/** Загрузка для CMS: WebP при успехе, иначе исходный data URL. SVG и GIF оставляем как есть. */
export async function encodeRasterImageForStorage(file: File): Promise<string> {
  const t = file.type.toLowerCase();
  if (t === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
    return readFileAsDataUrl(file);
  }
  if (t === "image/gif") {
    return readFileAsDataUrl(file);
  }
  try {
    return await fileToWebpDataUrl(file);
  } catch {
    return readFileAsDataUrl(file);
  }
}
