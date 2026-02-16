import { useState } from "react";
import { HardGoodInventoryRow } from "@/data/mockData";
import { Camera, CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import PhotoModal from "./PhotoModal";
import { cn } from "@/lib/utils";

interface HardGoodCardListProps {
  rows: HardGoodInventoryRow[];
  role: "admin" | "freelancer";
  filter?: "all" | "not_received" | "issues" | "received";
}

const HardGoodCardList = ({ rows, role, filter = "all" }: HardGoodCardListProps) => {
  const [photoModal, setPhotoModal] = useState<{ open: boolean; rowId: string }>({ open: false, rowId: "" });
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const filtered = rows.filter((r) => {
    if (filter === "not_received") return !r.received;
    if (filter === "issues") return !!r.notes;
    if (filter === "received") return r.received;
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

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {filter === "all" ? "No hard goods inventory data" : `No ${filter.replace("_", " ")} items`}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {filtered.map((row) => (
          <div
            key={row.id}
            className={cn(
              "rounded-lg border p-3 transition-colors",
              row.received
                ? "border-success/30 bg-success/5"
                : row.notes
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-card"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">{row.item}</span>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Qty: <span className="text-foreground font-medium">{row.quantity}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setPhotoModal({ open: true, rowId: row.id })}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    row.photoUrl
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Camera className="w-4 h-4" />
                </button>

                {role === "freelancer" ? (
                  <button className={cn(
                    "p-2 rounded-lg transition-colors",
                    row.received ? "text-success bg-success/10" : "text-muted-foreground hover:bg-muted"
                  )}>
                    {row.received ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                ) : (
                  row.received
                    ? <CheckCircle2 className="w-5 h-5 text-success" />
                    : <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {row.notes && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
                <span className="text-xs text-warning">{row.notes}</span>
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
                placeholder="Add notes..."
                className="mt-2 w-full text-xs rounded-md border border-input bg-background px-2.5 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                rows={2}
              />
            )}
          </div>
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

export default HardGoodCardList;
