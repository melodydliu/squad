import { useState, useCallback } from "react";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profilePhotoUrl: string;
  website: string;
  instagram: string;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: "Olivia",
  lastName: "Chen",
  email: "olivia@flowers.com",
  phone: "(555) 123-4567",
  address: "123 Bloom Lane, Savannah, GA 31401",
  profilePhotoUrl: "",
  website: "https://oliviafloral.com",
  instagram: "@oliviafloral",
};

const STORAGE_KEY = "bloom_user_profile";

function loadProfile(): UserProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_PROFILE;
}

export function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return `${f}${l}`;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);

  const saveProfile = useCallback((updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  return { profile, saveProfile };
}
