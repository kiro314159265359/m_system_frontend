"use client";

import { useEffect, useState, FormEvent } from "react";
import { reservationsApi } from "@/lib/api";
import type { Reservation } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { GoldButton } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { CalendarCheck, Phone, DoorOpen } from "lucide-react";

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function ReservationsPage() {
  const toast = useToast();
  const [data,    setData]    = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    guestFullName: "", guestPhone: "",
    checkInDate: "", checkOutDate: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    reservationsApi.getActive()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handlePhoneBooking(e: FormEvent) {
    e.preventDefault();
    const errs: Partial<typeof form> = {};
    if (!form.guestFullName.trim()) errs.guestFullName = "Required.";
    if (!form.guestPhone.trim())    errs.guestPhone    = "Required.";
    if (!form.checkInDate)          errs.checkInDate   = "Required.";
    if (!form.checkOutDate)         errs.checkOutDate  = "Required.";
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setCreating(true);
    try {
      const res = await reservationsApi.phoneBooking({
        guestFullName: form.guestFullName,
        guestPhone:    form.guestPhone,
        checkInDate:   new Date(form.checkInDate).toISOString(),
        checkOutDate:  new Date(form.checkOutDate).toISOString(),
      });
      setData(prev => [res, ...prev]);
      setForm({ guestFullName: "", guestPhone: "", checkInDate: "", checkOutDate: "" });
      setShowForm(false);
      toast.success(`Reservation created for ${res.guestName}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create reservation.");
    } finally {
      setCreating(false);
    }
  }

  const pending   = data.filter(r => r.status === "Pending");
  const checkedIn = data.filter(r => r.status === "CheckedIn");

  return (
    <div>
      <PageHeader
        title="Reservations"
        subtitle={`${data.length} active booking${data.length !== 1 ? "s" : ""}`}
        action={
          <GoldButton
            size="sm"
            icon={<Phone size={14} />}
            onClick={() => setShowForm(p => !p)}
          >
            {showForm ? "Cancel" : "Phone booking"}
          </GoldButton>
        }
      />

      {/* Inline phone booking form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader
            title="New phone booking"
            subtitle="Guest calls to reserve — no payment yet"
            icon={<Phone size={16} />}
          />
          <div className="p-6">
            <form onSubmit={handlePhoneBooking}
              className="grid grid-cols-2 gap-4">
              <Input
                label="Guest full name"
                placeholder="Full name"
                value={form.guestFullName}
                error={formErrors.guestFullName}
                onChange={e => {
                  setForm(p => ({ ...p, guestFullName: e.target.value }));
                  setFormErrors(p => ({ ...p, guestFullName: "" }));
                }}
              />
              <Input
                label="Phone"
                placeholder="+1 555 000 0000"
                value={form.guestPhone}
                error={formErrors.guestPhone}
                onChange={e => {
                  setForm(p => ({ ...p, guestPhone: e.target.value }));
                  setFormErrors(p => ({ ...p, guestPhone: "" }));
                }}
              />
              <Input
                label="Expected check-in"
                type="date"
                value={form.checkInDate}
                error={formErrors.checkInDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => {
                  setForm(p => ({ ...p, checkInDate: e.target.value }));
                  setFormErrors(p => ({ ...p, checkInDate: "" }));
                }}
              />
              <Input
                label="Expected check-out"
                type="date"
                value={form.checkOutDate}
                error={formErrors.checkOutDate}
                min={form.checkInDate || new Date().toISOString().split("T")[0]}
                onChange={e => {
                  setForm(p => ({ ...p, checkOutDate: e.target.value }));
                  setFormErrors(p => ({ ...p, checkOutDate: "" }));
                }}
              />
              <div className="col-span-2 flex justify-end">
                <GoldButton type="submit" loading={creating}>
                  Create reservation
                </GoldButton>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "18px" }}>
        <div style={{
          background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: "12px",
          padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{ padding: "10px", background: "#faeeda", borderRadius: "10px" }}>
            <Phone size={16} style={{ color: "#854f0b" }} />
          </div>
          <div>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#111" }}>{pending.length}</p>
            <p style={{ fontSize: "11px", color: "#999" }}>Pending (phone)</p>
          </div>
        </div>
        <div style={{
          background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: "12px",
          padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px",
        }}>
          <div style={{ padding: "10px", background: "#eaf3de", borderRadius: "10px" }}>
            <DoorOpen size={16} style={{ color: "#3b6d11" }} />
          </div>
          <div>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#111" }}>{checkedIn.length}</p>
            <p style={{ fontSize: "11px", color: "#999" }}>Currently checked in</p>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        {loading && <Spinner />}

        {!loading && error && (
          <div style={{ padding: "40px 24px", textAlign: "center", fontSize: "13px", color: "#a32d2d" }}>{error}</div>
        )}

        {!loading && !error && data.length === 0 && (
          <EmptyState
            icon={<CalendarCheck size={28} />}
            title="No active reservations"
            description="Reservations will appear here once created."
          />
        )}

        {!loading && !error && data.length > 0 && (
          <table>
            <thead>
              <tr>
                {["Guest", "Room", "Check-in", "Check-out", "Source", "Status"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                        <div style={{ fontSize: "10px", color: "#999" }}>{r.guestPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {r.roomNumber ?? <span style={{ color: "#bbb" }}>—</span>}
                  </td>
                  <td style={{ color: "#666" }}>
                    {formatDate(r.checkInDate)}
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
                  <td>
                    <Badge
                      label={r.status === "CheckedIn" ? "Checked in" : r.status}
                      variant={statusVariant(r.status)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
