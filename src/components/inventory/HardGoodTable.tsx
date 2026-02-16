import { useState } from "react";
import { HardGoodInventoryRow } from "@/data/mockData";
import { Camera, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import PhotoModal from "./PhotoModal";
import { cn } from "@/lib/utils";

interface HardGoodTableProps {
  rows: HardGoodInventoryRow[];
  role: "admin" | "freelancer";
  filter?: "all" | "issues";
}

const HardGoodTable = ({ rows, role, filter = "all" }: HardGoodTableProps) => {
  const [photoModal, setPhotoModal] = useState<{ open: boolean; rowId: string }>({ open: false, rowId: "" });

  const filtered = filter === "issues"
    ? rows.filter((r) => !r.received || !!r.notes)
    : rows;

  const activeRow = rows.find((r) => r.id === photoModal.rowId);

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        {filter === "issues" ? "No issues found" : "No hard goods inventory data"}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto -mx-4">
        <table className="w-full text-sm min-w-[300px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-4 text-xs font-semibold text-muted-foreground">Item</th>
              <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground">Qty</th>
              <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground">Rcvd</th>
              <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border last:border-0",
                  !row.received && "bg-warning/5",
                  row.notes && !row.received && "bg-destructive/5"
                )}
              >
                <td className="py-2.5 px-4">
                  <div className="font-medium text-foreground text-xs">{row.item}</div>
                  {row.notes && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3 text-warning flex-shrink-0" />
                      <span className="text-[10px] text-warning truncate max-w-[160px]">{row.notes}</span>
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-2 text-xs text-center text-foreground">{row.quantity}</td>
                <td className="py-2.5 px-2 text-center">
                  {role === "freelancer" ? (
                    <button className="inline-flex items-center justify-center">
                      {row.received ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  ) : row.received ? (
                    <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground mx-auto" />
                  )}
                </td>
                <td className="py-2.5 px-2 text-center">
                  <button
                    onClick={() => setPhotoModal({ open: true, rowId: row.id })}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      row.photoUrl
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default HardGoodTable;
