"use client";

import { useState } from "react";
import { FlowerInventoryRow, InventoryItemStatus } from "@/data/mockData";
import { Camera, CheckCircle2, AlertTriangle, AlertCircle, Pencil } from "lucide-react";
import PhotoModal from "./PhotoModal";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type InventoryFilter = "all" | "approved" | "flagged";

interface FlowerCardListProps {
  rows: FlowerInventoryRow[];
  role: "admin" | "freelancer";
  filter?: InventoryFilter;
  onUpdateRow?: (rowId: string, updates: Partial<FlowerInventoryRow>) => void;
  projectId: string;
  profiles?: Map<string, { firstName: string; lastName: string }>;
}

const FlowerCardList = ({ rows, role, filter = "all", onUpdateRow, projectId, profiles }: FlowerCardListProps) => {
  const { user } = useAuth();
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
  const handleStatusChange = (rowId: string, newStatus: InventoryItemStatus | null) => {
    if (newStatus === "flagged") {
      setExpandedNotes((prev) => new Set(prev).add(rowId));
    }
  };

  const handlePhotoUpload = async (file: File, rowId: string) => {
    if (!user) return;
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/inventory/${projectId}/${rowId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("project-photos")
        .upload(path, file);

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from("project-photos")
        .getPublicUrl(path);

      const { error } = await supabase
        .from("flower_inventory")
        .update({ photo_url: publicUrl })
        .eq("id", rowId);

      if (error) throw error;

      onUpdateRow?.(rowId, { photoUrl: publicUrl });
      toast.success("Photo uploaded");
    } catch (err) {
      console.error("Error uploading photo:", err);
      toast.error("Failed to upload photo");
    }
  };

  const handlePhotoRemove = async (rowId: string) => {
    try {
      const { error } = await supabase
        .from("flower_inventory")
        .update({ photo_url: null })
        .eq("id", rowId);

      if (error) throw error;

      onUpdateRow?.(rowId, { photoUrl: undefined });
      setPhotoModal({ open: false, rowId: "" });
      toast.success("Photo removed");
    } catch (err) {
      console.error("Error removing photo:", err);
      toast.error("Failed to remove photo");
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
            profiles={profiles}
            notesExpanded={expandedNotes.has(row.id)}
            onToggleNotes={() => toggleNotes(row.id)}
            onOpenPhoto={() => setPhotoModal({ open: true, rowId: row.id })}
            onStatusChange={(s) => handleStatusChange(row.id, s)}
            onUpdateRow={onUpdateRow}
          />
        ))}
      </div>

      <PhotoModal
        open={photoModal.open}
        onClose={() => setPhotoModal({ open: false, rowId: "" })}
        photoUrl={activeRow?.photoUrl}
        readOnly={role === "admin"}
        onUpload={(file) => handlePhotoUpload(file, photoModal.rowId)}
        onRemove={() => handlePhotoRemove(photoModal.rowId)}
      />
    </>
  );
};

const FlowerItemCard = ({
  row,
  role,
  profiles,
  notesExpanded,
  onToggleNotes,
  onOpenPhoto,
  onStatusChange,
  onUpdateRow,
}: {
  row: FlowerInventoryRow;
  role: "admin" | "freelancer";
  profiles?: Map<string, { firstName: string; lastName: string }>;
  notesExpanded: boolean;
  onToggleNotes: () => void;
  onOpenPhoto: () => void;
  onStatusChange: (s: InventoryItemStatus | null) => void;
  onUpdateRow?: (rowId: string, updates: Partial<FlowerInventoryRow>) => void;
}) => {
  const { user } = useAuth();
  const [noteValue, setNoteValue] = useState(row.qualityNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);

  const updatedByProfile = row.updatedBy ? profiles?.get(row.updatedBy) : undefined;
  const updatedByName = updatedByProfile
    ? `${updatedByProfile.firstName} ${updatedByProfile.lastName}`
    : undefined;

  const handleConfirm = async () => {
    if (role === "admin" || !user) return;

    // If already confirmed, deselect back to neutral
    if (row.status === "approved") {
      try {
        const updates = {
          status: undefined,
          updatedBy: user.id,
          updatedAt: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("flower_inventory")
          .update({
            status: null,
            updated_by: user.id,
            updated_at: updates.updatedAt,
          })
          .eq("id", row.id);

        if (error) throw error;

        onUpdateRow?.(row.id, updates);
        onStatusChange(null);
        toast.success("Deselected");
      } catch (error) {
        console.error("Error deselecting item:", error);
        toast.error("Failed to deselect");
      }
      return;
    }

    // Otherwise, confirm the item
    try {
      const now = new Date().toISOString();
      const updates = {
        status: "approved" as InventoryItemStatus,
        qualityNotes: undefined,
        updatedBy: user.id,
        updatedAt: now,
      };

      const { error } = await supabase
        .from("flower_inventory")
        .update({
          status: "approved",
          quality_notes: null,
          updated_by: user.id,
          updated_at: now,
        })
        .eq("id", row.id);

      if (error) throw error;

      onUpdateRow?.(row.id, updates);
      onStatusChange("approved");

      // Show visual feedback
      setJustConfirmed(true);
      setTimeout(() => setJustConfirmed(false), 1200);

      toast.success("Confirmed");
    } catch (error) {
      console.error("Error confirming item:", error);
      toast.error("Failed to confirm");
    }
  };

  const handleFlag = () => {
    if (role === "admin") return;

    // If already flagged, deselect back to neutral
    if (row.status === "flagged") {
      handleClearFlag();
      return;
    }

    // Toggle notes panel — close if already open, open if closed
    if (notesExpanded) {
      setNoteValue(row.qualityNotes || ""); // reset to saved value
      onToggleNotes(); // close
    } else {
      onToggleNotes(); // open
    }
  };

  const handleClearFlag = async () => {
    if (role === "admin" || !user) return;

    try {
      const now = new Date().toISOString();
      const updates = {
        status: undefined,
        qualityNotes: undefined,
        updatedBy: user.id,
        updatedAt: now,
      };

      const { error } = await supabase
        .from("flower_inventory")
        .update({
          status: null,
          quality_notes: null,
          updated_by: user.id,
          updated_at: now,
        })
        .eq("id", row.id);

      if (error) throw error;

      onUpdateRow?.(row.id, updates);
      onStatusChange(null);
      setNoteValue("");
      if (notesExpanded) onToggleNotes();
      toast.success("Flag removed");
    } catch (error) {
      console.error("Error clearing flag:", error);
      toast.error("Failed to clear flag");
    }
  };

  const handleNoteSave = async () => {
    if (role === "admin" || !user) return;

    // Require note when flagging
    if (!noteValue.trim()) {
      toast.error("Please add a note describing the issue");
      return;
    }

    setIsSaving(true);

    try {
      const now = new Date().toISOString();
      const updates = {
        status: "flagged" as InventoryItemStatus,
        qualityNotes: noteValue.trim(),
        updatedBy: user.id,
        updatedAt: now,
      };

      const { error } = await supabase
        .from("flower_inventory")
        .update({
          status: "flagged",
          quality_notes: noteValue.trim(),
          updated_by: user.id,
          updated_at: now,
        })
        .eq("id", row.id);

      if (error) throw error;

      onUpdateRow?.(row.id, updates);
      onStatusChange("flagged");
      toast.success(row.status === "flagged" ? "Note updated" : "Item flagged");
      onToggleNotes();
    } catch (error) {
      console.error("Error flagging item:", error);
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const isFlagged = row.status === "flagged";
  const panelLabel = isFlagged ? "Edit issue" : "Describe the issue";
  const saveLabel = isFlagged ? "Submit" : "Submit";

  return (
    <div className={cn(
      "rounded-lg border p-3 transition-all duration-300",
      !row.status && !notesExpanded && "bg-card border-border",
      row.status === "approved" && !notesExpanded && "bg-success/10 border-success/30",
      (isFlagged || notesExpanded) && "bg-warning/10 border-warning/30",
      justConfirmed && "ring-2 ring-success/50"
    )}>
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

      {/* Freelancer: action buttons with text labels */}
      {role === "freelancer" && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleConfirm}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
              row.status === "approved" && !notesExpanded
                ? "bg-success text-white shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-success/10 hover:text-success active:scale-95"
            )}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs">Confirm</span>
          </button>
          <button
            onClick={handleFlag}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all",
              isFlagged || notesExpanded
                ? "bg-warning text-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-warning/10 hover:text-warning active:scale-95"
            )}
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs">Flag</span>
          </button>
        </div>
      )}

      {/* Admin: Read-only status display */}
      {role === "admin" && !row.status && (
        <div className="mt-2 text-xs text-muted-foreground italic">
          Pending review
        </div>
      )}

      {/* Freelancer: Note input when flagging / editing */}
      {role === "freelancer" && notesExpanded && (
        <div className="mt-3 space-y-2 p-3 bg-warning/5 rounded-lg border border-warning/20">
          <p className="text-xs font-medium text-warning">{panelLabel}</p>
          <textarea
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            placeholder="What's wrong with this item?"
            className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleNoteSave}
              disabled={isSaving || !noteValue.trim()}
              className="flex-1 py-2 rounded-lg bg-warning text-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? "Saving..." : saveLabel}
            </button>
            <button
              onClick={() => {
                setNoteValue(row.qualityNotes || "");
                onToggleNotes();
              }}
              className="py-2 px-4 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Admin/Freelancer: Display saved note — tappable for freelancers */}
      {row.qualityNotes && !notesExpanded && (
        <div
          className={cn(
            "mt-3 p-2.5 bg-warning/5 rounded-lg border border-warning/20",
            role === "freelancer" && "cursor-pointer hover:bg-warning/10 transition-colors"
          )}
          onClick={role === "freelancer" ? onToggleNotes : undefined}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-xs font-medium text-warning">Issue reported</p>
                {role === "freelancer" && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground">{row.qualityNotes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin: Review metadata */}
      {role === "admin" && row.status && (updatedByName || row.updatedAt) && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="font-medium">Reviewed</span>
            {updatedByName && <span>by {updatedByName}</span>}
            {row.updatedAt && (
              <span>· {new Date(row.updatedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowerCardList;
