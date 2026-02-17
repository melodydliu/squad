import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

const EMPTY_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  profilePhotoUrl: "",
  website: "",
  instagram: "",
};

export function getInitials(firstName: string, lastName: string): string {
  const f = firstName.trim().charAt(0).toUpperCase();
  const l = lastName.trim().charAt(0).toUpperCase();
  return `${f}${l}`;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!cancelled && data && !error) {
        setProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          profilePhotoUrl: data.avatar_url || "",
          website: data.website || "",
          instagram: data.instagram || "",
        });
      }
      if (!cancelled) setLoading(false);
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  const saveProfile = useCallback(async (updated: UserProfile) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: updated.firstName.trim(),
        last_name: updated.lastName.trim(),
        email: updated.email.trim(),
        phone: updated.phone.trim(),
        address: updated.address.trim(),
        avatar_url: updated.profilePhotoUrl || null,
        website: updated.website.trim() || null,
        instagram: updated.instagram.trim() || null,
      })
      .eq("user_id", user.id);

    if (!error) {
      setProfile(updated);
    }
    return error;
  }, []);

  return { profile, saveProfile, loading };
}
