import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import ProjectCard from "@/components/ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const FreelancerDashboard = () => {
  const [tab, setTab] = useState<"available" | "my">("available");
  const { user } = useAuth();
  const { projects, profiles, loading } = useProjects();

  const userId = user?.id;

  const availableProjects = projects
    .filter((p) => p.status === "unassigned")
    .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());

  const myProjects = projects
    .filter((p) =>
      userId && (
        p.assignedFreelancerIds.includes(userId) ||
        p.interestedFreelancerIds.includes(userId)
      )
    )
    .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());

  const displayProjects = tab === "available" ? availableProjects : myProjects;

  return (
    <AppLayout role="freelancer" title="Projects">
      <div className="space-y-5">
        {/* Tab Switch */}
        <div className="flex bg-muted rounded-lg p-1">
          {[
            { label: "Available Projects", value: "available" as const },
            { label: "My Projects", value: "my" as const },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === t.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
          </div>
        )}

        {/* Projects */}
        {!loading && (
          <div className="space-y-3">
            {displayProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProjectCard project={project} role="freelancer" profiles={profiles} />
              </motion.div>
            ))}
            {displayProjects.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {tab === "available" ? "No open projects right now" : "You haven't joined any projects yet"}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FreelancerDashboard;
