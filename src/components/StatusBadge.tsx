import { ProjectStatus, STATUS_CONFIG, getAssignedSubCategory, isPartiallyFilled, Project } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProjectStatus;
  project?: Project;
  className?: string;
}

const SUB_CATEGORY_CONFIG = {
  upcoming: { label: "Upcoming", color: "text-info", bgColor: "bg-info/12" },
  in_progress: { label: "In Progress", color: "text-sage", bgColor: "bg-sage/10" },
};

const StatusBadge = ({ status, project, className }: StatusBadgeProps) => {
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
