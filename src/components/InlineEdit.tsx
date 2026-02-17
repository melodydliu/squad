import { useState, useRef, useEffect } from "react";
import { Pencil, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string | number;
  onSave: (value: string) => void;
  type?: "text" | "number" | "textarea" | "url";
  editable: boolean;
  locked?: boolean;
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  /** Render custom display content instead of raw value */
  renderDisplay?: (value: string | number) => React.ReactNode;
}

const InlineEdit = ({
  value,
  onSave,
  type = "text",
  editable,
  locked = false,
  placeholder = "—",
  className,
  displayClassName,
  renderDisplay,
}: InlineEditProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed !== String(value)) {
      onSave(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      handleSave();
    }
    if (e.key === "Escape") {
      setEditValue(String(value));
      setEditing(false);
    }
  };

  if (editing && editable) {
    const inputClasses =
      "w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

    return type === "textarea" ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditValue(String(value));
            setEditing(false);
          }
        }}
        className={cn(inputClasses, "resize-none", className)}
        rows={3}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type === "number" ? "number" : "text"}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn(inputClasses, className)}
      />
    );
  }

  const displayContent = renderDisplay
    ? renderDisplay(value)
    : String(value) || placeholder;

  return (
    <span
      onClick={() => editable && !locked && setEditing(true)}
      className={cn(
        "inline-flex items-center gap-1.5 group",
        editable && !locked && "cursor-pointer hover:bg-muted/50 rounded-md px-1 -mx-1 transition-colors",
        displayClassName
      )}
    >
      <span className="flex-1">{displayContent}</span>
      {editable && !locked && (
        <Pencil className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0" />
      )}
      {locked && (
        <Lock className="w-3 h-3 text-muted-foreground/40 shrink-0" />
      )}
    </span>
  );
};

export default InlineEdit;
