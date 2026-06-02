import { useCallback, useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { collectImageFilesFromDrop } from "../../lib/imageDrop";
import { toast } from "sonner";

type Props = {
  onFiles: (files: File[]) => void | Promise<void>;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  /** Компактная плитка «+» в галерее */
  variant?: "tile" | "panel" | "inline";
  children?: ReactNode;
  accept?: string;
};

export function AdminImageDropZone({
  onFiles,
  multiple = false,
  disabled = false,
  className = "",
  variant = "panel",
  children,
  accept = "image/*",
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const processFiles = useCallback(
    async (files: File[]) => {
      if (!files.length || disabled) return;
      const list = multiple ? files : files.slice(0, 1);
      setBusy(true);
      try {
        await onFiles(list);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Не удалось загрузить фото");
      } finally {
        setBusy(false);
        setDragOver(false);
      }
    },
    [disabled, multiple, onFiles]
  );

  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (disabled || busy) return;

    const fromDt = await collectImageFilesFromDrop(e.dataTransfer);
    if (fromDt.length) {
      await processFiles(fromDt);
      return;
    }
    toast.error(
      "Не удалось получить изображение. Сохраните файл на компьютер или перетащите с рабочего стола."
    );
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !busy) setDragOver(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOver(false);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    void processFiles(list);
  };

  const baseDrop =
    "relative transition-colors outline-none " +
    (dragOver ? "ring-2 ring-blue-500 ring-offset-2 bg-blue-50/80 " : "") +
    (disabled ? "opacity-50 pointer-events-none " : "");

  const tileCls =
    "w-28 h-22 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-blue-700 hover:border-blue-300 " +
    (dragOver ? "border-blue-500 text-blue-700 bg-blue-50" : "border-gray-300");

  const panelCls =
    "rounded-xl border-2 border-dashed p-3 min-h-[5.5rem] flex flex-col items-center justify-center text-center cursor-pointer " +
    (dragOver ? "border-blue-500 bg-blue-50/90 text-blue-800" : "border-gray-300 bg-white/60 text-gray-500 hover:border-blue-300 hover:bg-blue-50/40");

  const inlineCls =
    "inline-block cursor-pointer rounded-full " + (dragOver ? "ring-2 ring-blue-500 ring-offset-1" : "");

  const variantCls =
    variant === "tile" ? tileCls : variant === "panel" ? panelCls : variant === "inline" ? inlineCls : panelCls;

  return (
    <div
      className={`${baseDrop} ${variantCls} ${className}`}
      onDrop={(e) => void onDrop(e)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => !disabled && !busy && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Загрузить изображение перетаскиванием или выбором файла"
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        disabled={disabled || busy}
        onChange={onInputChange}
      />

      {busy ? (
        <span className="flex items-center gap-2 text-xs text-blue-700">
          <Loader2 size={18} className="animate-spin" />
          Загрузка…
        </span>
      ) : children ? (
        children
      ) : variant === "tile" ? (
        <>
          <ImagePlus size={18} />
          <span className="text-[10px] mt-0.5 leading-tight px-1">
            {dragOver ? "Отпустите" : "Перетащите"}
          </span>
        </>
      ) : (
        <span className="text-xs leading-snug px-2">
          {dragOver ? (
            <strong>Отпустите файл</strong>
          ) : (
            <>
              <strong>Перетащите фото</strong> сюда
              <br />
              <span className="text-gray-400">с компьютера или из браузера · или нажмите для выбора</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}
