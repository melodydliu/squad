import { useRef } from "react";
import { cn } from "@/lib/utils";

interface MobilePhotoUploadProps {
  onPhoto: (file: File) => void;
  accept?: string;
  capture?: "environment" | "user";
  multiple?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Wraps any children (button, icon, etc.) so tapping immediately opens
 * the native photo picker on mobile. Uses a hidden file input with
 * accept="image/*" for optimal mobile UX.
 */
const MobilePhotoUpload = ({
  onPhoto,
  accept = "image/*",
  multiple = false,
  children,
  className,
  disabled = false,
}: MobilePhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => onPhoto(file));
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <label className={cn("cursor-pointer", disabled && "opacity-50 pointer-events-none", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      {children}
    </label>
  );
};

export default MobilePhotoUpload;
