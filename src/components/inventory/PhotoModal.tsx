import { X, Camera, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import MobilePhotoUpload from "@/components/MobilePhotoUpload";

interface PhotoModalProps {
  open: boolean;
  onClose: () => void;
  photoUrl?: string;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  readOnly?: boolean;
}

const PhotoModal = ({ open, onClose, photoUrl, onUpload, onRemove, readOnly }: PhotoModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-elevated w-[90vw] max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Photo</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {photoUrl ? (
            <div className="rounded-lg overflow-hidden">
              <img src={photoUrl} alt="Inventory item" className="w-full h-auto max-h-[50vh] object-contain bg-muted" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Camera className="w-8 h-8 mb-2" />
              <p className="text-sm">No photo uploaded</p>
            </div>
          )}

          {!readOnly && (
            <div className="flex gap-2">
              <MobilePhotoUpload onPhoto={(file) => onUpload?.(file)} className="flex-1">
                <div className="py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  {photoUrl ? "Replace" : "Upload"}
                </div>
              </MobilePhotoUpload>
              {photoUrl && onRemove && (
                <button
                  onClick={onRemove}
                  className="py-2.5 px-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
