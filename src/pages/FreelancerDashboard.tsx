import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import ProjectCard from "@/components/ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getDesignersRemaining } from "@/data/mockData";

type Tab = "open" | "pending" | "my";

const FreelancerDashboard = () => {
  const [tab, setTab] = useState<Tab>("open");
  const { user } = useAuth();
  const { projects, profiles, loading, refetch } = useProjects();
  const { profile } = useUserProfile();

  const userId = user?.id;

  // Freelancer's response per project
  const getMyResponse = (projectId: string) =>
    projects
      .find((p) => p.id === projectId)
      ?.freelancerResponses.find((r) => r.freelancerId === userId);

  // OPEN: Unassigned projects where freelancer has NOT marked "available" (those go to Pending)
  const openProjects = projects
    .filter((p) => {
      if (p.status !== "unassigned") return false;
      // Exclude projects where this freelancer already expressed interest (those are in Pending)
      if (userId) {
        const response = p.freelancerResponses.find((r) => r.freelancerId === userId);
        if (response?.status === "available") return false;
      }
      return true;
    })
    .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());

  // PENDING: Unassigned projects where freelancer marked "available" but not yet assigned
  const pendingProjects = projects
    .filter((p) => {
      if (!userId) return false;
      const response = p.freelancerResponses.find((r) => r.freelancerId === userId);
      return (
        response?.status === "available" &&
        p.status === "unassigned" &&
        !p.assignedFreelancerIds.includes(userId)
      );
    })
    .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());

  // MY PROJECTS: Assigned projects
  const myProjects = projects
    .filter((p) => userId && p.assignedFreelancerIds.includes(userId))
    .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());

  // Projects where freelancer was interested but project is now assigned/completed and they weren't picked
  const notSelectedProjects = projects.filter((p) => {
    if (!userId) return false;
    const response = p.freelancerResponses.find((r) => r.freelancerId === userId);
    return (
      response?.status === "available" &&
      p.status !== "unassigned" &&
      !p.assignedFreelancerIds.includes(userId)
    );
  });

  const handleReactivate = async (projectId: string) => {
    if (!userId) return;
    try {
      // Check if response already exists
      const { data: existing } = await supabase
        .from("freelancer_responses")
        .select("id, status")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("freelancer_responses")
          .update({ status: "available" as any })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("freelancer_responses")
          .insert({ project_id: projectId, user_id: userId, status: "available" as any });
      }
      toast.success("Marked as interested!");
      refetch();
    } catch {
      toast.error("Failed to update — please try again");
    }
  };

  const tabs: { label: string; value: Tab; count: number }[] = [
    { label: "Open", value: "open", count: openProjects.length },
    { label: "Pending", value: "pending", count: pendingProjects.length },
    { label: "My Projects", value: "my", count: myProjects.length },
  ];

  const displayProjects =
    tab === "open" ? openProjects : tab === "pending" ? pendingProjects : myProjects;

  return (
    <AppLayout role="freelancer" title="Projects">
      <div className="space-y-5">
        {/* Tab Switch */}
        <div className="flex bg-muted rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                tab === t.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {t.label} ({t.count})
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
            {/* Not selected message for Pending tab */}
            {tab === "pending" && notSelectedProjects.length > 0 && (
              <div className="bg-muted/50 rounded-2xl p-4 text-center text-sm text-muted-foreground">
                <p>
                  Thanks{profile.firstName ? `, ${profile.firstName}` : ""}! {notSelectedProjects.length === 1 ? "A project" : `${notSelectedProjects.length} projects`} you expressed interest in {notSelectedProjects.length === 1 ? "is" : "are"} no longer available.
                </p>
              </div>
            )}

            {tab === "open" &&
              displayProjects.map((project, i) => {
                const myResponse = getMyResponse(project.id);
                const isUnavailable = myResponse?.status === "unavailable";
                const canReactivate =
                  isUnavailable &&
                  project.status === "unassigned" &&
                  getDesignersRemaining(project) > 0;

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(isUnavailable && "opacity-50 grayscale-[30%]")}
                  >
                      <ProjectCard project={project} role="freelancer" profiles={profiles} />
                    {canReactivate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReactivate(project.id);
                        }}
                        className="w-full mt-1 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        I'm Available
                      </button>
                    )}
                  </motion.div>
                );
              })}

            {tab === "pending" &&
              displayProjects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                    <ProjectCard project={project} role="freelancer" profiles={profiles} />
                </motion.div>
              ))}

            {tab === "my" &&
              displayProjects.map((project, i) => (
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
                {tab === "open" && "No open projects right now"}
                {tab === "pending" && notSelectedProjects.length === 0 && "No pending projects — express interest in an open project to see it here"}
                {tab === "my" && "You haven't been assigned to any projects yet"}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FreelancerDashboard;
