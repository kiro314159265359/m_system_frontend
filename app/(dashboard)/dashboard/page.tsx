"use client";

import { useEffect, useState } from "react";
import { roomsApi, reservationsApi } from "@/lib/api";
import type { Room, Reservation } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  Building2, DoorOpen, CheckCircle,
  Wrench, Phone,
} from "lucide-react";

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short",
  });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const toast = useToast();

  const [rooms,        setRooms]        = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([roomsApi.getAll(), reservationsApi.getActive()])
      .then(([r, res]) => {
        setRooms(r);
        setReservations(res);
      })
      .catch(() => toast.error("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const available    = rooms.filter(r => r.status === "Available").length;
  const occupied     = rooms.filter(r => r.status === "Occupied").length;
  const dirty        = rooms.filter(r => r.status === "Dirty").length;
  const maintenance  = rooms.filter(r => r.status === "Maintenance").length;
  const occupancy    = rooms.length
    ? Math.round((occupied / rooms.length) * 100)
    : 0;

  const checkedIn = reservations.filter(r => r.status === "CheckedIn");
  const pending   = reservations.filter(r => r.status === "Pending");

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title={`${greeting()}`}
        subtitle={new Date().toLocaleDateString("en-GB", {
          weekday: "long", day: "numeric",
          month: "long", year: "numeric",
        })}
      />

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-head">
            <p className="stat-label">Total rooms</p>
            <div className="stat-icon gold"><Building2 size={14} /></div>
          </div>
          <p className="stat-val">{rooms.length}</p>
          <p className="stat-sub">{occupancy}% occupancy</p>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <p className="stat-label">Available</p>
            <div className="stat-icon green"><CheckCircle size={14} /></div>
          </div>
          <p className="stat-val">{available}</p>
          <p className="stat-sub">Ready to book</p>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <p className="stat-label">Occupied</p>
            <div className="stat-icon blue"><DoorOpen size={14} /></div>
          </div>
          <p className="stat-val">{occupied}</p>
          <p className="stat-sub">{checkedIn.length} checked in</p>
        </div>

        <div className="stat-card">
          <div className="stat-head">
            <p className="stat-label">Needs service</p>
            <div className="stat-icon red"><Wrench size={14} /></div>
          </div>
          <p className="stat-val">{dirty + maintenance}</p>
          <p className="stat-sub">{dirty} dirty · {maintenance} maint.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>

        {/* Active reservations table */}
        <div>
          <p style={{
            fontSize: "10px", fontWeight: 600, color: "#999",
            textTransform: "uppercase", letterSpacing: "0.06em",
            marginBottom: "10px",
          }}>
            Checked in — {checkedIn.length}
          </p>
          <div className="table-wrap">
            {checkedIn.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#999" }}>No guests checked in</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    {["Guest", "Room", "Check-out", "Source"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {checkedIn.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="av" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: "#faeeda", color: "#854f0b",
                            fontSize: "10px", fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            {initials(r.guestName)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: "12px" }}>
                              {r.guestName}
                            </div>
                            <div style={{ fontSize: "10px", color: "#999" }}>
                              {r.guestPhone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {r.roomNumber ?? "—"}
                      </td>
                      <td style={{ color: "#666" }}>
                        {formatDate(r.checkOutDate)}
                      </td>
                      <td>
                        <Badge
                          label={r.source === "WalkIn" ? "Walk-in" : "Phone"}
                          variant={r.source === "WalkIn" ? "walkin" : "phone"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Pending bookings */}
          <div>
            <p style={{
              fontSize: "10px", fontWeight: 600, color: "#999",
              textTransform: "uppercase", letterSpacing: "0.06em",
              marginBottom: "10px",
            }}>
              Pending — {pending.length}
            </p>
            <div className="table-wrap">
              {pending.length === 0 ? (
                <div style={{ padding: "36px 0", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#999" }}>No pending bookings</p>
                </div>
              ) : (
                <div>
                  {pending.map(r => (
                    <div key={r.id} style={{
                      padding: "10px 16px",
                      display: "flex", alignItems: "center", gap: "10px",
                      borderBottom: "0.5px solid rgba(0,0,0,0.05)",
                    }}>
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "7px",
                        background: "#faeeda",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", color: "#854f0b",
                        flexShrink: 0,
                      }}>
                        <Phone size={12} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "12px", fontWeight: 500, color: "#111" }}>
                          {r.guestName}
                        </div>
                        <div style={{ fontSize: "10px", color: "#999" }}>
                          Check-in {formatDate(r.checkInDate)}
                        </div>
                      </div>
                      <Badge label="Pending" variant="pending" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Room overview mini */}
          <div>
            <p style={{
              fontSize: "10px", fontWeight: 600, color: "#999",
              textTransform: "uppercase", letterSpacing: "0.06em",
              marginBottom: "10px",
            }}>
              Room overview
            </p>
            <div style={{
              background: "#fff",
              border: "0.5px solid rgba(0,0,0,0.1)",
              borderRadius: "12px",
              padding: "14px 16px",
            }}>
              {[
                { label: "Available",   count: available,   color: "#63b14c" },
                { label: "Occupied",    count: occupied,    color: "#378add" },
                { label: "Dirty",       count: dirty,       color: "#ba7517" },
                { label: "Maintenance", count: maintenance, color: "#e24b4a" },
              ].map((item, i) => (
                <div key={item.label} style={{
                  marginBottom: i < 3 ? "10px" : 0,
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "11px", marginBottom: "4px",
                  }}>
                    <span style={{ color: "#666" }}>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.count}</span>
                  </div>
                  <div style={{
                    height: "6px", background: "#f1efe8",
                    borderRadius: "99px", overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", borderRadius: "99px",
                      background: item.color,
                      width: rooms.length ? `${(item.count / rooms.length) * 100}%` : "0%",
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
