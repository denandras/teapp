import { supabase } from "@/lib/supabaseClient";

export type ProfileType = "personal" | "teahouse";
export type EnrollmentStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  display_name: string;
  profile_type: ProfileType;
  teahouse_name: string | null;
  teahouse_contact_email: string | null;
  teahouse_address: string | null;
  country: string | null;
  enrollment_status: EnrollmentStatus;
  is_admin: boolean;
}

/**
 * Fetch the profile for a given user id. Returns null if no profile row exists.
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, profile_type, teahouse_name, teahouse_contact_email, teahouse_address, country, enrollment_status, is_admin"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchProfile error:", error.message);
    return null;
  }

  return data as Profile | null;
}

/**
 * Upsert a profile row for a user. `data` is a partial Profile that gets merged
 * over the row. The user id is always set so the row is tied to the auth user.
 */
export async function upsertProfile(
  userId: string,
  data: Partial<Profile>
): Promise<Profile | null> {
  const { data: row, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...data }, { onConflict: "id" })
    .select(
      "id, display_name, profile_type, teahouse_name, teahouse_contact_email, teahouse_address, country, enrollment_status, is_admin"
    )
    .maybeSingle();

  if (error) {
    console.error("upsertProfile error:", error.message);
    return null;
  }

  return row as Profile | null;
}

/**
 * True when the profile belongs to a teahouse that has been approved to
 * publish teas.
 */
export function isApprovedTeahouse(profile: Profile | null): boolean {
  return (
    !!profile &&
    profile.profile_type === "teahouse" &&
    profile.enrollment_status === "approved"
  );
}

/**
 * True when the profile is flagged as an administrator.
 */
export function isAdmin(profile: Profile | null): boolean {
  return !!profile && profile.is_admin === true;
}
