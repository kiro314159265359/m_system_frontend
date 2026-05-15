"use client";

import { useEffect, useState } from "react";
import { staffApi } from "@/lib/api";
import type { Staff } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users } from "lucide-react";

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  Admin:       { bg: "#faeeda", color: "#854f0b" },
  Reception:   { bg: "#e6f1fb", color: "#185fa5" },
  Cashier:     { bg: "#eaf3de", color: "#3b6d11" },
  RoomService: { bg: "#faeeda", color: "#633806" },
  Restaurant:  { bg: "#eeedfe", color: "#3c3489" },
};

const ROLE_BADGE: Record<string, string> = {
  Admin:       "badge amber",
  Reception:   "badge blue",
  Cashier:     "badge green",
  RoomService: "badge amber",
  Restaurant:  "badge purple",
};

export default function StaffPage() {
  const [staff,   setStaff]   = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    staffApi.getAll()
      .then(setStaff)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const active   = staff.filter(s => s.isActive).length;
  const byRole   = staff.reduce<Record<string, number>>((acc, s) => {
    acc[s.role] = (acc[s.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle={`${active} active member${active !== 1 ? "s" : ""}`}
      />

      {/* Role breakdown strip */}
      {!loading && staff.length > 0 && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {Object.entries(byRole).map(([role, count]) => {
            const c = ROLE_COLORS[role] ?? { bg: "#f1efe8", color: "#5f5e5a" };
            return (
              <div key={role} style={{
                background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)",
                borderRadius: "10px", padding: "10px 14px",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: c.bg, color: c.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontWeight: 700,
                }}>
                  {role.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#999" }}>{role}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>{count}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="table-wrap">
        {loading && <Spinner />}

        {!loading && error && (
          <div style={{ padding: "40px", textAlign: "center", fontSize: "13px", color: "#a32d2d" }}>{error}</div>
        )}

        {!loading && !error && staff.length === 0 && (
          <EmptyState
            icon={<Users size={28} />}
            title="No staff found"
          />
        )}

        {!loading && !error && staff.length > 0 && (
          <table>
            <thead>
              <tr>
                {["Staff member", "Username", "Role", "Status"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(s => {
                const c = ROLE_COLORS[s.role] ?? { bg: "#f1efe8", color: "#5f5e5a" };
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "50%",
                          background: c.bg, color: c.color,
                          fontSize: "10px", fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {initials(s.fullName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: "12px" }}>{s.fullName}</div>
                          <div style={{ fontSize: "10px", color: "#999" }}>ID #{s.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{
                        background: "#f1efe8", padding: "2px 7px",
                        borderRadius: "5px", fontSize: "11px",
                      }}>
                        {s.username}
                      </code>
                    </td>
                    <td>
                      <span className={ROLE_BADGE[s.role] ?? "badge gray"}>
                        {s.role}
                      </span>
                    </td>
                    <td>
                      <Badge
                        label={s.isActive ? "Active" : "Inactive"}
                        variant={s.isActive ? "active" : "inactive"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
