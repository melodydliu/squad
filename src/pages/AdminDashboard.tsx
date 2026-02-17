import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ProjectCard from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { ProjectStatus, getAssignedSubCategory, getAttentionFlags } from "@/data/mockData";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type FilterValue = "all" | ProjectStatus | "pending";

const statusFilters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Unassigned", value: "unassigned" },
  { label: "Pending", value: "pending" },
  { label: "Assigned", value: "assigned" },
  { label: "Completed", value: "completed" },
];

const AdminDashboard = () => {
  const [filter, setFilter] = useState<FilterValue>("all");
  const navigate = useNavigate();
  const { projects, profiles, loading } = useProjects();

  // Pending = unassigned projects with freelancer interest
  const pendingProjects = projects.filter(
    (p) => p.status === "unassigned" && p.interestedFreelancerIds.length > 0
  );
  // Pure unassigned = no interest yet
  const pureUnassigned = projects.filter(
    (p) => p.status === "unassigned" && p.interestedFreelancerIds.length === 0
  );

  const filtered = filter === "all"
    ? projects
    : filter === "pending"
    ? pendingProjects
    : filter === "unassigned"
    ? pureUnassigned
    : projects.filter((p) => p.status === filter);

  const assignedUpcoming = filtered.filter(
    (p) => p.status === "assigned" && getAssignedSubCategory(p) === "upcoming"
  );
  const assignedInProgress = filtered.filter(
    (p) => p.status === "assigned" && getAssignedSubCategory(p) === "in_progress"
  );
  const showAssignedGroups = filter === "assigned" || filter === "all";
  const nonAssigned = filtered.filter((p) => p.status !== "assigned");

  const filterCounts: Record<FilterValue, number> = {
    all: projects.length,
    unassigned: pureUnassigned.length,
    pending: pendingProjects.length,
    assigned: projects.filter((p) => p.status === "assigned").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  const assignedNeedsReview = projects.filter(
    (p) => p.status === "assigned" && getAttentionFlags(p).needsReview
  ).length;

  const renderProjectList = (projectList: typeof projects, startIndex = 0) =>
    projectList.map((project, i) => (
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: (startIndex + i) * 0.05 }}
      >
        <ProjectCard project={project} role="admin" profiles={profiles} />
      </motion.div>
    ));

  return (
    <AppLayout
      role="admin"
      title="Dashboard"
      headerAction={
        <Button onClick={() => navigate("/admin/create")} size="sm" className="rounded-lg gap-1.5 h-8 px-3">
          <Plus className="w-3.5 h-3.5" />
          New
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pt-2 pb-1 scrollbar-hide">
          {statusFilters.map((f) => {
            const hasReviewDot = f.value === "assigned" && assignedNeedsReview > 0;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`relative px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  filter === f.value
                    ? "bg-foreground text-background"
                    : "bg-card text-muted-foreground hover:text-foreground"
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

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
          </div>
        )}

        {/* Project List */}
        {!loading && (
          <div className="space-y-6">
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

            {filter !== "assigned" && nonAssigned.length > 0 && (
              <div className="space-y-3">
                {filter === "all" && (
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
                {projects.length === 0 ? "No projects yet — create your first one!" : "No projects match this filter"}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
