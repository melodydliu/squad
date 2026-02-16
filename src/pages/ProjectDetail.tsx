import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { mockProjects, mockFreelancers, Project, FloralItem, FloralItemDesign, getAttentionFlags, SERVICE_LEVEL_OPTIONS } from "@/data/mockData";
import { Calendar, MapPin, DollarSign, Truck, Check, X, Camera, AlertCircle, CheckCircle2, Image, Clock, Car, Flower2, FileText, Phone, Eye, EyeOff, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ProjectDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as "admin" | "freelancer") || "admin";
  const project = mockProjects.find((p) => p.id === id);
  const initialTab = (searchParams.get("tab") as "overview" | "inventory" | "designs") || "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "designs">(initialTab);

  if (!project) {
    return (
      <AppLayout role={role} title="Not Found" showBack>
        <div className="text-center py-12 text-muted-foreground">Project not found</div>
      </AppLayout>
    );
  }

  const assignedFreelancer = project.assignedFreelancerId
    ? mockFreelancers.find((f) => f.id === project.assignedFreelancerId)
    : null;

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "inventory" as const, label: "Inventory" },
    { key: "designs" as const, label: "Designs" },
  ];

  return (
    <AppLayout role={role} title={project.eventName} showBack>
      <div className="space-y-4">
        {/* Status + Pay header */}
        <div className="flex items-center justify-between">
          <StatusBadge status={project.status} project={project} />
          <div className="text-right">
            <span className="text-lg font-bold font-display text-foreground">${project.pay}</span>
            <span className="text-xs text-muted-foreground ml-1.5">· {project.totalHours}h</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 py-2 text-xs font-medium rounded-md transition-all",
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {activeTab === "overview" && (
            <OverviewTab project={project} role={role} assignedFreelancer={assignedFreelancer} />
          )}
          {activeTab === "inventory" && (
            <InventoryTab project={project} role={role} />
          )}
          {activeTab === "designs" && (
            <DesignsTab project={project} role={role} />
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
};

const OverviewTab = ({ project, role, assignedFreelancer }: { project: Project; role: string; assignedFreelancer: any }) => {
  const v = project.fieldVisibility;

  /** Whether a field should be shown: admin always sees all, freelancer only if visible + has content */
  const show = (key: string, hasContent: boolean) => {
    if (role === "admin") return true;
    return hasContent && v[key] !== false;
  };

  const serviceLevelLabels = project.serviceLevel
    .map((s) => SERVICE_LEVEL_OPTIONS.find((o) => o.value === s)?.label ?? s)
    .join(", ");

  return (
    <div className="space-y-4">
      {/* Details Card */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-3">
        {/* Date — always visible */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(project.dateStart).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
            {project.dateEnd !== project.dateStart && ` – ${new Date(project.dateEnd).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}`}
            {`, ${new Date(project.dateStart).getFullYear()}`}
          </span>
        </div>

        {show("location", !!project.location) && (
          <FieldRow icon={<MapPin className="w-4 h-4" />} visible={v.location !== false} fieldKey="location" role={role}>
            {project.location}
          </FieldRow>
        )}

        {show("transportMethod", true) && (
          <FieldRow icon={<Car className="w-4 h-4" />} visible={v.transportMethod !== false} fieldKey="transportMethod" role={role}>
            {project.transportMethod === "personal_vehicle" ? "Personal Vehicle" : "U-Haul Rental"}
          </FieldRow>
        )}

        {show("pay", true) && (
          <FieldRow icon={<DollarSign className="w-4 h-4" />} visible={v.pay !== false} fieldKey="pay" role={role}>
            <span className="font-medium text-foreground">${project.pay}</span>
          </FieldRow>
        )}

        {show("totalHours", true) && (
          <FieldRow icon={<Clock className="w-4 h-4" />} visible={v.totalHours !== false} fieldKey="totalHours" role={role}>
            {project.totalHours} hours
          </FieldRow>
        )}

        {show("serviceLevel", project.serviceLevel.length > 0) && (
          <FieldRow icon={<Briefcase className="w-4 h-4" />} visible={v.serviceLevel !== false} fieldKey="serviceLevel" role={role}>
            {serviceLevelLabels}
          </FieldRow>
        )}

        {show("dayOfContact", !!project.dayOfContact) && (
          <FieldRow icon={<Phone className="w-4 h-4" />} visible={v.dayOfContact !== false} fieldKey="dayOfContact" role={role}>
            {project.dayOfContact}
          </FieldRow>
        )}
      </div>

      {/* Timeline */}
      {show("timeline", !!project.timeline) && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-2">
          <FieldHeader label="Timeline" visible={v.timeline !== false} fieldKey="timeline" role={role} />
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{project.timeline}</p>
        </div>
      )}

      {/* Floral Items */}
      {show("floralItems", project.floralItems.length > 0) && project.floralItems.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <FieldHeader label="Floral Items" visible={v.floralItems !== false} fieldKey="floralItems" role={role} icon={<Flower2 className="w-4 h-4 text-primary" />} />
          <div className="space-y-2">
            {project.floralItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-foreground">{item.name}</span>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {show("description", !!project.description) && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-2">
          <FieldHeader label="Description" visible={v.description !== false} fieldKey="description" role={role} />
          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
        </div>
      )}

      {/* Mood */}
      {show("moodDescription", !!project.moodDescription) && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-2">
          <FieldHeader label="Style & Mood" visible={v.moodDescription !== false} fieldKey="moodDescription" role={role} />
          <p className="text-sm text-muted-foreground leading-relaxed">{project.moodDescription}</p>
        </div>
      )}

      {/* Inspiration Photos */}
      {show("inspirationPhotos", project.inspirationPhotos.length > 0) && project.inspirationPhotos.length > 0 && (
        <div className="space-y-2">
          <FieldHeader label="Inspiration" visible={v.inspirationPhotos !== false} fieldKey="inspirationPhotos" role={role} />
          <div className="grid grid-cols-2 gap-2">
            {project.inspirationPhotos.map((url, i) => (
              <div key={i} className="rounded-lg overflow-hidden aspect-square">
                <img src={url} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned / Interested Freelancers (Admin view) */}
      {role === "admin" && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Freelancers</h3>
          {assignedFreelancer ? (
            <div className="flex items-center gap-3">
              <img src={assignedFreelancer.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <div className="text-sm font-medium text-foreground">{assignedFreelancer.name}</div>
                <div className="text-xs text-primary font-medium">Assigned</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {project.interestedFreelancerIds.map((fId) => {
                const f = mockFreelancers.find((fr) => fr.id === fId);
                if (!f) return null;
                return (
                  <div key={f.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={f.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div className="text-sm font-medium text-foreground">{f.name}</div>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground">
                      Approve
                    </button>
                  </div>
                );
              })}
              {project.interestedFreelancerIds.length === 0 && (
                <p className="text-sm text-muted-foreground">No responses yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Freelancer action buttons */}
      {role === "freelancer" && project.status === "unassigned" && (
        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            I'm Interested
          </button>
          <button className="flex-1 py-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
            Unavailable
          </button>
        </div>
      )}
    </div>
  );
};

/** Inline visibility toggle for admin */
const VisibilityToggle = ({ visible, fieldKey }: { visible: boolean; fieldKey: string }) => (
  <button
    type="button"
    className={cn(
      "ml-auto p-1 rounded transition-colors",
      visible ? "text-primary hover:text-primary/80" : "text-muted-foreground/40 hover:text-muted-foreground"
    )}
    title={visible ? "Visible to freelancer" : "Hidden from freelancer"}
  >
    {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
  </button>
);

const FieldRow = ({ icon, children, visible, fieldKey, role }: { icon: React.ReactNode; children: React.ReactNode; visible: boolean; fieldKey: string; role: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    {icon}
    <span className="flex-1">{children}</span>
    {role === "admin" && <VisibilityToggle visible={visible} fieldKey={fieldKey} />}
  </div>
);

const FieldHeader = ({ label, visible, fieldKey, role, icon }: { label: string; visible: boolean; fieldKey: string; role: string; icon?: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    {icon}
    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
    {role === "admin" && <VisibilityToggle visible={visible} fieldKey={fieldKey} />}
  </div>
);

const InventoryTab = ({ project, role }: { project: Project; role: string }) => (
  <div className="space-y-4">
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Delivery Confirmation</h3>

      {/* Flowers */}
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Flowers Received</span>
        </div>
        {project.flowersConfirmed ? (
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <CheckCircle2 className="w-4 h-4" /> Confirmed
          </span>
        ) : role === "freelancer" ? (
          <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground">Confirm</button>
        ) : (
          <span className="text-xs text-muted-foreground">Pending</span>
        )}
      </div>

      {/* Hard Goods */}
      <div className="flex items-center justify-between py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground">Hard Goods Received</span>
        </div>
        {project.hardGoodsConfirmed ? (
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <CheckCircle2 className="w-4 h-4" /> Confirmed
          </span>
        ) : role === "freelancer" ? (
          <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground">Confirm</button>
        ) : (
          <span className="text-xs text-muted-foreground">Pending</span>
        )}
      </div>

      {/* Quality */}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-foreground">Quality Check</span>
        {project.qualityStatus === "good" ? (
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <CheckCircle2 className="w-4 h-4" /> Good
          </span>
        ) : project.qualityStatus === "issue" ? (
          <span className="flex items-center gap-1 text-xs text-destructive font-medium">
            <AlertCircle className="w-4 h-4" /> Issue Reported
          </span>
        ) : role === "freelancer" ? (
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-success/10 text-success">Good</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-destructive/10 text-destructive">Issue</button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Pending</span>
        )}
      </div>
    </div>

    {project.qualityNote && (
      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
        <p className="text-sm text-destructive">{project.qualityNote}</p>
      </div>
    )}
  </div>
);

const DesignsTab = ({ project, role }: { project: Project; role: string }) => {
  const items = project.floralItems;
  const designs = project.floralItemDesigns;

  if (items.length === 0) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted">
          <Flower2 className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No floral items defined for this project</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const design = designs.find((d) => d.floralItemId === item.id);
        return (
          <FloralItemDesignCard key={item.id} item={item} design={design} role={role} />
        );
      })}
    </div>
  );
};

const FloralItemDesignCard = ({
  item,
  design,
  role,
}: {
  item: FloralItem;
  design?: FloralItemDesign;
  role: string;
}) => {
  const hasPhotos = design && design.photos.length > 0;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Item Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flower2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{item.name}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">×{item.quantity}</span>
        </div>
        {design?.approved && (
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        )}
        {design?.revisionRequested && (
          <span className="flex items-center gap-1 text-xs text-warning font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Revision
          </span>
        )}
      </div>

      {/* Photos Grid */}
      {hasPhotos ? (
        <div className="p-3 space-y-3">
          <div className={`grid gap-2 ${design.photos.length === 1 ? "grid-cols-1" : design.photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
            {design.photos.map((photo) => (
              <div key={photo.id} className="rounded-lg overflow-hidden aspect-square">
                <img src={photo.photoUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Freelancer Note */}
          {design.freelancerNote && (
            <p className="text-sm text-muted-foreground italic">"{design.freelancerNote}"</p>
          )}

          {/* Admin Note / Revision Note */}
          {design.revisionRequested && design.adminNote && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
              <p className="text-xs font-medium text-warning mb-1">Admin Revision Note</p>
              <p className="text-sm text-foreground">{design.adminNote}</p>
            </div>
          )}

          {/* Admin Actions */}
          {role === "admin" && !design.approved && !design.revisionRequested && (
            <div className="flex gap-2 pt-1">
              <button className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground">
                Approve
              </button>
              <button className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-muted text-muted-foreground">
                Request Revision
              </button>
            </div>
          )}

          {/* Freelancer: upload more (max 3) */}
          {role === "freelancer" && design.photos.length < 3 && (
            <button className="w-full py-2 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Add Photo ({3 - design.photos.length} remaining)
            </button>
          )}
        </div>
      ) : (
        /* No photos uploaded yet */
        <div className="p-4">
          {role === "freelancer" ? (
            <button className="w-full py-6 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex flex-col items-center gap-2">
              <Camera className="w-5 h-5" />
              <span className="text-xs font-medium">Upload Design Photos</span>
              <span className="text-[10px] text-muted-foreground">Up to 3 photos</span>
            </button>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">No designs uploaded yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
