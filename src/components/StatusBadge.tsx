import { ProjectStatus, STATUS_CONFIG, getAssignedSubCategory, isPartiallyFilled, Project, FreelancerResponse } from "@/data/mockData";
import { cn } from "@/lib/utils";

export type FreelancerCardStatus = "interested" | "unavailable" | "assigned" | "pending_approval" | null;

interface StatusBadgeProps {
  status: ProjectStatus;
  project?: Project;
  className?: string;
  /** When provided, shows freelancer-specific status instead of project status */
  freelancerStatus?: FreelancerCardStatus;
}

const FREELANCER_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  interested: { label: "I'm Interested", color: "text-primary", bgColor: "bg-primary/10" },
  pending_approval: { label: "Pending Approval", color: "text-warning", bgColor: "bg-warning/10" },
  unavailable: { label: "Unavailable", color: "text-muted-foreground", bgColor: "bg-muted" },
  assigned: { label: "Assigned", color: "text-success", bgColor: "bg-success/10" },
};

const SUB_CATEGORY_CONFIG = {
  upcoming: { label: "Upcoming", color: "text-info", bgColor: "bg-info/10" },
  in_progress: { label: "In Progress", color: "text-primary", bgColor: "bg-primary/10" },
};

const StatusBadge = ({ status, project, className, freelancerStatus }: StatusBadgeProps) => {
  // Freelancer-specific badge
  if (freelancerStatus) {
    const fConfig = FREELANCER_STATUS_CONFIG[freelancerStatus];
    if (fConfig) {
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
            fConfig.bgColor,
            fConfig.color,
            className
          )}
        >
          {fConfig.label}
        </span>
      );
    }
  }

  const config = STATUS_CONFIG[status];

  // For unassigned projects that are partially filled
  if (status === "unassigned" && project && isPartiallyFilled(project)) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
          "bg-warning/10 text-warning",
          className
        )}
      >
        Partially Assigned
      </span>
    );
  }

  // For assigned projects, show sub-category if we have the project data
  if (status === "assigned" && project) {
    const sub = getAssignedSubCategory(project);
    if (sub) {
      const subConfig = SUB_CATEGORY_CONFIG[sub];
      return (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
            subConfig.bgColor,
            subConfig.color,
            className
          )}
        >
          {subConfig.label}
        </span>
      );
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
