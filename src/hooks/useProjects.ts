import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  Project, FloralItem, FloralItemDesign, FlowerInventoryRow,
  HardGoodInventoryRow, FreelancerResponse, FieldVisibility, DEFAULT_VISIBILITY
} from "@/data/mockData";

// DB row types (since generated types may not have them yet)
interface DbProject {
  id: string;
  created_by: string;
  event_name: string;
  date_start: string;
  date_end: string;
  timeline: string;
  location: string;
  pay: number;
  total_hours: number;
  description: string;
  design_guide: string;
  transport_method: string;
  service_level: string[];
  day_of_contact: string;
  status: string;
  designers_needed: number;
  inventory_confirmed: boolean;
  flowers_confirmed: boolean;
  hard_goods_confirmed: boolean;
  quality_status: string | null;
  quality_note: string | null;
  field_visibility: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface FreelancerProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  website: string | null;
}

function mapDbToProject(
  db: DbProject,
  assignments: { user_id: string }[],
  responses: { user_id: string; status: string; note: string | null; created_at: string }[],
  floralItems: { id: string; name: string; quantity: number }[],
  floralItemDesigns: FloralItemDesign[],
  flowerInv: FlowerInventoryRow[],
  hardGoodInv: HardGoodInventoryRow[],
  inspirationPhotos: string[],
): Project {
  return {
    id: db.id,
    eventName: db.event_name,
    dateStart: db.date_start,
    dateEnd: db.date_end,
    timeline: db.timeline,
    location: db.location,
    pay: Number(db.pay),
    totalHours: Number(db.total_hours),
    description: db.description,
    designGuide: db.design_guide,
    transportMethod: db.transport_method as any,
    serviceLevel: db.service_level as any[],
    dayOfContact: db.day_of_contact,
    status: db.status as any,
    designersNeeded: db.designers_needed,
    inspirationPhotos: inspirationPhotos,
    recipes: [],
    assignedFreelancerIds: assignments.map((a) => a.user_id),
    interestedFreelancerIds: responses.filter((r) => r.status === "available").map((r) => r.user_id),
    inventoryConfirmed: db.inventory_confirmed,
    flowersConfirmed: db.flowers_confirmed,
    hardGoodsConfirmed: db.hard_goods_confirmed,
    qualityStatus: db.quality_status as any,
    qualityNote: db.quality_note ?? undefined,
    flowerInventory: flowerInv,
    hardGoodInventory: hardGoodInv,
    designs: [],
    floralItems: floralItems.map((fi) => ({ id: fi.id, name: fi.name, quantity: fi.quantity })),
    floralItemDesigns: floralItemDesigns,
    freelancerResponses: responses.map((r) => ({
      freelancerId: r.user_id,
      status: r.status as any,
      note: r.note ?? undefined,
      timestamp: r.created_at,
    })),
    fieldVisibility: db.field_visibility as FieldVisibility,
    createdAt: db.created_at,
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Map<string, FreelancerProfile>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all projects
      const { data: dbProjects, error } = await (supabase as any)
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !dbProjects) {
        console.error("Error fetching projects:", error);
        setProjects([]);
        setLoading(false);
        return;
      }

      const projectIds = dbProjects.map((p: any) => p.id);
      if (projectIds.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Fetch all related data in parallel
      const [
        { data: assignments },
        { data: responses },
        { data: floralItemsData },
        { data: floralDesignsData },
        { data: designPhotosData },
        { data: designRevisionsData },
        { data: flowerInvData },
        { data: hardGoodInvData },
        { data: inspirationData },
      ] = await Promise.all([
        (supabase as any).from("project_assignments").select("*").in("project_id", projectIds),
        (supabase as any).from("freelancer_responses").select("*").in("project_id", projectIds),
        (supabase as any).from("floral_items").select("*").in("project_id", projectIds).order("sort_order"),
        (supabase as any).from("floral_item_designs").select("*").in("project_id", projectIds),
        (supabase as any).from("design_photos").select("*"),
        (supabase as any).from("design_revisions").select("*"),
        (supabase as any).from("flower_inventory").select("*").in("project_id", projectIds).order("sort_order"),
        (supabase as any).from("hard_good_inventory").select("*").in("project_id", projectIds).order("sort_order"),
        (supabase as any).from("inspiration_photos").select("*").in("project_id", projectIds).order("sort_order"),
      ]);

      // Collect all user IDs for profile lookup
      const userIds = new Set<string>();
      (assignments || []).forEach((a: any) => userIds.add(a.user_id));
      (responses || []).forEach((r: any) => userIds.add(r.user_id));

      // Fetch profiles for all referenced users
      if (userIds.size > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", Array.from(userIds));

        const profileMap = new Map<string, FreelancerProfile>();
        (profilesData || []).forEach((p) => {
          profileMap.set(p.user_id, {
            userId: p.user_id,
            firstName: p.first_name,
            lastName: p.last_name,
            email: p.email,
            phone: p.phone,
            avatarUrl: p.avatar_url || "",
            website: p.website,
          });
        });
        setProfiles(profileMap);
      }

      // Filter design photos to only those belonging to fetched designs
      const designIds = (floralDesignsData || []).map((d: any) => d.id);
      const relevantPhotos = (designPhotosData || []).filter((p: any) => designIds.includes(p.floral_item_design_id));
      const relevantRevisions = (designRevisionsData || []).filter((r: any) => designIds.includes(r.floral_item_design_id));

      // Build projects
      const mapped = dbProjects.map((dbP: DbProject) => {
        const pAssignments = (assignments || []).filter((a: any) => a.project_id === dbP.id);
        const pResponses = (responses || []).filter((r: any) => r.project_id === dbP.id);
        const pFloralItems = (floralItemsData || []).filter((fi: any) => fi.project_id === dbP.id);
        const pFlowerInv: FlowerInventoryRow[] = (flowerInvData || [])
          .filter((fi: any) => fi.project_id === dbP.id)
          .map((fi: any) => ({
            id: fi.id,
            flower: fi.flower,
            color: fi.color,
            stemsInRecipe: fi.stems_in_recipe,
            totalOrdered: fi.total_ordered,
            extras: fi.extras,
            status: fi.status ?? undefined,
            qualityNotes: fi.quality_notes ?? undefined,
            photoUrl: fi.photo_url ?? undefined,
            updatedBy: fi.updated_by ?? undefined,
            updatedAt: fi.updated_at ?? undefined,
          }));
        const pHardGoodInv: HardGoodInventoryRow[] = (hardGoodInvData || [])
          .filter((hg: any) => hg.project_id === dbP.id)
          .map((hg: any) => ({
            id: hg.id,
            item: hg.item,
            quantity: hg.quantity,
            status: hg.status ?? undefined,
            notes: hg.notes ?? undefined,
            photoUrl: hg.photo_url ?? undefined,
            updatedBy: hg.updated_by ?? undefined,
            updatedAt: hg.updated_at ?? undefined,
          }));
        const pInspirationPhotos = (inspirationData || [])
          .filter((ip: any) => ip.project_id === dbP.id)
          .map((ip: any) => ip.photo_url);

        // Build floral item designs
        const pFloralDesigns: FloralItemDesign[] = (floralDesignsData || [])
          .filter((d: any) => d.project_id === dbP.id)
          .map((d: any) => {
            const photos = relevantPhotos
              .filter((p: any) => p.floral_item_design_id === d.id)
              .map((p: any) => ({ id: p.id, photoUrl: p.photo_url }));
            const revisions = relevantRevisions
              .filter((r: any) => r.floral_item_design_id === d.id)
              .map((r: any) => ({
                id: r.id,
                photoUrl: r.photo_url,
                note: r.note ?? undefined,
                timestamp: r.created_at,
                status: r.status,
                adminNote: r.admin_note ?? undefined,
              }));
            return {
              id: d.id,
              floralItemId: d.floral_item_id,
              photos,
              freelancerNote: d.freelancer_note ?? undefined,
              approved: d.design_status === "approved",
              revisionRequested: d.design_status === "needs_revision",
              adminNote: d.admin_note ?? undefined,
              designStatus: d.design_status,
              revisionHistory: revisions,
            };
          });

        return mapDbToProject(
          dbP, pAssignments, pResponses, pFloralItems,
          pFloralDesigns, pFlowerInv, pHardGoodInv, pInspirationPhotos
        );
      });

      // Sort by closest date to today first
      const now = new Date().getTime();
      mapped.sort((a, b) => {
        const diffA = Math.abs(new Date(a.dateStart).getTime() - now);
        const diffB = Math.abs(new Date(b.dateStart).getTime() - now);
        return diffA - diffB;
      });

      setProjects(mapped);
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, profiles, loading, refetch: fetchProjects };
}
