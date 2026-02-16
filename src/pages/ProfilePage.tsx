import AppLayout from "@/components/AppLayout";
import { mockFreelancers } from "@/data/mockData";
import { Mail, Phone, ExternalLink } from "lucide-react";

const ProfilePage = () => {
  const user = mockFreelancers[0]; // Simulated

  return (
    <AppLayout role="freelancer" title="Profile">
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center space-y-3 py-4">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-sage-light"
          />
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">{user.name}</h2>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.available ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            }`}>
              {user.available ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border divide-y divide-border">
          <div className="flex items-center gap-3 p-4">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{user.phone}</span>
          </div>
          {user.portfolioUrl && (
            <div className="flex items-center gap-3 p-4">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <a href={user.portfolioUrl} className="text-sm text-primary hover:underline">{user.portfolioUrl}</a>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm font-medium text-foreground mb-2">Project History</div>
          <div className="text-2xl font-bold font-display text-primary">{user.projectHistory.length}</div>
          <div className="text-xs text-muted-foreground">completed projects</div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
