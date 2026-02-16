import { useState } from "react";
import { Project, Freelancer, mockFreelancers, FreelancerResponse, Notification } from "@/data/mockData";
import { Check, ExternalLink, Mail, Phone, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FreelancerResponsePanelProps {
  project: Project;
  onApprove: (freelancerId: string) => void;
}

const FreelancerResponsePanel = ({ project, onApprove }: FreelancerResponsePanelProps) => {
  const responses = project.freelancerResponses || [];
  const available = responses.filter((r) => r.status === "available");
  const unavailable = responses.filter((r) => r.status === "unavailable");
  const assigned = project.assignedFreelancerIds.length;
  const needed = project.designersNeeded;
  const remaining = Math.max(0, needed - assigned);
  const isFull = remaining === 0;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header with staffing progress */}
      <div className="px-4 py-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Freelancer Responses</h3>
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              isFull
                ? "text-success bg-success/10"
                : "text-warning bg-warning/10"
            )}
          >
            {assigned} / {needed} filled
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (assigned / needed) * 100)}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* Available Freelancers */}
        {available.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">
              Available ({available.length})
            </p>
            <AnimatePresence>
              {available.map((resp) => {
                const freelancer = mockFreelancers.find((f) => f.id === resp.freelancerId);
                if (!freelancer) return null;
                const isAssigned = project.assignedFreelancerIds.includes(freelancer.id);
                return (
                  <motion.div
                    key={freelancer.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      isAssigned ? "bg-success/5 border-success/20" : "bg-card border-border"
                    )}
                  >
                    <img
                      src={freelancer.avatarUrl}
                      alt={freelancer.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {freelancer.name}
                        </span>
                        {freelancer.projectHistory.length > 0 && (
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">
                            {freelancer.projectHistory.length} past
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {freelancer.portfolioUrl && (
                          <a
                            href={freelancer.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> Portfolio
                          </a>
                        )}
                        <a
                          href={`mailto:${freelancer.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${freelancer.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {isAssigned ? (
                      <span className="flex items-center gap-1 text-xs text-success font-medium shrink-0">
                        <Check className="w-3.5 h-3.5" /> Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => onApprove(freelancer.id)}
                        disabled={isFull}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded-lg shrink-0 transition-colors",
                          isFull
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-primary text-primary-foreground active:scale-95"
                        )}
                      >
                        Approve
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Unavailable Freelancers */}
        {unavailable.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Unavailable ({unavailable.length})
            </p>
            {unavailable.map((resp) => {
              const freelancer = mockFreelancers.find((f) => f.id === resp.freelancerId);
              if (!freelancer) return null;
              return (
                <div
                  key={freelancer.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm text-muted-foreground">{freelancer.name}</span>
                    {resp.note && (
                      <p className="text-xs text-muted-foreground/70 italic truncate">{resp.note}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No responses */}
        {responses.length === 0 && (
          <div className="text-center py-6">
            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No freelancer responses yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerResponsePanel;
