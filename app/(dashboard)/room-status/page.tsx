"use client";

import { useEffect, useState } from "react";
import { roomsApi } from "@/lib/api";
import type { Room, RoomStatus } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { Wrench } from "lucide-react";

const TRANSITIONS: Partial<Record<RoomStatus, RoomStatus[]>> = {
  Available:   ["Maintenance"],
  Dirty:       ["Available", "Maintenance"],
  Maintenance: ["Available"],
};

const STATUS_BORDER: Record<string, string> = {
  Available:   "#63b14c",
  Occupied:    "#378add",
  Dirty:       "#ba7517",
  Maintenance: "#e24b4a",
};

export default function RoomStatusPage() {
  const toast = useToast();
  const [rooms,   setRooms]   = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Per-row selected status
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [updating, setUpdating] = useState<Record<number, boolean>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await roomsApi.getAll();
      setRooms(data);
      // Pre-select first valid transition per room
      const init: Record<number, string> = {};
      data.forEach(r => {
        const opts = TRANSITIONS[r.status];
        if (opts?.length) init[r.id] = opts[0];
      });
      setSelected(init);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(room: Room) {
    const next = selected[room.id];
    if (!next) return;
    setUpdating(p => ({ ...p, [room.id]: true }));
    try {
      await roomsApi.updateStatus(room.id, next);
      toast.success(`Room ${room.roomNumber} → ${next}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setUpdating(p => ({ ...p, [room.id]: false }));
    }
  }

  const actionable = rooms.filter(r => TRANSITIONS[r.status]?.length);
  const readOnly   = rooms.filter(r => !TRANSITIONS[r.status]?.length);

  return (
    <div>
      <PageHeader
        title="Room status"
        subtitle="Manage cleaning and maintenance transitions"
      />

      {loading && <Spinner />}

      {!loading && error && (
        <p style={{ fontSize: "13px", color: "#a32d2d", textAlign: "center", padding: "40px 0" }}>{error}</p>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Actionable rooms */}
          {actionable.length > 0 && (
            <div>
              <p style={{
                fontSize: "10px", fontWeight: 600, color: "#999",
                textTransform: "uppercase", letterSpacing: "0.06em",
                marginBottom: "10px",
              }}>
                Needs attention — {actionable.length}
              </p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Type</th>
                      <th>Current status</th>
                      <th>Transition to</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {actionable.map(room => {
                      const opts = TRANSITIONS[room.status] ?? [];
                      return (
                        <tr key={room.id}>
                          <td>
                            <div style={{
                              borderLeft: `3px solid ${STATUS_BORDER[room.status] ?? "#ccc"}`,
                              paddingLeft: "10px",
                            }}>
                              <span style={{ fontSize: "13px", fontWeight: 700 }}>
                                {room.roomNumber}
                              </span>
                            </div>
                          </td>
                          <td style={{ color: "#888" }}>
                            {room.type}
                          </td>
                          <td>
                            <Badge
                              label={room.status}
                              variant={statusVariant(room.status)}
                            />
                          </td>
                          <td>
                            <select
                              className="form-select-sm"
                              value={selected[room.id] ?? ""}
                              onChange={e =>
                                setSelected(p => ({
                                  ...p,
                                  [room.id]: e.target.value,
                                }))
                              }
                            >
                              {opts.map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <Button
                              size="sm"
                              variant="secondary"
                              loading={updating[room.id]}
                              onClick={() => handleUpdate(room)}
                            >
                              Update
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Read-only rooms */}
          {readOnly.length > 0 && (
            <div>
              <p style={{
                fontSize: "10px", fontWeight: 600, color: "#999",
                textTransform: "uppercase", letterSpacing: "0.06em",
                marginBottom: "10px",
              }}>
                No action needed — {readOnly.length}
              </p>
              <div className="table-wrap">
                {readOnly.length === 0 ? (
                  <EmptyState
                    icon={<Wrench size={24} />}
                    title="All rooms are good"
                  />
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Room</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readOnly.map(room => (
                        <tr key={room.id}>
                          <td style={{ fontWeight: 700 }}>{room.roomNumber}</td>
                          <td style={{ color: "#888" }}>{room.type}</td>
                          <td>
                            <Badge
                              label={room.status}
                              variant={statusVariant(room.status)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
