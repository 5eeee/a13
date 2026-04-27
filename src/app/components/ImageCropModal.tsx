import { useState, useCallback, useEffect } from "react";
import { useScrollLock } from "../lib/useScrollLock";
import Cropper, { type Area } from "react-easy-crop";
import { X } from "lucide-react";

type AspectPreset = "free" | "1:1" | "16:9" | "9:16" | "4:3";

const PRESETS: { id: AspectPreset; label: string; value: number | undefined }[] = [
  { id: "free", label: "Свободно", value: undefined },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "16:9", label: "16:9", value: 16 / 9 },
  { id: "9:16", label: "9:16", value: 9 / 16 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
];

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (e) => reject(e));
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas");
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return canvas.toDataURL("image/jpeg", 0.9);
}

type Props = {
  imageSrc: string;
  onClose: () => void;
  onCropped: (dataUrl: string) => void;
};

export function ImageCropModal({ imageSrc, onClose, onCropped }: Props) {
  useScrollLock(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [preset, setPreset] = useState<AspectPreset>("16:9");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const aspect = PRESETS.find((p) => p.id === preset)?.value;

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => {
    setCroppedAreaPixels(areaPx);
  }, []);

  const apply = async () => {
    if (!croppedAreaPixels) return;
    setBusy(true);
    try {
      const out = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropped(out);
      onClose();
    } catch {
      setBusy(false);
    }
    setBusy(false);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Обрезка изображения"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-900">Обрезка фото</span>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500" aria-label="Закрыть">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                preset === p.id ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="relative h-[min(56vh,420px)] bg-gray-900 mx-4 mt-3 rounded-xl overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-4 py-3">
          <label className="text-xs text-gray-500 block mb-1">Масштаб</label>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-blue-700" />
        </div>

        <div className="px-4 pb-4 flex justify-end gap-2 border-t border-gray-100 pt-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm text-gray-600 hover:bg-gray-100">
            Отмена
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={busy || !croppedAreaPixels}
            className="px-5 py-2 rounded-full text-sm bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {busy ? "…" : "Сохранить обрезку"}
          </button>
        </div>
      </div>
    </div>
  );
}
