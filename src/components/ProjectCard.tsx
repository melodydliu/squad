import { Project, mockFreelancers, getAttentionFlags, getAssignedSubCategory, getDesignersAssigned, getDesignersRemaining, isPartiallyFilled, getCompletionProgress } from "@/data/mockData";
import StatusBadge from "./StatusBadge";
import { Calendar, MapPin, DollarSign, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  role: "admin" | "freelancer";
}

const ProjectCard = ({ project, role }: ProjectCardProps) => {
  const navigate = useNavigate();
  const assignedFreelancers = project.assignedFreelancerIds
    .map((fId) => mockFreelancers.find((f) => f.id === fId))
    .filter(Boolean);
  const assigned = getDesignersAssigned(project);
  const remaining = getDesignersRemaining(project);
  const partiallyFilled = isPartiallyFilled(project);

  const attention = role === "admin" ? getAttentionFlags(project) : { needsReview: false, reasons: [] };
  const completion = role === "admin" && project.status === "assigned" ? getCompletionProgress(project) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        const params = new URLSearchParams({ role });
        if (attention.needsReview && attention.reviewTab) {
          params.set("tab", attention.reviewTab);
        }
        navigate(`/project/${project.id}?${params.toString()}`);
      }}
      className={cn(
        "bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden",
        attention.needsReview
          ? "ring-1 ring-warning/40"
          : ""
      )}
    >
      {project.inspirationPhotos.length > 0 && (
        <div className="h-36 overflow-hidden rounded-t-2xl">
          <img
            src={project.inspirationPhotos[0]}
            alt={project.eventName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 pt-4 space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold text-foreground leading-tight">
            {project.eventName}
          </h3>
          <StatusBadge status={project.status} project={project} />
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(project.dateStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {project.dateEnd !== project.dateStart && ` – ${new Date(project.dateEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
              {`, ${new Date(project.dateStart).getFullYear()}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{project.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">${project.pay}</span>
          </div>
        </div>

        {/* Attention flag */}
        {attention.needsReview && (
          <div className="flex items-center gap-2 pt-1 border-t border-warning/20">
            <AlertCircle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
            <span className="text-xs text-warning font-medium truncate">
              {attention.reasons[0]}
            </span>
            <span className="ml-auto text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full whitespace-nowrap">
              Review Now
            </span>
          </div>
        )}

        {/* Staffing info for unassigned / partially filled */}
        {role === "admin" && project.status === "unassigned" && (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Designers: {assigned} / {project.designersNeeded} assigned
              </span>
            </div>
            {remaining > 0 && (
              <span className="text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                Needs {remaining} more
              </span>
            )}
          </div>
        )}

        {/* Admin: freelancer info for assigned (only if no attention flag showing) */}
        {role === "admin" && project.status !== "unassigned" && !attention.needsReview && (
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {assignedFreelancers.length > 0
                ? `Assigned: ${assignedFreelancers.map(f => f!.name).join(", ")}`
                : `${project.interestedFreelancerIds.length} interested`}
            </span>
          </div>
        )}

        {/* Completion progress for assigned projects */}
        {completion && !completion.isComplete && (completion.designsTotal > 0 || completion.inventoryTotal > 0) && (
          <div className="space-y-1.5 pt-1 border-t border-border">
            {completion.designsTotal > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-16 shrink-0">Designs</span>
                <Progress value={(completion.designsApproved / completion.designsTotal) * 100} className="h-1.5 flex-1" />
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{completion.designsApproved}/{completion.designsTotal}</span>
              </div>
            )}
            {completion.inventoryTotal > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-16 shrink-0">Inventory</span>
                <Progress value={(completion.inventoryApproved / completion.inventoryTotal) * 100} className="h-1.5 flex-1" />
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{completion.inventoryApproved}/{completion.inventoryTotal}</span>
              </div>
            )}
          </div>
        )}

        {/* Project Complete badge */}
        {completion?.isComplete && (
          <div className="flex items-center gap-2 pt-1 border-t border-success/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
            <span className="text-xs text-success font-semibold">Project Complete</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;
