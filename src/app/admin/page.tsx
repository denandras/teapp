"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Shield,
  Check,
  X,
  Store,
  Users,
  Coffee,
  Clock,
  Mail,
  MapPin,
  User,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import type { Profile, EnrollmentStatus } from "@/lib/profiles";

type TeahouseProfile = Profile & { created_at: string };

interface Stats {
  totalTeas: number | null;
  totalUsers: number | null;
  totalTeahouses: number | null;
}

const STATUS_STYLES: Record<EnrollmentStatus, { label: string; bg: string; color: string }> = {
  pending: { label: "Pending", bg: "#c4853f22", color: "#c4853f" },
  approved: { label: "Approved", bg: "#7BA05B22", color: "#7BA05B" },
  rejected: { label: "Rejected", bg: "#c44a5f22", color: "#c44a5f" },
};

function StatusBadge({ status }: { status: EnrollmentStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status === "pending" && <Clock size={12} />}
      {status === "approved" && <Check size={12} />}
      {status === "rejected" && <X size={12} />}
      {s.label}
    </span>
  );
}

export default function AdminPage() {
  const { profile } = useAuth();
  const [pending, setPending] = useState<TeahouseProfile[]>([]);
  const [allTeahouses, setAllTeahouses] = useState<TeahouseProfile[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTeas: null, totalUsers: null, totalTeahouses: null });
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const isAdminUser = !!profile?.is_admin;

  const fetchData = useCallback(async () => {
    if (!profile?.is_admin) return;

    const [pendingRes, teahouseRes, teasCountRes, usersCountRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, display_name, profile_type, teahouse_name, teahouse_contact_email, teahouse_address, country, enrollment_status, is_admin, created_at"
        )
        .eq("profile_type", "teahouse")
        .eq("enrollment_status", "pending")
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select(
          "id, display_name, profile_type, teahouse_name, teahouse_contact_email, teahouse_address, country, enrollment_status, is_admin, created_at"
        )
        .eq("profile_type", "teahouse")
        .order("created_at", { ascending: false }),
      supabase.from("teas").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    setPending((pendingRes.data as TeahouseProfile[] | null) ?? []);
    setAllTeahouses((teahouseRes.data as TeahouseProfile[] | null) ?? []);
    setStats({
      totalTeas: teasCountRes.count,
      totalUsers: usersCountRes.count,
      totalTeahouses: teahouseRes.data?.length ?? 0,
    });
    setLoading(false);
  }, [profile?.is_admin]);

  useEffect(() => {
    if (profile?.is_admin) {
      setLoading(true);
      fetchData();
    }
  }, [profile?.is_admin, fetchData]);

  const setEnrollment = async (userId: string, status: EnrollmentStatus) => {
    setActing(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ enrollment_status: status })
      .eq("id", userId);
    setActing(null);
    if (error) {
      console.error("Failed to update enrollment:", error.message);
      return;
    }
    await fetchData();
  };

  // Not an admin — show access denied
  if (!isAdminUser) {
    return (
      <div>
        <div className="rounded-xl border p-10 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
          <Shield size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
          <h1 className="text-2xl font-serif font-bold mb-2" style={{ color: "var(--text)" }}>
            Access Denied
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            You do not have administrator privileges to view this page.
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Teas", value: stats.totalTeas, icon: Coffee },
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Teahouses", value: stats.totalTeahouses, icon: Store },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold flex items-center gap-2">
          <Shield size={26} className="text-accent" />
          Admin
        </h1>
        <p className="text-muted text-sm mt-1">Manage teahouse enrollments and view app stats</p>
      </div>

      {/* App stats */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border p-4 text-center" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            <Icon size={20} className="mx-auto mb-2 text-accent" />
            <p className="text-3xl font-bold text-accent">
              {value === null ? "—" : value}
            </p>
            <p className="text-xs text-muted mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Pending enrollments */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Clock size={20} className="text-accent" />
          <h2 className="text-lg font-semibold">Pending Enrollments</h2>
          <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "#c4853f22", color: "#c4853f" }}>
            {pending.length}
          </span>
        </div>
        <p className="text-xs text-muted mb-4">Teahouses waiting for approval to publish teas.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted py-6">
            <Loader2 size={16} className="animate-spin" /> Loading enrollments…
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-xl border p-6 text-center text-sm text-muted" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            No pending enrollments right now. 🍵
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {pending.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Store size={16} className="text-accent shrink-0" />
                        <h3 className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                          {t.teahouse_name || "Unnamed Teahouse"}
                        </h3>
                        <StatusBadge status={t.enrollment_status} />
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted">
                        <p className="flex items-center gap-1.5">
                          <Mail size={12} /> {t.teahouse_contact_email || "No contact email"}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <MapPin size={12} /> {t.teahouse_address || "No address"}
                          {t.country ? ` · ${t.country}` : ""}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <User size={12} /> Submitted by {t.display_name || "Unknown"}
                          {t.created_at
                            ? ` · ${new Date(t.created_at).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEnrollment(t.id, "approved")}
                        disabled={acting !== null}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
                        style={{ backgroundColor: "#7BA05B" }}
                      >
                        {acting === t.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollment(t.id, "rejected")}
                        disabled={acting !== null}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 border"
                        style={{ borderColor: "#c44a5f66", color: "#c44a5f" }}
                      >
                        {acting === t.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* All teahouse profiles */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Store size={20} className="text-accent" />
          <h2 className="text-lg font-semibold">All Teahouses</h2>
          <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: "var(--border)", color: "var(--muted)" }}>
            {allTeahouses.length}
          </span>
        </div>
        <p className="text-xs text-muted mb-4">Overview of approved and rejected teahouse registrations.</p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted py-6">
            <Loader2 size={16} className="animate-spin" /> Loading teahouses…
          </div>
        ) : allTeahouses.length === 0 ? (
          <div className="rounded-xl border p-6 text-center text-sm text-muted" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
            No teahouse profiles yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted" style={{ backgroundColor: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                  <th className="px-4 py-3 font-semibold">Teahouse</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Contact</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {allTeahouses.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: "var(--text)" }}>
                        {t.teahouse_name || "Unnamed"}
                      </p>
                      <p className="text-xs text-muted">{t.display_name || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                      {t.teahouse_contact_email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.enrollment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
