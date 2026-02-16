import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import ProjectCard from "@/components/ProjectCard";
import { mockProjects, ProjectStatus } from "@/data/mockData";
import { motion } from "framer-motion";

const FREELANCER_ID = "f1"; // Simulated logged-in freelancer

const FreelancerDashboard = () => {
  const [tab, setTab] = useState<"available" | "my">("available");

  const availableProjects = mockProjects.filter((p) => p.status === "unassigned");
  const myProjects = mockProjects.filter(
    (p) => p.assignedFreelancerId === FREELANCER_ID || p.interestedFreelancerIds.includes(FREELANCER_ID)
  );

  const projects = tab === "available" ? availableProjects : myProjects;

  return (
    <AppLayout role="freelancer" title="Projects">
      <div className="space-y-5">
        {/* Tab Switch */}
        <div className="flex bg-muted rounded-lg p-1">
          {[
            { label: "Available", value: "available" as const },
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

        {/* Projects */}
        <div className="space-y-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProjectCard project={project} role="freelancer" />
            </motion.div>
          ))}
          {projects.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {tab === "available" ? "No open projects right now" : "You haven't joined any projects yet"}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default FreelancerDashboard;
