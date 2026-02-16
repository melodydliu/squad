import { useState, useCallback } from "react";

export type Channel = "email" | "sms" | "in_app";

export interface NotificationEvent {
  id: string;
  label: string;
  description: string;
  category: string;
}

export const FREELANCER_EVENTS: NotificationEvent[] = [
  // Project Opportunities
  { id: "new_project", label: "New project posted", description: "A new project is available for you to express interest.", category: "Project Opportunities" },
  // Assignment
  { id: "assigned", label: "Assigned to project", description: "You've been approved or assigned to a project.", category: "Assignment" },
  { id: "removed", label: "Removed from project", description: "You've been removed from a project assignment.", category: "Assignment" },
  // Project Changes
  { id: "details_updated", label: "Project details updated", description: "The admin updated project details you're assigned to.", category: "Project Changes" },
  { id: "timeline_updated", label: "Timeline or logistics updated", description: "Schedule or logistics changes on your project.", category: "Project Changes" },
  { id: "recipes_updated", label: "Recipes or files updated", description: "Floral recipes or attached files were changed.", category: "Project Changes" },
  // Design Feedback
  { id: "revision_requested", label: "Revision requested", description: "The admin requested revisions on your designs.", category: "Design Feedback" },
  { id: "admin_comment", label: "Admin added comment", description: "A new note or comment from the admin.", category: "Design Feedback" },
  // Inventory
  { id: "flag_response", label: "Flagged item response", description: "Admin responded to an item you flagged.", category: "Inventory" },
  { id: "inventory_instructions", label: "Inventory updates", description: "New instructions or updates on inventory items.", category: "Inventory" },
];

export const ADMIN_EVENTS: NotificationEvent[] = [
  // Freelancer Responses
  { id: "freelancer_available", label: "Freelancer marked available", description: "A freelancer expressed interest in an unassigned project.", category: "Freelancer Responses" },
  { id: "freelancer_declined", label: "Freelancer declined", description: "A freelancer declined a project invitation.", category: "Freelancer Responses" },
  // Design Activity
  { id: "photos_uploaded", label: "Photos uploaded", description: "A freelancer uploaded new arrangement photos.", category: "Design Activity" },
  { id: "freelancer_comment", label: "Freelancer added comment", description: "A freelancer left a note or comment.", category: "Design Activity" },
  { id: "revision_completed", label: "Revision completed", description: "A freelancer completed a requested revision.", category: "Design Activity" },
  // Inventory Activity
  { id: "item_flagged", label: "Item flagged", description: "A freelancer flagged an inventory item for review.", category: "Inventory Activity" },
  { id: "inventory_note", label: "Note added to item", description: "A note was added to an inventory item.", category: "Inventory Activity" },
  { id: "inventory_approved", label: "Inventory list approved", description: "Full flower or hard goods list was approved.", category: "Inventory Activity" },
  // Project Status
  { id: "project_completed", label: "Project completed", description: "A freelancer marked a project as completed.", category: "Project Status" },
  { id: "upcoming_reminder", label: "Upcoming project reminder", description: "Reminder for a project approaching its event date.", category: "Project Status" },
];

export type Preferences = Record<string, Record<Channel, boolean>>;

function getDefaultPreferences(role: "admin" | "freelancer"): Preferences {
  const events = role === "admin" ? ADMIN_EVENTS : FREELANCER_EVENTS;
  const prefs: Preferences = {};

  if (role === "freelancer") {
    for (const ev of events) {
      prefs[ev.id] = {
        in_app: true,
        email: ["assigned", "removed", "revision_requested"].includes(ev.id),
        sms: ev.id === "assigned",
      };
    }
  } else {
    for (const ev of events) {
      prefs[ev.id] = {
        in_app: true,
        email: ["photos_uploaded", "item_flagged", "freelancer_available", "inventory_approved"].includes(ev.id),
        sms: ev.id === "item_flagged",
      };
    }
  }

  return prefs;
}

const STORAGE_KEY_PREFIX = "bloom_notif_prefs_";

function loadPreferences(role: "admin" | "freelancer"): Preferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + role);
    if (stored) return JSON.parse(stored);
  } catch {}
  return getDefaultPreferences(role);
}

export function useNotificationPreferences(role: "admin" | "freelancer") {
  const [preferences, setPreferences] = useState<Preferences>(() => loadPreferences(role));

  const toggle = useCallback((eventId: string, channel: Channel) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        [eventId]: {
          ...prev[eventId],
          [channel]: !prev[eventId]?.[channel],
        },
      };
      localStorage.setItem(STORAGE_KEY_PREFIX + role, JSON.stringify(updated));
      return updated;
    });
  }, [role]);

  return { preferences, toggle, events: role === "admin" ? ADMIN_EVENTS : FREELANCER_EVENTS };
}
