import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import FreelancerResponsePanel from "@/components/FreelancerResponsePanel";
import { mockProjects, mockFreelancers, mockNotifications, Project, FloralItem, FloralItemDesign, FlowerInventoryRow, HardGoodInventoryRow, getAttentionFlags, getDesignersRemaining, SERVICE_LEVEL_OPTIONS, Notification, DesignStatus } from "@/data/mockData";
import { Calendar, MapPin, DollarSign, Truck, Check, X, Camera, AlertCircle, CheckCircle2, Image, Clock, Car, Flower2, FileText, Phone, Eye, EyeOff, Briefcase, Package, Upload, RefreshCw, Trash2 } from "lucide-react";
import CsvUpload from "@/components/inventory/CsvUpload";
import FlowerCardList from "@/components/inventory/FlowerCard";
import HardGoodCardList from "@/components/inventory/HardGoodCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ProjectDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") as "admin" | "freelancer" || "admin";
  const initialProject = mockProjects.find((p) => p.id === id);
  const initialTab = searchParams.get("tab") as "overview" | "inventory" | "designs" || "overview";
  const highlightId = searchParams.get("highlight") || undefined;
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "designs">(initialTab);
  const [project, setProject] = useState<Project | undefined>(initialProject);

  // Scroll to highlighted element after render
  useEffect(() => {
    if (!highlightId) return;
    const timeout = setTimeout(() => {
      const el = document.querySelector(`[data-item-id="${highlightId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
        setTimeout(() => {
          el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
        }, 2500);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [highlightId, activeTab]);

  if (!project) {
    return (
      <AppLayout role={role} title="Not Found" showBack>
        <div className="text-center py-12 text-muted-foreground">Project not found</div>
      </AppLayout>);
  }

  const handleApproveFreelancer = (freelancerId: string) => {
    const freelancer = mockFreelancers.find((f) => f.id === freelancerId);
    const updatedAssigned = [...project.assignedFreelancerIds, freelancerId];
    const remaining = project.designersNeeded - updatedAssigned.length;
    const isFull = remaining <= 0;

    setProject({
      ...project,
      assignedFreelancerIds: updatedAssigned,
      status: isFull ? "assigned" : project.status,
    });

    // Notification for approved freelancer
    toast.success(`${freelancer?.name || "Freelancer"} approved for ${project.eventName}`);

    // If fully staffed, notify remaining available freelancers
    if (isFull) {
      const availableNotApproved = (project.freelancerResponses || [])
        .filter((r) => r.status === "available" && !updatedAssigned.includes(r.freelancerId));
      if (availableNotApproved.length > 0) {
        const names = availableNotApproved
          .map((r) => mockFreelancers.find((f) => f.id === r.freelancerId)?.name)
          .filter(Boolean)
          .join(", ");
        toast.info(`Notified ${names}: project is no longer available`);
      }
      toast.success(`${project.eventName} is now fully staffed!`);
    }
  };

  const assignedFreelancers = project.assignedFreelancerIds
    .map((fId) => mockFreelancers.find((f) => f.id === fId))
    .filter(Boolean);

  const tabs = [
  { key: "overview" as const, label: "Overview" },
  { key: "inventory" as const, label: "Inventory" },
  { key: "designs" as const, label: "Designs" }];


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
          {tabs.map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 py-2 text-xs font-medium rounded-md transition-all",
              activeTab === tab.key ?
              "bg-card text-foreground shadow-sm" :
              "text-muted-foreground"
            )}>

              {tab.label}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {activeTab === "overview" &&
          <OverviewTab project={project} role={role} assignedFreelancers={assignedFreelancers} onApprove={handleApproveFreelancer} />
          }
          {activeTab === "inventory" &&
          <InventoryTab project={project} role={role} />
          }
          {activeTab === "designs" &&
          <DesignsTab project={project} role={role} />
          }
        </motion.div>
      </div>
    </AppLayout>);

};

const OverviewTab = ({ project, role, assignedFreelancers, onApprove }: {project: Project;role: string;assignedFreelancers: any[];onApprove: (id: string) => void;}) => {
  const v = project.fieldVisibility;

  /** Whether a field should be shown: admin always sees all, freelancer only if visible + has content */
  const show = (key: string, hasContent: boolean) => {
    if (role === "admin") return true;
    return hasContent && v[key] !== false;
  };

  const serviceLevelLabels = project.serviceLevel.
  map((s) => SERVICE_LEVEL_OPTIONS.find((o) => o.value === s)?.label ?? s).
  join(", ");

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

        {show("location", !!project.location) &&
        <FieldRow icon={<MapPin className="w-4 h-4" />} visible={v.location !== false} fieldKey="location" role={role}>
            {project.location}
          </FieldRow>
        }

        {show("transportMethod", true) &&
        <FieldRow icon={<Car className="w-4 h-4" />} visible={v.transportMethod !== false} fieldKey="transportMethod" role={role}>
            {project.transportMethod === "personal_vehicle" ? "Personal Vehicle" : "U-Haul Rental"}
          </FieldRow>
        }

        {show("pay", true) &&
        <FieldRow icon={<DollarSign className="w-4 h-4" />} visible={v.pay !== false} fieldKey="pay" role={role}>
            <span className="font-medium text-inherit">${project.pay}</span>
          </FieldRow>
        }

        {show("totalHours", true) &&
        <FieldRow icon={<Clock className="w-4 h-4" />} visible={v.totalHours !== false} fieldKey="totalHours" role={role}>
            {project.totalHours} hours
          </FieldRow>
        }

        {show("serviceLevel", project.serviceLevel.length > 0) &&
        <FieldRow icon={<Briefcase className="w-4 h-4" />} visible={v.serviceLevel !== false} fieldKey="serviceLevel" role={role}>
            {serviceLevelLabels}
          </FieldRow>
        }

        {show("dayOfContact", !!project.dayOfContact) &&
        <FieldRow icon={<Phone className="w-4 h-4" />} visible={v.dayOfContact !== false} fieldKey="dayOfContact" role={role}>
            {project.dayOfContact}
          </FieldRow>
        }
      </div>

      {/* Timeline */}
      {show("timeline", !!project.timeline) &&
      <div className="bg-card rounded-lg border border-border p-4 space-y-2">
          <FieldHeader label="Timeline" visible={v.timeline !== false} fieldKey="timeline" role={role} />
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{project.timeline}</p>
        </div>
      }

      {/* Floral Items */}
      {show("floralItems", project.floralItems.length > 0) && project.floralItems.length > 0 &&
      <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <FieldHeader label="Floral Items" visible={v.floralItems !== false} fieldKey="floralItems" role={role} icon={<Flower2 className="w-4 h-4 text-primary" />} />
          <div className="space-y-2">
            {project.floralItems.map((item) =>
          <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm text-inherit">{item.name}</span>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">×{item.quantity}</span>
              </div>
          )}
          </div>
        </div>
      }

      {/* Description */}
      {show("description", !!project.description) &&
      <div className="bg-card rounded-lg border border-border p-4 space-y-2">
          <FieldHeader label="Description" visible={v.description !== false} fieldKey="description" role={role} />
          <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
        </div>
      }

      {/* Design Guide */}
      {show("designGuide", !!project.designGuide) &&
      <div className="bg-card rounded-lg border border-border p-4 space-y-2">
          <FieldHeader label="Design Guide" visible={v.designGuide !== false} fieldKey="designGuide" role={role} />
          <a href={project.designGuide} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline break-all">
            {project.designGuide}
          </a>
        </div>
      }

      {/* Inspiration Photos */}
      {show("inspirationPhotos", project.inspirationPhotos.length > 0) && project.inspirationPhotos.length > 0 &&
      <div className="space-y-2">
          <FieldHeader label="Inspiration" visible={v.inspirationPhotos !== false} fieldKey="inspirationPhotos" role={role} />
          <div className="grid grid-cols-2 gap-2">
            {project.inspirationPhotos.map((url, i) =>
          <div key={i} className="rounded-lg overflow-hidden aspect-square">
                <img src={url} alt={`Inspiration ${i + 1}`} className="w-full h-full object-cover" />
              </div>
          )}
          </div>
        </div>
      }

      {/* Freelancer Responses Panel (Admin on unassigned) */}
      {role === "admin" && project.status === "unassigned" &&
      <FreelancerResponsePanel project={project} onApprove={onApprove} />
      }

      {/* Assigned Freelancers (Admin on assigned/completed) */}
      {role === "admin" && project.status !== "unassigned" && assignedFreelancers.length > 0 &&
      <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Assigned Designers</h3>
          <div className="space-y-2">
            {assignedFreelancers.map((f: any) =>
          <div key={f.id} className="flex items-center gap-3">
                <img src={f.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-medium text-foreground">{f.name}</div>
                  <div className="text-xs text-primary font-medium">Assigned</div>
                </div>
              </div>
          )}
          </div>
        </div>
      }

      {/* Freelancer action buttons */}
      {role === "freelancer" && project.status === "unassigned" &&
      <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            I'm Interested
          </button>
          <button className="flex-1 py-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
            Unavailable
          </button>
        </div>
      }
    </div>);

};

/** Inline visibility toggle for admin */
const VisibilityToggle = ({ visible, fieldKey }: {visible: boolean;fieldKey: string;}) =>
<button
  type="button"
  className={cn(
    "ml-auto p-1 rounded transition-colors",
    visible ? "text-primary hover:text-primary/80" : "text-muted-foreground/40 hover:text-muted-foreground"
  )}
  title={visible ? "Visible to freelancer" : "Hidden from freelancer"}>

    {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
  </button>;


const FieldRow = ({ icon, children, visible, fieldKey, role }: {icon: React.ReactNode;children: React.ReactNode;visible: boolean;fieldKey: string;role: string;}) =>
<div className="flex items-center gap-2 text-sm text-muted-foreground">
    {icon}
    <span className="flex-1">{children}</span>
    {role === "admin" && <VisibilityToggle visible={visible} fieldKey={fieldKey} />}
  </div>;


const FieldHeader = ({ label, visible, fieldKey, role, icon }: {label: string;visible: boolean;fieldKey: string;role: string;icon?: React.ReactNode;}) =>
<div className="flex items-center gap-2">
    {icon}
    <h3 className="text-sm font-semibold text-foreground">{label}</h3>
    {role === "admin" && <VisibilityToggle visible={visible} fieldKey={fieldKey} />}
  </div>;


type InventoryFilter = "all" | "approved" | "flagged";
const FILTER_OPTIONS: {key: InventoryFilter;label: string;}[] = [
{ key: "all", label: "All" },
{ key: "approved", label: "Approved" },
{ key: "flagged", label: "Flagged" }];


const InventoryTab = ({ project, role }: {project: Project;role: string;}) => {
  const [flowerFilter, setFlowerFilter] = useState<InventoryFilter>("all");
  const [hardGoodFilter, setHardGoodFilter] = useState<InventoryFilter>("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<"flowers" | "hardgoods" | null>(null);

  const hasFlowers = project.flowerInventory.length > 0;
  const hasHardGoods = project.hardGoodInventory.length > 0;
  const flowerFlagged = project.flowerInventory.filter((r) => r.status === "flagged").length;
  const hardGoodFlagged = project.hardGoodInventory.filter((r) => r.status === "flagged").length;
  const flowerAllApproved = hasFlowers && flowerFlagged === 0 && project.flowerInventory.every((r) => r.status === "approved");
  const hardGoodAllApproved = hasHardGoods && hardGoodFlagged === 0 && project.hardGoodInventory.every((r) => r.status === "approved");

  return (
    <div className="space-y-4">
      {/* Flowers Section */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flower2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Flowers</h3>
              {flowerAllApproved ?
              <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  All Approved
                </span> :
              flowerFlagged > 0 ?
              <span className="text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                  {flowerFlagged} flagged
                </span> :
              null}
            </div>
            {/* Admin CSV controls */}
            {role === "admin" && hasFlowers &&
            <div className="flex items-center gap-1">
                <CsvUpload label="Replace" onParsed={() => {}} compact />
                <button
                onClick={() => setShowDeleteConfirm("flowers")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                title="Delete CSV">

                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            }
          </div>
          {/* Filters */}
          {hasFlowers &&
          <div className="flex gap-1 mt-2">
              {FILTER_OPTIONS.map((f) =>
            <button
              key={f.key}
              onClick={() => setFlowerFilter(f.key)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors",
                flowerFilter === f.key ?
                "bg-primary text-primary-foreground" :
                "text-muted-foreground hover:bg-muted"
              )}>

                  {f.label}
                </button>
            )}
            </div>
          }
        </div>
        <div className="p-3">
          {hasFlowers ?
          <FlowerCardList rows={project.flowerInventory} role={role as "admin" | "freelancer"} filter={flowerFilter} /> :
          role === "admin" ?
          <CsvUpload label="Flowers" onParsed={() => {}} /> :

          <p className="text-sm text-muted-foreground text-center py-4">No flower inventory uploaded yet</p>
          }
        </div>
      </div>

      {/* Hard Goods Section */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Hard Goods</h3>
              {hardGoodAllApproved ?
              <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                  All Approved
                </span> :
              hardGoodFlagged > 0 ?
              <span className="text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                  {hardGoodFlagged} flagged
                </span> :
              null}
            </div>
            {role === "admin" && hasHardGoods &&
            <div className="flex items-center gap-1">
                <CsvUpload label="Replace" onParsed={() => {}} compact />
                <button
                onClick={() => setShowDeleteConfirm("hardgoods")}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                title="Delete CSV">

                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            }
          </div>
          {hasHardGoods &&
          <div className="flex gap-1 mt-2">
              {FILTER_OPTIONS.map((f) =>
            <button
              key={f.key}
              onClick={() => setHardGoodFilter(f.key)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors",
                hardGoodFilter === f.key ?
                "bg-primary text-primary-foreground" :
                "text-muted-foreground hover:bg-muted"
              )}>

                  {f.label}
                </button>
            )}
            </div>
          }
        </div>
        <div className="p-3">
          {hasHardGoods ?
          <HardGoodCardList rows={project.hardGoodInventory} role={role as "admin" | "freelancer"} filter={hardGoodFilter} /> :
          role === "admin" ?
          <CsvUpload label="Hard Goods" onParsed={() => {}} /> :

          <p className="text-sm text-muted-foreground text-center py-4">No hard goods inventory uploaded yet</p>
          }
        </div>
      </div>

      {/* Summary */}
      {(hasFlowers || hasHardGoods) &&
      <div className="bg-card rounded-lg border border-border p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-foreground font-display">
                {project.flowerInventory.length + project.hardGoodInventory.length}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success font-display">
                {project.flowerInventory.filter((r) => r.status === "approved").length + project.hardGoodInventory.filter((r) => r.status === "approved").length}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">Approved</div>
            </div>
            <div>
              <div className="text-lg font-bold text-warning font-display">
                {flowerFlagged + hardGoodFlagged}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium">Flagged</div>
            </div>
          </div>
        </div>
      }

      {/* Delete confirmation */}
      {showDeleteConfirm &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-card rounded-xl shadow-elevated w-[85vw] max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground">Delete {showDeleteConfirm === "flowers" ? "Flower" : "Hard Goods"} Inventory?</h3>
            <p className="text-xs text-muted-foreground">This will remove all rows and cannot be undone.</p>
            <div className="flex gap-2">
              <button
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 py-2.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">

                Cancel
              </button>
              <button
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">

                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};

const DESIGN_STATUS_CONFIG: Record<DesignStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircle2 }> = {
  in_review: { label: "In Review", color: "text-info", bgColor: "bg-info/10", icon: Clock },
  needs_revision: { label: "Needs Revision", color: "text-warning", bgColor: "bg-warning/10", icon: AlertCircle },
  approved: { label: "Approved", color: "text-success", bgColor: "bg-success/10", icon: CheckCircle2 },
};

type DesignFilter = "all" | "in_review" | "needs_revision" | "approved";
const DESIGN_FILTER_OPTIONS: { key: DesignFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_review", label: "In Review" },
  { key: "needs_revision", label: "Needs Revision" },
  { key: "approved", label: "Approved" },
];

const DesignsTab = ({ project, role }: { project: Project; role: string }) => {
  const items = project.floralItems;
  const [designs, setDesigns] = useState(project.floralItemDesigns);
  const [filter, setFilter] = useState<DesignFilter>("all");

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

  const handleApproveDesign = (designId: string) => {
    setDesigns((prev) =>
      prev.map((d) =>
        d.id === designId
          ? { ...d, designStatus: "approved" as DesignStatus, approved: true, revisionRequested: false, adminNote: undefined }
          : d
      )
    );
    toast.success("Design approved!");
  };

  const handleRequestRevision = (designId: string, note: string) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d;
        const revision = {
          id: `rv-${Date.now()}`,
          photoUrl: d.photos[0]?.photoUrl || "",
          note: d.freelancerNote,
          timestamp: new Date().toISOString(),
          status: "needs_revision" as DesignStatus,
          adminNote: note,
        };
        return {
          ...d,
          designStatus: "needs_revision" as DesignStatus,
          approved: false,
          revisionRequested: true,
          adminNote: note,
          revisionHistory: [...d.revisionHistory, revision],
        };
      })
    );
    toast("Revision requested — freelancer will be notified.");
  };

  // Compute counts
  const counts = {
    in_review: designs.filter((d) => d.designStatus === "in_review").length,
    needs_revision: designs.filter((d) => d.designStatus === "needs_revision").length,
    approved: designs.filter((d) => d.designStatus === "approved").length,
  };

  // Filter items by their design status
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    const design = designs.find((d) => d.floralItemId === item.id);
    if (!design) return filter === "in_review"; // no design yet = show under "in_review" as pending
    return design.designStatus === filter;
  });

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {designs.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-info font-display">{counts.in_review}</div>
              <div className="text-[10px] text-muted-foreground font-medium">In Review</div>
            </div>
            <div>
              <div className="text-lg font-bold text-warning font-display">{counts.needs_revision}</div>
              <div className="text-[10px] text-muted-foreground font-medium">Revision</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success font-display">{counts.approved}</div>
              <div className="text-[10px] text-muted-foreground font-medium">Approved</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {role === "admin" && designs.length > 0 && (
        <div className="flex gap-1">
          {DESIGN_FILTER_OPTIONS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors",
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {filteredItems.map((item) => {
        const design = designs.find((d) => d.floralItemId === item.id);
        return (
          <FloralItemDesignCard
            key={item.id}
            item={item}
            design={design}
            role={role}
            onApprove={handleApproveDesign}
            onRequestRevision={handleRequestRevision}
          />
        );
      })}

      {filteredItems.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">No designs match this filter</p>
      )}
    </div>
  );
};

const FloralItemDesignCard = ({
  item,
  design,
  role,
  onApprove,
  onRequestRevision,
}: {
  item: FloralItem;
  design?: FloralItemDesign;
  role: string;
  onApprove: (id: string) => void;
  onRequestRevision: (id: string, note: string) => void;
}) => {
  const hasPhotos = design && design.photos.length > 0;
  const [noteValue, setNoteValue] = useState(design?.freelancerNote || "");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const status = design?.designStatus || "in_review";
  const statusConfig = DESIGN_STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;

  return (
    <div data-item-id={design?.id} className="bg-card rounded-lg border border-border overflow-hidden transition-all duration-500">
      {/* Item Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flower2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{item.name}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">×{item.quantity}</span>
        </div>
        {hasPhotos && (
          <span className={cn("flex items-center gap-1 text-xs font-medium", statusConfig.color)}>
            <StatusIcon className="w-3.5 h-3.5" /> {statusConfig.label}
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
          {role === "freelancer" && hasPhotos ? (
            isEditingNote ? (
              <div className="space-y-2">
                <textarea
                  value={noteValue}
                  onChange={(e) => setNoteValue(e.target.value)}
                  placeholder="Add a note about this design..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setNoteValue(design?.freelancerNote || ""); setIsEditingNote(false); }}
                    className="py-1.5 px-3 rounded-lg bg-muted text-muted-foreground text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingNote(true)}
                className="w-full text-left text-sm text-muted-foreground italic hover:text-foreground transition-colors"
              >
                {noteValue ? `"${noteValue}"` : "+ Add a note..."}
              </button>
            )
          ) : (
            design?.freelancerNote && (
              <p className="text-sm text-muted-foreground italic">"{design.freelancerNote}"</p>
            )
          )}

          {/* Needs Revision — Admin note prominently shown */}
          {status === "needs_revision" && design.adminNote && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
              <p className="text-xs font-medium text-warning mb-1">Revision Requested</p>
              <p className="text-sm text-foreground">{design.adminNote}</p>
            </div>
          )}

          {/* Freelancer: re-upload when revision requested */}
          {role === "freelancer" && status === "needs_revision" && (
            <button className="w-full py-2.5 rounded-lg bg-warning/10 border border-warning/20 text-warning text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-warning/15 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Upload Revised Design
            </button>
          )}

          {/* Admin Actions */}
          {role === "admin" && status === "in_review" && !showRevisionInput && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onApprove(design.id)}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => setShowRevisionInput(true)}
                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg bg-muted text-muted-foreground hover:bg-warning/10 hover:text-warning transition-colors"
              >
                Request Revision
              </button>
            </div>
          )}

          {/* Admin: Revision note input */}
          {role === "admin" && showRevisionInput && (
            <div className="space-y-2 bg-muted/50 rounded-lg p-3">
              <p className="text-xs font-medium text-foreground">Revision Note</p>
              <textarea
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="Describe what needs to change..."
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (revisionNote.trim()) {
                      onRequestRevision(design.id, revisionNote.trim());
                      setRevisionNote("");
                      setShowRevisionInput(false);
                    }
                  }}
                  disabled={!revisionNote.trim()}
                  className="flex-1 py-1.5 rounded-lg bg-warning text-foreground text-xs font-medium disabled:opacity-50"
                >
                  Send Revision Request
                </button>
                <button
                  onClick={() => { setRevisionNote(""); setShowRevisionInput(false); }}
                  className="py-1.5 px-3 rounded-lg bg-muted text-muted-foreground text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Revision History */}
          {design.revisionHistory.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {showHistory ? "Hide" : "Show"} revision history ({design.revisionHistory.length})
              </button>
              {showHistory && (
                <div className="mt-2 space-y-2">
                  {design.revisionHistory.map((rev) => (
                    <div key={rev.id} className="bg-muted/50 rounded-lg p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={cn("font-medium", DESIGN_STATUS_CONFIG[rev.status].color)}>
                          {DESIGN_STATUS_CONFIG[rev.status].label}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(rev.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {rev.adminNote && <p className="text-muted-foreground">"{rev.adminNote}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Freelancer: upload more (max 3) */}
          {role === "freelancer" && status !== "needs_revision" && design.photos.length < 3 && (
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