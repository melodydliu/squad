import { Project, mockFreelancers, getAttentionFlags, getAssignedSubCategory } from "@/data/mockData";
import StatusBadge from "./StatusBadge";
import { Calendar, MapPin, DollarSign, Users, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  role: "admin" | "freelancer";
}

const ProjectCard = ({ project, role }: ProjectCardProps) => {
  const navigate = useNavigate();
  const assignedFreelancer = project.assignedFreelancerId
    ? mockFreelancers.find((f) => f.id === project.assignedFreelancerId)
    : null;

  const attention = role === "admin" ? getAttentionFlags(project) : { needsReview: false, reasons: [] };

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
        "bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer border overflow-hidden",
        attention.needsReview
          ? "border-warning ring-1 ring-warning/30"
          : "border-border"
      )}
    >
      {project.inspirationPhotos.length > 0 && (
        <div className="h-32 overflow-hidden">
          <img
            src={project.inspirationPhotos[0]}
            alt={project.eventName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-foreground leading-tight">
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

        {/* Admin: freelancer info (only if no attention flag showing) */}
        {role === "admin" && !attention.needsReview && (
          <div className="flex items-center gap-2 pt-1 border-t border-border">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {assignedFreelancer
                ? `Assigned: ${assignedFreelancer.name}`
                : `${project.interestedFreelancerIds.length} interested`}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;
