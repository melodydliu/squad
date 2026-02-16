import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useUserProfile, getInitials, UserProfile } from "@/hooks/useUserProfile";
import { Camera, X, Globe, Instagram } from "lucide-react";
import { toast } from "sonner";

type Errors = Partial<Record<keyof UserProfile, string>>;

function validate(form: UserProfile): Errors {
  const errors: Errors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Enter a valid email";
  if (!form.phone.trim()) errors.phone = "Phone is required";
  if (!form.address.trim()) errors.address = "Address is required";
  return errors;
}

const ProfilePage = () => {
  const { profile, saveProfile } = useUserProfile();
  const [form, setForm] = useState<UserProfile>(profile);
  const [errors, setErrors] = useState<Errors>({});
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(profile);
    setDirty(false);
  }, [profile]);

  const update = (key: keyof UserProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    saveProfile(form);
    setDirty(false);
    toast.success("Profile saved!");
  };

  const handleCancel = () => {
    setForm(profile);
    setErrors({});
    setDirty(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update("profilePhotoUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => update("profilePhotoUrl", "");

  const initials = getInitials(form.firstName, form.lastName);

  return (
    <AppLayout role="freelancer" title="Profile">
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <div className="relative">
            {form.profilePhotoUrl ? (
              <img
                src={form.profilePhotoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-secondary"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center ring-4 ring-secondary">
                <span className="text-2xl font-bold text-primary-foreground font-display">
                  {initials || "?"}
                </span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center cursor-pointer shadow-card-hover hover:bg-secondary transition-colors">
              <Camera className="w-4 h-4 text-muted-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
          {form.profilePhotoUrl && (
            <button onClick={removePhoto} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
              <X className="w-3 h-3" /> Remove photo
            </button>
          )}
        </div>

        {/* Required fields */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground">Personal Information</h3>

          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name *" value={form.firstName} error={errors.firstName} onChange={(v) => update("firstName", v)} />
            <Field label="Last Name *" value={form.lastName} error={errors.lastName} onChange={(v) => update("lastName", v)} />
          </div>

          <Field label="Email *" type="email" value={form.email} error={errors.email} onChange={(v) => update("email", v)} />
          <Field label="Phone *" type="tel" value={form.phone} error={errors.phone} onChange={(v) => update("phone", v)} placeholder="(555) 123-4567" />
          <Field label="Address *" value={form.address} error={errors.address} onChange={(v) => update("address", v)} placeholder="Street, City, State ZIP" />
        </div>

        {/* Optional fields */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <h3 className="font-display text-sm font-semibold text-foreground">Links</h3>

          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="url"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full pl-9 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={form.instagram}
              onChange={(e) => update("instagram", e.target.value)}
              placeholder="@yourusername"
              className="w-full pl-9 pr-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        {dirty && (
          <div className="flex gap-3 pb-4">
            <button onClick={handleCancel} className="flex-1 py-3 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
              Save Changes
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

/* Reusable field component */
function Field({
  label, value, error, onChange, type = "text", placeholder,
}: {
  label: string; value: string; error?: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg border ${error ? "border-destructive" : "border-input"} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm`}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default ProfilePage;
