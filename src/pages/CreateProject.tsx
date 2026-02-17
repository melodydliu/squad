import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Camera, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import MobilePhotoUpload from "@/components/MobilePhotoUpload";
import { ServiceLevel, SERVICE_LEVEL_OPTIONS, DEFAULT_VISIBILITY, FieldVisibility } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface FloralItemRow {
  id: string;
  name: string;
  quantity: string;
}

let nextId = 1;
const makeId = () => `new-${nextId++}`;

const CreateProject = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    eventName: "",
    dateStart: "",
    dateEnd: "",
    timeline: "",
    location: "",
    pay: "",
    totalHours: "",
    description: "",
    designGuide: "",
    transportMethod: "personal_vehicle" as "personal_vehicle" | "uhaul_rental",
    serviceLevel: [] as ServiceLevel[],
    dayOfContact: "",
    designersNeeded: "1",
  });
  const [floralItems, setFloralItems] = useState<FloralItemRow[]>([]);
  const [visibility, setVisibility] = useState<FieldVisibility>({ ...DEFAULT_VISIBILITY });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const toggleService = (val: ServiceLevel) => {
    setForm((p) => ({
      ...p,
      serviceLevel: p.serviceLevel.includes(val)
        ? p.serviceLevel.filter((s) => s !== val)
        : [...p.serviceLevel, val],
    }));
  };

  const toggleVisibility = (key: string) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const addFloralItem = () => {
    setFloralItems((prev) => [...prev, { id: makeId(), name: "", quantity: "1" }]);
  };

  const updateFloralItem = (id: string, field: "name" | "quantity", value: string) => {
    setFloralItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeFloralItem = (id: string) => {
    setFloralItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin");
  };

  return (
    <AppLayout role="admin" title="New Project" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Event Name" value={form.eventName} onChange={(v) => update("eventName", v)} placeholder="e.g. Smith-Jones Wedding" />

        <InputField label="Number of Designers Needed" type="number" value={form.designersNeeded} onChange={(v) => update("designersNeeded", String(Math.max(1, Number(v) || 1)))} placeholder="1" />

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Start Date" type="date" value={form.dateStart} onChange={(v) => update("dateStart", v)} />
          <InputField label="End Date" type="date" value={form.dateEnd} onChange={(v) => update("dateEnd", v)} />
        </div>

        {/* Timeline */}
        <FieldWithVisibility label="Timeline" visible={visibility.timeline} onToggle={() => toggleVisibility("timeline")}>
          <textarea
            value={form.timeline}
            onChange={(e) => update("timeline", e.target.value)}
            placeholder="Schedule notes, timing instructions, load-in details..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
          />
        </FieldWithVisibility>

        <FieldWithVisibility label="Location" visible={visibility.location} onToggle={() => toggleVisibility("location")}>
          <input
            type="text"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="Venue name & city"
            className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </FieldWithVisibility>

        <div className="grid grid-cols-2 gap-3">
          <FieldWithVisibility label="Project Pay" visible={visibility.pay} onToggle={() => toggleVisibility("pay")}>
            <input type="number" value={form.pay} onChange={(e) => update("pay", e.target.value)} placeholder="$" className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          </FieldWithVisibility>
          <FieldWithVisibility label="Total Hours" visible={visibility.totalHours} onToggle={() => toggleVisibility("totalHours")}>
            <input type="number" value={form.totalHours} onChange={(e) => update("totalHours", e.target.value)} placeholder="hrs" className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          </FieldWithVisibility>
        </div>

        <FieldWithVisibility label="Description" visible={visibility.description} onToggle={() => toggleVisibility("description")}>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What arrangements are needed? How many pieces?"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
          />
        </FieldWithVisibility>

        <FieldWithVisibility label="Design Guide" visible={visibility.designGuide} onToggle={() => toggleVisibility("designGuide")}>
          <input
            type="url"
            value={form.designGuide}
            onChange={(e) => update("designGuide", e.target.value)}
            placeholder="Paste Canva link here..."
            className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </FieldWithVisibility>

        {/* Service Level */}
        <FieldWithVisibility label="Service Level" visible={visibility.serviceLevel} onToggle={() => toggleVisibility("serviceLevel")}>
          <div className="flex flex-wrap gap-2">
            {SERVICE_LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleService(opt.value)}
                className={cn(
                  "py-2 px-4 rounded-lg text-xs font-medium border transition-colors",
                  form.serviceLevel.includes(opt.value)
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-input bg-card text-muted-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FieldWithVisibility>

        {/* Floral Items */}
        <FieldWithVisibility label="Floral Items" visible={visibility.floralItems} onToggle={() => toggleVisibility("floralItems")}>
          {floralItems.length > 0 && (
            <div className="space-y-2 mb-2">
              {floralItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateFloralItem(item.id, "name", e.target.value)}
                    placeholder="Item name"
                    className="flex-1 px-3 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateFloralItem(item.id, "quantity", e.target.value)}
                    className="w-16 px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={() => removeFloralItem(item.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addFloralItem}
            className="w-full py-3 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Floral Item
          </button>
        </FieldWithVisibility>

        {/* Delivery Vehicle */}
        <FieldWithVisibility label="Delivery Vehicle" visible={visibility.transportMethod} onToggle={() => toggleVisibility("transportMethod")}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "personal_vehicle" as const, label: "Personal Vehicle" },
              { value: "uhaul_rental" as const, label: "U-Haul Rental" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("transportMethod", opt.value)}
                className={cn(
                  "py-3 px-3 rounded-lg text-xs font-medium border transition-colors",
                  form.transportMethod === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-input bg-card text-muted-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FieldWithVisibility>

        {/* Day-of Contact */}
        <FieldWithVisibility label="Day-of Contact" visible={visibility.dayOfContact} onToggle={() => toggleVisibility("dayOfContact")}>
          <input
            type="text"
            value={form.dayOfContact}
            onChange={(e) => update("dayOfContact", e.target.value)}
            placeholder="Name & phone number"
            className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </FieldWithVisibility>

        {/* Photo Upload Placeholder */}
        <FieldWithVisibility label="Inspiration Photos" visible={visibility.inspirationPhotos} onToggle={() => toggleVisibility("inspirationPhotos")}>
          <MobilePhotoUpload onPhoto={() => {}} multiple>
            <div className="w-full py-8 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-2">
              <Camera className="w-5 h-5" />
              <span className="text-xs font-medium">Tap to upload photos</span>
            </div>
          </MobilePhotoUpload>
        </FieldWithVisibility>

        <button
          type="submit"
          className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Publish Project
        </button>
      </form>
    </AppLayout>
  );
};

/** Field wrapper with visibility toggle */
const FieldWithVisibility = ({
  label, visible, onToggle, children,
}: {
  label: string; visible: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors",
          visible
            ? "text-primary bg-primary/10"
            : "text-muted-foreground bg-muted"
        )}
      >
        {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        {visible ? "Visible" : "Hidden"}
      </button>
    </div>
    {children}
  </div>
);

const InputField = ({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
    />
  </div>
);

export default CreateProject;
