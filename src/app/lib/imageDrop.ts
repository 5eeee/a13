/** Извлечение файлов изображений из drag-and-drop (проводник, браузер, ссылка). */

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|bmp|avif|svg)$/i;

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return IMAGE_EXT.test(file.name);
}

function urlsFromDataTransfer(dt: DataTransfer): string[] {
  const urls: string[] = [];
  const uriList = dt.getData("text/uri-list") || dt.getData("text/plain");
  if (uriList) {
    for (const line of uriList.split(/\r?\n/)) {
      const u = line.trim();
      if (u && /^https?:\/\//i.test(u) && !urls.includes(u)) urls.push(u);
    }
  }
  const html = dt.getData("text/html");
  if (html) {
    const re = /<img[^>]+src=["']([^"']+)["']/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      const u = m[1].trim();
      if (u && !urls.includes(u)) urls.push(u);
    }
  }
  return urls;
}

async function urlToImageFile(url: string): Promise<File | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const type = blob.type.startsWith("image/") ? blob.type : "image/jpeg";
    const base = url.split("/").pop()?.split("?")[0] || "image.jpg";
    const name = IMAGE_EXT.test(base) ? base : `${base.replace(/\.\w+$/, "") || "image"}.jpg`;
    return new File([blob], name, { type });
  } catch {
    return null;
  }
}

/** Файлы с диска, из браузера (если отдаёт file) или по URL картинки с сайта. */
export async function collectImageFilesFromDrop(dt: DataTransfer): Promise<File[]> {
  const out: File[] = [];

  if (dt.files?.length) {
    for (let i = 0; i < dt.files.length; i++) {
      const f = dt.files[i];
      if (isImageFile(f)) out.push(f);
    }
  }

  if (!out.length) {
    for (const item of dt.items) {
      if (item.kind === "file") {
        const f = item.getAsFile();
        if (f && isImageFile(f)) out.push(f);
      }
    }
  }

  if (!out.length) {
    const urls = urlsFromDataTransfer(dt);
    for (const url of urls.slice(0, 12)) {
      const file = await urlToImageFile(url);
      if (file) out.push(file);
    }
  }

  return out;
}
