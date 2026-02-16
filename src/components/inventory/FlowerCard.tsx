import { useState, useEffect } from "react";
import { FlowerInventoryRow, InventoryItemStatus, mockFreelancers } from "@/data/mockData";
import { Camera, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import PhotoModal from "./PhotoModal";
import { cn } from "@/lib/utils";

export type InventoryFilter = "all" | "approved" | "flagged";

interface FlowerCardListProps {
  rows: FlowerInventoryRow[];
  role: "admin" | "freelancer";
  filter?: InventoryFilter;
}

const FlowerCardList = ({ rows, role, filter = "all" }: FlowerCardListProps) => {
  const [photoModal, setPhotoModal] = useState<{ open: boolean; rowId: string }>({ open: false, rowId: "" });
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const filtered = rows.filter((r) => {
    if (filter === "approved") return r.status === "approved";
    if (filter === "flagged") return r.status === "flagged";
    return true;
  });

  const activeRow = rows.find((r) => r.id === photoModal.rowId);

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Auto-expand notes when item is flagged
  const handleStatusChange = (rowId: string, newStatus: InventoryItemStatus) => {
    if (newStatus === "flagged") {
      setExpandedNotes((prev) => new Set(prev).add(rowId));
    }
  };

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {filter === "all" ? "No flower inventory data" : `No ${filter} items`}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {filtered.map((row) => (
          <FlowerItemCard
            key={row.id}
            row={row}
            role={role}
            notesExpanded={expandedNotes.has(row.id)}
            onToggleNotes={() => toggleNotes(row.id)}
            onOpenPhoto={() => setPhotoModal({ open: true, rowId: row.id })}
            onStatusChange={(s) => handleStatusChange(row.id, s)}
          />
        ))}
      </div>

      <PhotoModal
        open={photoModal.open}
        onClose={() => setPhotoModal({ open: false, rowId: "" })}
        photoUrl={activeRow?.photoUrl}
        readOnly={role === "admin"}
        onUpload={() => {}}
        onRemove={() => {}}
      />
    </>
  );
};

const FlowerItemCard = ({
  row,
  role,
  notesExpanded,
  onToggleNotes,
  onOpenPhoto,
  onStatusChange,
}: {
  row: FlowerInventoryRow;
  role: "admin" | "freelancer";
  notesExpanded: boolean;
  onToggleNotes: () => void;
  onOpenPhoto: () => void;
  onStatusChange: (s: InventoryItemStatus) => void;
}) => {
  const updatedByName = row.updatedBy
    ? mockFreelancers.find((f) => f.id === row.updatedBy)?.name
    : undefined;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        row.status === "approved"
          ? "border-success/30 bg-success/5"
          : row.status === "flagged"
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card"
      )}
    >
      {/* Top row: name + photo */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{row.flower}</span>
            <span className="text-xs text-muted-foreground">· {row.color}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>Recipe: <span className="text-foreground font-medium">{row.stemsInRecipe}</span></span>
            <span>Ordered: <span className="text-foreground font-medium">{row.totalOrdered}</span></span>
            <span>Extra: <span className="text-foreground font-medium">{row.extras}</span></span>
          </div>
        </div>

        <button
          onClick={onOpenPhoto}
          className={cn(
            "p-2 rounded-lg transition-colors flex-shrink-0",
            row.photoUrl
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Status toggle */}
      <div className="flex gap-1.5 mt-2.5">
        <StatusButton
          active={row.status === "approved"}
          variant="approved"
          onClick={() => onStatusChange("approved")}
          disabled={role === "admin"}
        />
        <StatusButton
          active={row.status === "flagged"}
          variant="flagged"
          onClick={() => onStatusChange("flagged")}
          disabled={role === "admin"}
        />
      </div>

      {/* Flagged prompt */}
      {row.status === "flagged" && !row.qualityNotes && !notesExpanded && (
        <button
          onClick={onToggleNotes}
          className="flex items-center gap-1.5 mt-2 text-xs text-destructive/80 hover:text-destructive transition-colors"
        >
          <AlertCircle className="w-3 h-3" />
          Please add details or a photo to explain the issue.
        </button>
      )}

      {/* Quality notes display */}
      {row.qualityNotes && !notesExpanded && (
        <div className="flex items-center gap-1.5 mt-2">
          <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
          <span className="text-xs text-destructive">{row.qualityNotes}</span>
        </div>
      )}

      {/* Notes toggle */}
      {role === "freelancer" && (
        <button
          onClick={onToggleNotes}
          className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {notesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {row.qualityNotes ? "Edit note" : "Add note"}
        </button>
      )}
      {notesExpanded && role === "freelancer" && (
        <textarea
          defaultValue={row.qualityNotes || ""}
          placeholder="Describe the issue…"
          className="mt-2 w-full text-xs rounded-md border border-input bg-background px-2.5 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          rows={2}
        />
      )}

      {/* Admin metadata */}
      {role === "admin" && (updatedByName || row.updatedAt) && (
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          {updatedByName && <span>by {updatedByName}</span>}
          {row.updatedAt && (
            <span>· {new Date(row.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
          )}
        </div>
      )}
    </div>
  );
};

const StatusButton = ({
  active,
  variant,
  onClick,
  disabled,
}: {
  active: boolean;
  variant: "approved" | "flagged";
  onClick: () => void;
  disabled: boolean;
}) => {
  const isApproved = variant === "approved";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
        active
          ? isApproved
            ? "bg-success/15 text-success border border-success/30"
            : "bg-destructive/15 text-destructive border border-destructive/30"
          : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted",
        disabled && "opacity-70 cursor-default"
      )}
    >
      {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
      {isApproved ? "Approved" : "Flagged"}
    </button>
  );
};

export default FlowerCardList;
