import { useState } from "react";
import { HardGoodInventoryRow, InventoryItemStatus, mockFreelancers } from "@/data/mockData";
import { Camera, CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import PhotoModal from "./PhotoModal";
import { cn } from "@/lib/utils";
import type { InventoryFilter } from "./FlowerCard";

interface HardGoodCardListProps {
  rows: HardGoodInventoryRow[];
  role: "admin" | "freelancer";
  filter?: InventoryFilter;
}

const HardGoodCardList = ({ rows, role, filter = "all" }: HardGoodCardListProps) => {
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

  const handleStatusChange = (rowId: string, newStatus: InventoryItemStatus) => {
    if (newStatus === "flagged") {
      setExpandedNotes((prev) => new Set(prev).add(rowId));
    }
  };

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {filter === "all" ? "No hard goods inventory data" : `No ${filter} items`}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {filtered.map((row) => {
          const updatedByName = row.updatedBy
            ? mockFreelancers.find((f) => f.id === row.updatedBy)?.name
            : undefined;

          return (
            <div className="rounded-lg border border-border bg-card p-3 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{row.item}</span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Qty: <span className="text-foreground font-medium">{row.quantity}</span>
                  </div>
                </div>

                <button
                  onClick={() => setPhotoModal({ open: true, rowId: row.id })}
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
                  onClick={() => handleStatusChange(row.id, "approved")}
                  disabled={role === "admin"}
                  role={role}
                />
                <StatusButton
                  active={row.status === "flagged"}
                  variant="flagged"
                  onClick={() => handleStatusChange(row.id, "flagged")}
                  disabled={role === "admin"}
                />
              </div>

              {/* Flagged prompt */}
              {row.status === "flagged" && !row.notes && !expandedNotes.has(row.id) && (
                <button
                  onClick={() => toggleNotes(row.id)}
                  className="flex items-center gap-1.5 mt-2 text-xs text-warning hover:text-warning/80 transition-colors"
                >
                  <AlertCircle className="w-3 h-3" />
                  Please add details or a photo to explain the issue.
                </button>
              )}

              {row.notes && !expandedNotes.has(row.id) && (
                <div className="flex items-center gap-1.5 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{row.notes}</span>
                </div>
              )}

              {role === "freelancer" && (
                <button
                  onClick={() => toggleNotes(row.id)}
                  className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedNotes.has(row.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {row.notes ? "Edit note" : "Add note"}
                </button>
              )}
              {expandedNotes.has(row.id) && role === "freelancer" && (
                <textarea
                  defaultValue={row.notes || ""}
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
        })}
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

const StatusButton = ({
  active,
  variant,
  onClick,
  disabled,
  role,
}: {
  active: boolean;
  variant: "approved" | "flagged";
  onClick: () => void;
  disabled: boolean;
  role?: "admin" | "freelancer";
}) => {
  const isApproved = variant === "approved";
  const label = isApproved ? (role === "freelancer" ? "Confirmed" : "Approved") : "Flagged";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
        active
          ? isApproved
            ? "bg-success/15 text-success border border-success/40"
            : "bg-warning/15 text-warning border border-warning/40"
          : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted",
      )}
    >
      {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
};

export default HardGoodCardList;
