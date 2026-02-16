import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import ProjectCard from "@/components/ProjectCard";
import StatusBadge from "@/components/StatusBadge";
import { mockProjects, ProjectStatus } from "@/data/mockData";
import { motion } from "framer-motion";

const statusFilters: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Awaiting", value: "awaiting_approval" },
  { label: "Completed", value: "completed" },
];

const AdminDashboard = () => {
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");

  const filtered = filter === "all"
    ? mockProjects
    : mockProjects.filter((p) => p.status === filter);

  const stats = {
    active: mockProjects.filter((p) => ["open", "in_progress", "awaiting_freelancer"].includes(p.status)).length,
    awaiting: mockProjects.filter((p) => p.status === "awaiting_approval").length,
    completed: mockProjects.filter((p) => p.status === "completed").length,
  };

  return (
    <AppLayout role="admin" title="Dashboard">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active", value: stats.active, color: "bg-primary/10 text-primary" },
            { label: "Awaiting", value: stats.awaiting, color: "bg-accent text-accent-foreground" },
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
        <div className="space-y-3">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProjectCard project={project} role="admin" />
            </motion.div>
          ))}
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
