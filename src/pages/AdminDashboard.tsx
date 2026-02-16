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

  const stats = {
    unassigned: mockProjects.filter((p) => p.status === "unassigned").length,
    needsReview: mockProjects.filter((p) => getAttentionFlags(p).needsReview).length,
    completed: mockProjects.filter((p) => p.status === "completed").length,
  };

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
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Unassigned", value: stats.unassigned, color: "bg-warning/10 text-warning" },
            { label: "Needs Review", value: stats.needsReview, color: "bg-accent text-accent-foreground" },
            { label: "Done", value: stats.completed, color: "bg-success/10 text-success" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-lg p-3 text-center ${stat.color}`}>
              <div className="text-2xl font-bold font-display">{stat.value}</div>
              <div className="text-xs font-medium mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
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
