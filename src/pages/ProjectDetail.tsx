import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { mockProjects, mockFreelancers, Project } from "@/data/mockData";
import { Calendar, MapPin, DollarSign, Truck, Check, X, Camera, AlertCircle, CheckCircle2, Image } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ProjectDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as "admin" | "freelancer") || "admin";
  const project = mockProjects.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "designs">("overview");

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
          <StatusBadge status={project.status} />
          <span className="text-lg font-bold font-display text-foreground">${project.pay}</span>
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

const OverviewTab = ({ project, role, assignedFreelancer }: { project: Project; role: string; assignedFreelancer: any }) => (
  <div className="space-y-4">
    {/* Details Card */}
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>{new Date(project.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · {project.time}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span>{project.location}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Truck className="w-4 h-4" />
        <span>{project.deliveryMethod === "ship" ? "Shipped to freelancer" : "Pickup from wholesaler"}</span>
      </div>
    </div>

    {/* Description */}
    <div className="bg-card rounded-lg border border-border p-4 space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Description</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
    </div>

    {/* Mood */}
    <div className="bg-card rounded-lg border border-border p-4 space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Style & Mood</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{project.moodDescription}</p>
    </div>

    {/* Inspiration Photos */}
    {project.inspirationPhotos.length > 0 && (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Inspiration</h3>
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
    {role === "freelancer" && project.status === "open" && (
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

const DesignsTab = ({ project, role }: { project: Project; role: string }) => (
  <div className="space-y-4">
    {project.designs.length > 0 ? (
      project.designs.map((design) => (
        <div key={design.id} className="bg-card rounded-lg border border-border overflow-hidden">
          <img src={design.photoUrl} alt="Design" className="w-full aspect-[4/3] object-cover" />
          <div className="p-3 space-y-2">
            {design.note && (
              <p className="text-sm text-muted-foreground">{design.note}</p>
            )}
            <div className="flex items-center justify-between">
              {design.approved ? (
                <span className="flex items-center gap-1 text-xs text-success font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Approved
                </span>
              ) : design.revisionRequested ? (
                <div className="space-y-1">
                  <span className="flex items-center gap-1 text-xs text-warning font-medium">
                    <AlertCircle className="w-4 h-4" /> Revision Requested
                  </span>
                  {design.revisionNote && (
                    <p className="text-xs text-muted-foreground pl-5">{design.revisionNote}</p>
                  )}
                </div>
              ) : role === "admin" ? (
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground">Approve</button>
                  <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-muted-foreground">Request Revision</button>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Awaiting review</span>
              )}
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8 space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted">
          <Image className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No designs uploaded yet</p>
        {role === "freelancer" && (
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground">
            <Camera className="w-4 h-4 inline mr-1.5" />
            Upload Design Photo
          </button>
        )}
      </div>
    )}

    {role === "freelancer" && project.designs.length > 0 && (
      <button className="w-full py-3 rounded-lg border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
        <Camera className="w-4 h-4 inline mr-1.5" />
        Upload Another Design
      </button>
    )}
  </div>
);

export default ProjectDetail;
