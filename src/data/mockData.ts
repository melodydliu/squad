import { Flower2, MapPin, Calendar, DollarSign, Clock, User, Camera, Package, CheckCircle2, AlertCircle, Eye } from "lucide-react";

export type ProjectStatus = "unassigned" | "assigned" | "completed";
export type TransportMethod = "personal_vehicle" | "uhaul_rental";
export type QualityStatus = "good" | "issue";
export type ServiceLevel = "design" | "delivery" | "setup" | "flip" | "strike";

// Derived sub-category for assigned projects
export type AssignedSubCategory = "upcoming" | "in_progress";

/** Controls which fields freelancers can see */
export type FieldVisibility = Record<string, boolean>;

export interface Project {
  id: string;
  eventName: string;
  dateStart: string;
  dateEnd: string;
  timeline: string;
  location: string;
  pay: number;
  totalHours: number;
  description: string;
  moodDescription: string;
  transportMethod: TransportMethod;
  serviceLevel: ServiceLevel[];
  dayOfContact: string;
  status: ProjectStatus;
  designersNeeded: number;
  inspirationPhotos: string[];
  recipes: string[];
  assignedFreelancerIds: string[];
  interestedFreelancerIds: string[];
  inventoryConfirmed: boolean;
  flowersConfirmed: boolean;
  hardGoodsConfirmed: boolean;
  qualityStatus?: QualityStatus;
  qualityNote?: string;
  flowerInventory: FlowerInventoryRow[];
  hardGoodInventory: HardGoodInventoryRow[];
  designs: DesignUpload[];
  floralItems: FloralItem[];
  floralItemDesigns: FloralItemDesign[];
  fieldVisibility: FieldVisibility;
  createdAt: string;
}

export type InventoryItemStatus = "approved" | "flagged";

export interface FlowerInventoryRow {
  id: string;
  flower: string;
  color: string;
  stemsInRecipe: number;
  totalOrdered: number;
  extras: number;
  status?: InventoryItemStatus;
  qualityNotes?: string;
  photoUrl?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface HardGoodInventoryRow {
  id: string;
  item: string;
  quantity: number;
  status?: InventoryItemStatus;
  notes?: string;
  photoUrl?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface FloralItem {
  id: string;
  name: string;
  quantity: number;
}

export interface FloralItemDesign {
  id: string;
  floralItemId: string;
  photos: DesignPhoto[];
  freelancerNote?: string;
  approved: boolean;
  revisionRequested: boolean;
  adminNote?: string;
}

export interface DesignPhoto {
  id: string;
  photoUrl: string;
}

/** @deprecated kept for backward compat — use FloralItemDesign instead */
export interface DesignUpload {
  id: string;
  photoUrl: string;
  note?: string;
  approved: boolean;
  revisionRequested: boolean;
  revisionNote?: string;
}

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  phone: string;
  portfolioUrl?: string;
  avatarUrl: string;
  available: boolean;
  projectHistory: string[];
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "project" | "approval" | "inventory" | "design" | "comment";
}

export const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
  unassigned: { label: "Unassigned", color: "text-warning", bgColor: "bg-warning/10" },
  assigned: { label: "Assigned", color: "text-primary", bgColor: "bg-primary/10" },
  completed: { label: "Completed", color: "text-success", bgColor: "bg-success/10" },
};

/** Staffing helpers */
export function getDesignersAssigned(project: Project): number {
  return project.assignedFreelancerIds.length;
}

export function getDesignersRemaining(project: Project): number {
  return Math.max(0, project.designersNeeded - project.assignedFreelancerIds.length);
}

export function isPartiallyFilled(project: Project): boolean {
  return project.assignedFreelancerIds.length > 0 && project.assignedFreelancerIds.length < project.designersNeeded;
}

/** Derive sub-category for assigned projects based on event dates */
export function getAssignedSubCategory(project: Project): AssignedSubCategory | null {
  if (project.status !== "assigned") return null;
  const now = new Date();
  const start = new Date(project.dateStart);
  // Consider "in progress" if event start date has passed
  if (now >= start) return "in_progress";
  return "upcoming";
}

/** Check if a project needs admin attention */
export interface AttentionFlag {
  needsReview: boolean;
  reasons: string[];
  /** Which tab to auto-scroll to: 'inventory' or 'designs' */
  reviewTab?: "inventory" | "designs";
}

export function getAttentionFlags(project: Project): AttentionFlag {
  if (project.status !== "assigned") return { needsReview: false, reasons: [] };

  const sub = getAssignedSubCategory(project);
  if (sub !== "in_progress") return { needsReview: false, reasons: [] };

  const reasons: string[] = [];
  let reviewTab: "inventory" | "designs" | undefined;

  // Inventory submitted but not yet quality-checked or has an issue
  if (project.flowersConfirmed && project.hardGoodsConfirmed && !project.qualityStatus) {
    reasons.push("Inventory confirmation submitted");
    reviewTab = "inventory";
  }

  // Quality issue reported
  if (project.qualityStatus === "issue") {
    reasons.push("Quality issue reported");
    reviewTab = reviewTab || "inventory";
  }

  // Legacy designs awaiting approval
  const pendingDesigns = project.designs.filter((d) => !d.approved && !d.revisionRequested);
  if (pendingDesigns.length > 0) {
    reasons.push(`${pendingDesigns.length} design${pendingDesigns.length > 1 ? "s" : ""} awaiting approval`);
    reviewTab = reviewTab || "designs";
  }

  // Floral item designs awaiting approval
  const pendingFloralDesigns = project.floralItemDesigns.filter((d) => d.photos.length > 0 && !d.approved && !d.revisionRequested);
  if (pendingFloralDesigns.length > 0) {
    reasons.push(`${pendingFloralDesigns.length} floral design${pendingFloralDesigns.length > 1 ? "s" : ""} awaiting approval`);
    reviewTab = reviewTab || "designs";
  }

  return {
    needsReview: reasons.length > 0,
    reasons,
    reviewTab,
  };
}

export const mockFreelancers: Freelancer[] = [
  {
    id: "f1",
    name: "Olivia Chen",
    email: "olivia@flowers.com",
    phone: "(555) 123-4567",
    portfolioUrl: "https://oliviafloral.com",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    available: true,
    projectHistory: ["p1", "p3"],
  },
  {
    id: "f2",
    name: "Marcus Rivera",
    email: "marcus@blooms.com",
    phone: "(555) 234-5678",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    available: true,
    projectHistory: ["p2"],
  },
  {
    id: "f3",
    name: "Sophie Laurent",
    email: "sophie@petals.com",
    phone: "(555) 345-6789",
    portfolioUrl: "https://sophielaurent.design",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    available: false,
    projectHistory: [],
  },
];

export const DEFAULT_VISIBILITY: FieldVisibility = {
  timeline: true,
  location: true,
  pay: true,
  totalHours: true,
  description: true,
  moodDescription: true,
  transportMethod: true,
  serviceLevel: true,
  dayOfContact: true,
  floralItems: true,
  inspirationPhotos: true,
};

export const SERVICE_LEVEL_OPTIONS: { value: ServiceLevel; label: string }[] = [
  { value: "design", label: "Design" },
  { value: "delivery", label: "Delivery" },
  { value: "setup", label: "Setup" },
  { value: "flip", label: "Flip" },
  { value: "strike", label: "Strike" },
];

export const mockProjects: Project[] = [
  {
    id: "p1",
    eventName: "Anderson-Park Wedding",
    dateStart: "2026-03-15",
    dateEnd: "2026-03-16",
    timeline: "Arrive 10 AM for setup. Ceremony at 2 PM, reception follows. Flip between ceremony and reception at 4 PM.",
    location: "The Garden Estate, Savannah, GA",
    pay: 850,
    totalHours: 12,
    description: "Intimate garden wedding for 80 guests. Ceremony arch, 8 centerpieces, bridal bouquet, 4 bridesmaid bouquets, boutonnieres.",
    moodDescription: "Romantic, organic, garden-style with soft pastels and lots of greenery. Think English garden meets Southern charm.",
    transportMethod: "personal_vehicle",
    serviceLevel: ["design", "delivery", "setup", "flip"],
    dayOfContact: "Sarah Anderson — (555) 999-1234",
    status: "unassigned",
    designersNeeded: 2,
    inspirationPhotos: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400",
      "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=400",
    ],
    recipes: [],
    assignedFreelancerIds: ["f1"],
    interestedFreelancerIds: ["f1", "f2"],
    inventoryConfirmed: false,
    flowersConfirmed: false,
    hardGoodsConfirmed: false,
    designs: [],
    floralItems: [
      { id: "fi1", name: "Bridal Bouquet", quantity: 1 },
      { id: "fi2", name: "Bridesmaid Bouquet", quantity: 4 },
      { id: "fi3", name: "Ceremony Arch", quantity: 1 },
      { id: "fi4", name: "Centerpiece", quantity: 8 },
      { id: "fi5", name: "Boutonniere", quantity: 6 },
    ],
    floralItemDesigns: [],
    flowerInventory: [],
    hardGoodInventory: [],
    fieldVisibility: { ...DEFAULT_VISIBILITY },
    createdAt: "2026-02-14",
  },
  {
    id: "p2",
    eventName: "Luxe Corporate Gala",
    dateStart: "2026-02-10",
    dateEnd: "2026-02-10",
    timeline: "Load-in starts at 2 PM. Event begins 6 PM. Strike after 10 PM.",
    location: "The Grand Ballroom, Atlanta, GA",
    pay: 1200,
    totalHours: 8,
    description: "Upscale corporate event. 12 tall centerpieces, stage arrangements, entrance installations.",
    moodDescription: "Dramatic, luxe, modern. Deep burgundy, white, and gold accents.",
    transportMethod: "uhaul_rental",
    serviceLevel: ["design", "delivery", "setup", "strike"],
    dayOfContact: "Event coordinator — (555) 800-2000",
    status: "assigned",
    designersNeeded: 1,
    inspirationPhotos: [
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400",
    ],
    recipes: [],
    assignedFreelancerIds: ["f2"],
    interestedFreelancerIds: ["f1", "f2", "f3"],
    inventoryConfirmed: true,
    flowersConfirmed: true,
    hardGoodsConfirmed: true,
    qualityStatus: "good",
    designs: [
      { id: "d1", photoUrl: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400", note: "Centerpiece #1 - tall arrangement", approved: true, revisionRequested: false },
      { id: "d2", photoUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400", note: "Stage left arrangement", approved: false, revisionRequested: false },
    ],
    floralItems: [
      { id: "fi6", name: "Tall Centerpiece", quantity: 12 },
      { id: "fi7", name: "Stage Arrangement", quantity: 3 },
      { id: "fi8", name: "Entrance Installation", quantity: 2 },
    ],
    floralItemDesigns: [
      { id: "fid1", floralItemId: "fi6", photos: [{ id: "dp1", photoUrl: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400" }], freelancerNote: "Centerpiece sample", approved: true, revisionRequested: false },
      { id: "fid2", floralItemId: "fi7", photos: [{ id: "dp2", photoUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400" }], freelancerNote: "Stage left arrangement", approved: false, revisionRequested: false },
    ],
    flowerInventory: [
      { id: "fl1", flower: "Burgundy Dahlia", color: "Deep Burgundy", stemsInRecipe: 36, totalOrdered: 40, extras: 4, status: "approved", updatedBy: "f2", updatedAt: "2026-02-10T14:30:00" },
      { id: "fl2", flower: "White Rose", color: "White", stemsInRecipe: 48, totalOrdered: 55, extras: 7, status: "approved", updatedBy: "f2", updatedAt: "2026-02-10T14:32:00" },
      { id: "fl3", flower: "Gold Spray Rose", color: "Gold", stemsInRecipe: 24, totalOrdered: 30, extras: 6, status: "flagged", qualityNotes: "Some stems arrived wilted", updatedBy: "f2", updatedAt: "2026-02-10T15:00:00" },
    ],
    hardGoodInventory: [
      { id: "hg1", item: "Tall Gold Vase", quantity: 12, status: "approved", updatedBy: "f2", updatedAt: "2026-02-10T14:35:00" },
      { id: "hg2", item: "Pillar Candle Holder", quantity: 24, status: "approved", updatedBy: "f2", updatedAt: "2026-02-10T14:36:00" },
      { id: "hg3", item: "Gold Charger Plate", quantity: 50, status: "flagged", notes: "Vendor confirmed delayed shipment", updatedBy: "f2", updatedAt: "2026-02-10T15:10:00" },
    ],
    fieldVisibility: { ...DEFAULT_VISIBILITY },
    createdAt: "2026-02-10",
  },
  {
    id: "p3",
    eventName: "Spring Baby Shower",
    dateStart: "2026-04-05",
    dateEnd: "2026-04-05",
    timeline: "Deliver arrangements by 9 AM. Event starts 11 AM.",
    location: "Private Residence, Charleston, SC",
    pay: 450,
    totalHours: 5,
    description: "Sweet baby shower brunch. Small centerpieces, welcome arrangement, gift table decor.",
    moodDescription: "Soft, whimsical, spring garden. Lavender, soft yellow, white.",
    transportMethod: "personal_vehicle",
    serviceLevel: ["design", "delivery", "setup"],
    dayOfContact: "Mom-to-be's sister — (555) 222-3333",
    status: "assigned",
    designersNeeded: 1,
    inspirationPhotos: [
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400",
    ],
    recipes: [],
    assignedFreelancerIds: ["f1"],
    interestedFreelancerIds: ["f1"],
    inventoryConfirmed: true,
    flowersConfirmed: true,
    hardGoodsConfirmed: true,
    qualityStatus: "good",
    designs: [
      { id: "d3", photoUrl: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400", note: "Welcome arrangement", approved: false, revisionRequested: true, revisionNote: "Beautiful! Can we add a few more stems of lavender?" },
    ],
    floralItems: [
      { id: "fi9", name: "Small Centerpiece", quantity: 4 },
      { id: "fi10", name: "Welcome Arrangement", quantity: 1 },
      { id: "fi11", name: "Gift Table Decor", quantity: 1 },
    ],
    floralItemDesigns: [
      { id: "fid3", floralItemId: "fi10", photos: [{ id: "dp3", photoUrl: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400" }], freelancerNote: "Welcome arrangement", approved: false, revisionRequested: true, adminNote: "Beautiful! Can we add a few more stems of lavender?" },
    ],
    flowerInventory: [],
    hardGoodInventory: [],
    fieldVisibility: { ...DEFAULT_VISIBILITY },
    createdAt: "2026-02-08",
  },
  {
    id: "p4",
    eventName: "Thompson Anniversary Dinner",
    dateStart: "2026-04-12",
    dateEnd: "2026-04-12",
    timeline: "Setup at 5 PM. Dinner at 7 PM.",
    location: "Magnolia House, Beaufort, SC",
    pay: 600,
    totalHours: 6,
    description: "Elegant 25th anniversary dinner for 30 guests. 4 centerpieces, sweetheart table arrangement.",
    moodDescription: "Classic elegance. White and blush roses, peonies, candles.",
    transportMethod: "personal_vehicle",
    serviceLevel: ["design", "delivery", "setup"],
    dayOfContact: "Mr. Thompson — (555) 444-5555",
    status: "completed",
    designersNeeded: 1,
    inspirationPhotos: [],
    recipes: [],
    assignedFreelancerIds: ["f1"],
    interestedFreelancerIds: ["f1", "f3"],
    inventoryConfirmed: true,
    flowersConfirmed: true,
    hardGoodsConfirmed: true,
    qualityStatus: "good",
    designs: [
      { id: "d4", photoUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400", approved: true, revisionRequested: false },
    ],
    floralItems: [
      { id: "fi12", name: "Centerpiece", quantity: 4 },
      { id: "fi13", name: "Sweetheart Table Arrangement", quantity: 1 },
    ],
    floralItemDesigns: [
      { id: "fid4", floralItemId: "fi12", photos: [{ id: "dp4", photoUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400" }], approved: true, revisionRequested: false },
    ],
    flowerInventory: [],
    hardGoodInventory: [],
    fieldVisibility: { ...DEFAULT_VISIBILITY },
    createdAt: "2026-01-20",
  },
];

export const mockNotifications: Notification[] = [
  { id: "n1", message: "New project posted: Anderson-Park Wedding", read: false, createdAt: "2026-02-14T10:00:00", type: "project" },
  { id: "n2", message: "Your designs for Spring Baby Shower need revisions", read: false, createdAt: "2026-02-13T15:30:00", type: "design" },
  { id: "n3", message: "You've been approved for Luxe Corporate Gala!", read: true, createdAt: "2026-02-11T09:00:00", type: "approval" },
  { id: "n4", message: "Inventory confirmed for Luxe Corporate Gala", read: true, createdAt: "2026-02-12T14:00:00", type: "inventory" },
];
