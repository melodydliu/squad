import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import ProjectCard from "@/components/ProjectCard";
import { mockProjects, ProjectStatus, getAssignedSubCategory, getAttentionFlags } from "@/data/mockData";
import { motion } from "framer-motion";

type FilterValue = "all" | ProjectStatus;

const statusFilters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Unassigned", value: "unassigned" },
  { label: "Assigned", value: "assigned" },
  { label: "Completed", value: "completed" },
];

const AdminDashboard = () => {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = filter === "all"
    ? mockProjects
    : mockProjects.filter((p) => p.status === filter);

  // For assigned filter, group into upcoming & in_progress
  const assignedUpcoming = filtered.filter(
    (p) => p.status === "assigned" && getAssignedSubCategory(p) === "upcoming"
  );
  const assignedInProgress = filtered.filter(
    (p) => p.status === "assigned" && getAssignedSubCategory(p) === "in_progress"
  );
  const showAssignedGroups = filter === "assigned" || filter === "all";
  const nonAssigned = filtered.filter((p) => p.status !== "assigned");

  const filterCounts: Record<FilterValue, number> = {
    all: mockProjects.length,
    unassigned: mockProjects.filter((p) => p.status === "unassigned").length,
    assigned: mockProjects.filter((p) => p.status === "assigned").length,
    completed: mockProjects.filter((p) => p.status === "completed").length,
  };

  const assignedNeedsReview = mockProjects.filter(
    (p) => p.status === "assigned" && getAttentionFlags(p).needsReview
  ).length;

  const renderProjectList = (projects: typeof mockProjects, startIndex = 0) =>
    projects.map((project, i) => (
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (startIndex + i) * 0.05 }}
      >
        <ProjectCard project={project} role="admin" />
      </motion.div>
    ));

  return (
    <AppLayout role="admin" title="Dashboard">
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pt-2 pb-1 -mx-1 px-1 scrollbar-hide">
          {statusFilters.map((f) => {
            const hasReviewDot = f.value === "assigned" && assignedNeedsReview > 0;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`relative px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f.label} ({filterCounts[f.value]})
                {hasReviewDot && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-background" />
                )}
              </button>
            );
          })}
        </div>

        {/* Project List */}
        <div className="space-y-5">
          {/* When showing assigned groups */}
          {showAssignedGroups && assignedInProgress.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Progress</h2>
              {renderProjectList(assignedInProgress)}
            </div>
          )}

          {showAssignedGroups && assignedUpcoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming</h2>
              {renderProjectList(assignedUpcoming, assignedInProgress.length)}
            </div>
          )}

          {/* Non-assigned projects (when filter is "all" or specific non-assigned filter) */}
          {filter !== "assigned" && nonAssigned.length > 0 && (
            <div className="space-y-3">
              {filter === "all" && (nonAssigned.some(p => p.status === "unassigned") || nonAssigned.some(p => p.status === "completed")) && (
                <>
                  {nonAssigned.filter(p => p.status === "unassigned").length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unassigned</h2>
                      {renderProjectList(nonAssigned.filter(p => p.status === "unassigned"), assignedInProgress.length + assignedUpcoming.length)}
                    </div>
                  )}
                  {nonAssigned.filter(p => p.status === "completed").length > 0 && (
                    <div className="space-y-3">
                      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</h2>
                      {renderProjectList(nonAssigned.filter(p => p.status === "completed"), assignedInProgress.length + assignedUpcoming.length + nonAssigned.filter(p => p.status === "unassigned").length)}
                    </div>
                  )}
                </>
              )}
              {filter !== "all" && renderProjectList(nonAssigned)}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No projects match this filter
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
