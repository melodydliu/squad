import { Flower2, MapPin, Calendar, DollarSign, Clock, User, Camera, Package, CheckCircle2, AlertCircle, Eye } from "lucide-react";

export type ProjectStatus = "open" | "awaiting_freelancer" | "in_progress" | "awaiting_approval" | "completed";
export type DeliveryMethod = "ship" | "pickup";
export type TransportMethod = "personal_vehicle" | "uhaul_rental";
export type QualityStatus = "good" | "issue";

export interface Project {
  id: string;
  eventName: string;
  dateStart: string;
  dateEnd: string;
  time: string;
  location: string;
  pay: number;
  totalHours: number;
  description: string;
  moodDescription: string;
  deliveryMethod: DeliveryMethod;
  transportMethod: TransportMethod;
  status: ProjectStatus;
  inspirationPhotos: string[];
  recipes: string[];
  assignedFreelancerId?: string;
  interestedFreelancerIds: string[];
  inventoryConfirmed: boolean;
  flowersConfirmed: boolean;
  hardGoodsConfirmed: boolean;
  qualityStatus?: QualityStatus;
  qualityNote?: string;
  designs: DesignUpload[];
  createdAt: string;
}

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
  open: { label: "Open", color: "text-info", bgColor: "bg-info/10" },
  awaiting_freelancer: { label: "Awaiting Freelancer", color: "text-warning", bgColor: "bg-warning/10" },
  in_progress: { label: "In Progress", color: "text-primary", bgColor: "bg-primary/10" },
  awaiting_approval: { label: "Awaiting Approval", color: "text-blush-dark", bgColor: "bg-accent" },
  completed: { label: "Completed", color: "text-success", bgColor: "bg-success/10" },
};

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

export const mockProjects: Project[] = [
  {
    id: "p1",
    eventName: "Anderson-Park Wedding",
    dateStart: "2026-03-15",
    dateEnd: "2026-03-16",
    time: "2:00 PM",
    location: "The Garden Estate, Savannah, GA",
    pay: 850,
    totalHours: 12,
    description: "Intimate garden wedding for 80 guests. Ceremony arch, 8 centerpieces, bridal bouquet, 4 bridesmaid bouquets, boutonnieres.",
    moodDescription: "Romantic, organic, garden-style with soft pastels and lots of greenery. Think English garden meets Southern charm.",
    deliveryMethod: "ship",
    transportMethod: "personal_vehicle",
    status: "open",
    inspirationPhotos: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400",
      "https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=400",
    ],
    recipes: [],
    interestedFreelancerIds: ["f1", "f2"],
    inventoryConfirmed: false,
    flowersConfirmed: false,
    hardGoodsConfirmed: false,
    designs: [],
    createdAt: "2026-02-14",
  },
  {
    id: "p2",
    eventName: "Luxe Corporate Gala",
    dateStart: "2026-03-22",
    dateEnd: "2026-03-22",
    time: "6:00 PM",
    location: "The Grand Ballroom, Atlanta, GA",
    pay: 1200,
    totalHours: 8,
    description: "Upscale corporate event. 12 tall centerpieces, stage arrangements, entrance installations.",
    moodDescription: "Dramatic, luxe, modern. Deep burgundy, white, and gold accents.",
    deliveryMethod: "pickup",
    transportMethod: "uhaul_rental",
    status: "in_progress",
    inspirationPhotos: [
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400",
    ],
    recipes: [],
    assignedFreelancerId: "f2",
    interestedFreelancerIds: ["f1", "f2", "f3"],
    inventoryConfirmed: true,
    flowersConfirmed: true,
    hardGoodsConfirmed: true,
    qualityStatus: "good",
    designs: [
      { id: "d1", photoUrl: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400", note: "Centerpiece #1 - tall arrangement", approved: true, revisionRequested: false },
      { id: "d2", photoUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400", note: "Stage left arrangement", approved: false, revisionRequested: false },
    ],
    createdAt: "2026-02-10",
  },
  {
    id: "p3",
    eventName: "Spring Baby Shower",
    dateStart: "2026-04-05",
    dateEnd: "2026-04-05",
    time: "11:00 AM",
    location: "Private Residence, Charleston, SC",
    pay: 450,
    totalHours: 5,
    description: "Sweet baby shower brunch. Small centerpieces, welcome arrangement, gift table decor.",
    moodDescription: "Soft, whimsical, spring garden. Lavender, soft yellow, white.",
    deliveryMethod: "ship",
    transportMethod: "personal_vehicle",
    status: "awaiting_approval",
    inspirationPhotos: [
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400",
    ],
    recipes: [],
    assignedFreelancerId: "f1",
    interestedFreelancerIds: ["f1"],
    inventoryConfirmed: true,
    flowersConfirmed: true,
    hardGoodsConfirmed: true,
    qualityStatus: "good",
    designs: [
      { id: "d3", photoUrl: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400", note: "Welcome arrangement", approved: false, revisionRequested: true, revisionNote: "Beautiful! Can we add a few more stems of lavender?" },
    ],
    createdAt: "2026-02-08",
  },
  {
    id: "p4",
    eventName: "Thompson Anniversary Dinner",
    dateStart: "2026-04-12",
    dateEnd: "2026-04-12",
    time: "7:00 PM",
    location: "Magnolia House, Beaufort, SC",
    pay: 600,
    totalHours: 6,
    description: "Elegant 25th anniversary dinner for 30 guests. 4 centerpieces, sweetheart table arrangement.",
    moodDescription: "Classic elegance. White and blush roses, peonies, candles.",
    deliveryMethod: "pickup",
    transportMethod: "personal_vehicle",
    status: "completed",
    inspirationPhotos: [],
    recipes: [],
    assignedFreelancerId: "f1",
    interestedFreelancerIds: ["f1", "f3"],
    inventoryConfirmed: true,
    flowersConfirmed: true,
    hardGoodsConfirmed: true,
    qualityStatus: "good",
    designs: [
      { id: "d4", photoUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400", approved: true, revisionRequested: false },
    ],
    createdAt: "2026-01-20",
  },
];

export const mockNotifications: Notification[] = [
  { id: "n1", message: "New project posted: Anderson-Park Wedding", read: false, createdAt: "2026-02-14T10:00:00", type: "project" },
  { id: "n2", message: "Your designs for Spring Baby Shower need revisions", read: false, createdAt: "2026-02-13T15:30:00", type: "design" },
  { id: "n3", message: "You've been approved for Luxe Corporate Gala!", read: true, createdAt: "2026-02-11T09:00:00", type: "approval" },
  { id: "n4", message: "Inventory confirmed for Luxe Corporate Gala", read: true, createdAt: "2026-02-12T14:00:00", type: "inventory" },
];
