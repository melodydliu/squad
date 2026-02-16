import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Camera, Plus } from "lucide-react";
import { motion } from "framer-motion";

const CreateProject = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    eventName: "",
    date: "",
    time: "",
    location: "",
    pay: "",
    description: "",
    moodDescription: "",
    deliveryMethod: "ship" as "ship" | "pickup",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock — would save to DB
    navigate("/admin");
  };

  return (
    <AppLayout role="admin" title="New Project" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Event Name" value={form.eventName} onChange={(v) => update("eventName", v)} placeholder="e.g. Smith-Jones Wedding" />

        <div className="grid grid-cols-2 gap-3">
          <InputField label="Date" type="date" value={form.date} onChange={(v) => update("date", v)} />
          <InputField label="Time" type="time" value={form.time} onChange={(v) => update("time", v)} />
        </div>

        <InputField label="Location" value={form.location} onChange={(v) => update("location", v)} placeholder="Venue name & city" />
        <InputField label="Project Pay" type="number" value={form.pay} onChange={(v) => update("pay", v)} placeholder="$" />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What arrangements are needed? How many pieces?"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Style & Mood</label>
          <textarea
            value={form.moodDescription}
            onChange={(e) => update("moodDescription", e.target.value)}
            placeholder="Describe the aesthetic, colors, vibe..."
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
          />
        </div>

        {/* Delivery Method */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Supply Delivery</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "ship" as const, label: "Ship to Freelancer" },
              { value: "pickup" as const, label: "Pickup from Wholesaler" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("deliveryMethod", opt.value)}
                className={`py-3 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  form.deliveryMethod === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-input bg-card text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload Placeholder */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Inspiration Photos</label>
          <button
            type="button"
            className="w-full py-8 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs font-medium">Tap to upload photos</span>
          </button>
        </div>

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
