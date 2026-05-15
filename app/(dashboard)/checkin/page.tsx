"use client";

import { useEffect, useState, FormEvent } from "react";
import { reservationsApi, roomsApi } from "@/lib/api";
import type { Room, Reservation } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { GoldButton, Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  DoorOpen, Phone, CheckCircle2,
} from "lucide-react";

const EMPTY_WALKIN = {
  guestFullName: "", guestPhone: "",
  nationalId: "", roomId: "", checkOutDate: "",
};

const EMPTY_PHONE = {
  reservationId: "", roomId: "", checkOutDate: "",
};

export default function CheckInPage() {
  const toast = useToast();
  const [rooms,       setRooms]       = useState<Room[]>([]);
  const [roomsLoading,setRoomsLoading]= useState(true);

  // Walk-in form
  const [wi,        setWi]        = useState(EMPTY_WALKIN);
  const [wiLoading, setWiLoading] = useState(false);
  const [wiErrors,  setWiErrors]  = useState<Partial<typeof EMPTY_WALKIN>>({});
  const [wiSuccess, setWiSuccess] = useState<Reservation | null>(null);

  // Phone-convert form
  const [ph,        setPh]        = useState(EMPTY_PHONE);
  const [phLoading, setPhLoading] = useState(false);
  const [phErrors,  setPhErrors]  = useState<Partial<typeof EMPTY_PHONE>>({});
  const [phSuccess, setPhSuccess] = useState<Reservation | null>(null);

  const available = rooms.filter(r => r.status === "Available");

  useEffect(() => {
    roomsApi.getAll()
      .then(setRooms)
      .catch(() => toast.error("Failed to load rooms."))
      .finally(() => setRoomsLoading(false));
  }, []);

  // ── Walk-in submit ────────────────────────────────────────────────────
  function validateWi() {
    const e: Partial<typeof EMPTY_WALKIN> = {};
    if (!wi.guestFullName.trim()) e.guestFullName = "Name is required.";
    if (!wi.guestPhone.trim())    e.guestPhone    = "Phone is required.";
    if (!wi.roomId)               e.roomId        = "Select a room.";
    if (!wi.checkOutDate)         e.checkOutDate  = "Check-out date is required.";
    return e;
  }

  async function handleWalkIn(e: FormEvent) {
    e.preventDefault();
    const errs = validateWi();
    if (Object.keys(errs).length) { setWiErrors(errs); return; }
    setWiLoading(true);
    try {
      const res = await reservationsApi.checkIn({
        guestFullName:        wi.guestFullName,
        guestPhone:           wi.guestPhone,
        nationalId:           wi.nationalId || undefined,
        roomId:               Number(wi.roomId),
        checkOutDate:         new Date(wi.checkOutDate).toISOString(),
        existingReservationId: null,
      });
      setWiSuccess(res);
      setWi(EMPTY_WALKIN);
      toast.success(`${res.guestName} checked into room ${res.roomNumber}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed.");
    } finally {
      setWiLoading(false);
    }
  }

  // ── Phone-convert submit ──────────────────────────────────────────────
  function validatePh() {
    const e: Partial<typeof EMPTY_PHONE> = {};
    if (!ph.reservationId.trim()) e.reservationId = "Reservation ID is required.";
    if (!ph.roomId)               e.roomId        = "Select a room.";
    if (!ph.checkOutDate)         e.checkOutDate  = "Check-out date is required.";
    return e;
  }

  async function handlePhoneConvert(e: FormEvent) {
    e.preventDefault();
    const errs = validatePh();
    if (Object.keys(errs).length) { setPhErrors(errs); return; }
    setPhLoading(true);
    try {
      const res = await reservationsApi.checkIn({
        guestFullName:         "",
        guestPhone:            "",
        roomId:                Number(ph.roomId),
        checkOutDate:          new Date(ph.checkOutDate).toISOString(),
        existingReservationId: Number(ph.reservationId),
      });
      setPhSuccess(res);
      setPh(EMPTY_PHONE);
      toast.success(`Reservation #${res.id} checked in to room ${res.roomNumber}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed.");
    } finally {
      setPhLoading(false);
    }
  }

  const roomOptions = available.map(r => (
    <option key={r.id} value={r.id}>
      Room {r.roomNumber} — {r.type} (${r.pricePerNight}/night)
    </option>
  ));

  return (
    <div>
      <PageHeader
        title="Check-in"
        subtitle={`${available.length} room${available.length !== 1 ? "s" : ""} available`}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>

        {/* ── Walk-in ── */}
        <div style={{
          background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)",
          borderRadius: "12px", overflow: "hidden",
        }}>
          <CardHeader
            title="Walk-in guest"
            subtitle="Guest arrives without prior booking"
            icon={<DoorOpen size={14} />}
          />
          <div style={{ padding: "18px" }}>
            {wiSuccess ? (
              <SuccessBanner
                title={`${wiSuccess.guestName} is checked in`}
                sub={`Room ${wiSuccess.roomNumber}`}
                onNew={() => setWiSuccess(null)}
              />
            ) : (
              <form onSubmit={handleWalkIn} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Input
                  label="Full name"
                  placeholder="Guest full name"
                  value={wi.guestFullName}
                  error={wiErrors.guestFullName}
                  onChange={e => {
                    setWi(p => ({ ...p, guestFullName: e.target.value }));
                    setWiErrors(p => ({ ...p, guestFullName: "" }));
                  }}
                />
                <Input
                  label="Phone"
                  placeholder="+966 50 123 4567"
                  value={wi.guestPhone}
                  error={wiErrors.guestPhone}
                  onChange={e => {
                    setWi(p => ({ ...p, guestPhone: e.target.value }));
                    setWiErrors(p => ({ ...p, guestPhone: "" }));
                  }}
                />
                <Input
                  label="National ID (optional)"
                  placeholder="ID number"
                  value={wi.nationalId}
                  onChange={e => setWi(p => ({ ...p, nationalId: e.target.value }))}
                />
                <Select
                  label="Assign room"
                  value={wi.roomId}
                  error={wiErrors.roomId}
                  disabled={roomsLoading || available.length === 0}
                  onChange={e => {
                    setWi(p => ({ ...p, roomId: e.target.value }));
                    setWiErrors(p => ({ ...p, roomId: "" }));
                  }}
                >
                  <option value="">
                    {roomsLoading
                      ? "Loading rooms…"
                      : available.length === 0
                      ? "No available rooms"
                      : "Select a room"}
                  </option>
                  {roomOptions}
                </Select>
                <Input
                  label="Check-out date"
                  type="date"
                  value={wi.checkOutDate}
                  error={wiErrors.checkOutDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => {
                    setWi(p => ({ ...p, checkOutDate: e.target.value }));
                    setWiErrors(p => ({ ...p, checkOutDate: "" }));
                  }}
                />
                <GoldButton type="submit" loading={wiLoading} className="w-full mt-1">
                  Check in guest
                </GoldButton>
              </form>
            )}
          </div>
        </div>

        {/* ── Phone booking conversion ── */}
        <div style={{
          background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)",
          borderRadius: "12px", overflow: "hidden",
        }}>
          <CardHeader
            title="Convert phone booking"
            subtitle="Existing reservation arrives"
            icon={<Phone size={14} />}
          />
          <div style={{ padding: "18px" }}>
            {phSuccess ? (
              <SuccessBanner
                title={`${phSuccess.guestName} is checked in`}
                sub={`Room ${phSuccess.roomNumber}`}
                onNew={() => setPhSuccess(null)}
              />
            ) : (
              <form onSubmit={handlePhoneConvert} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Input
                  label="Reservation ID"
                  placeholder="e.g. 3"
                  type="number"
                  value={ph.reservationId}
                  error={phErrors.reservationId}
                  onChange={e => {
                    setPh(p => ({ ...p, reservationId: e.target.value }));
                    setPhErrors(p => ({ ...p, reservationId: "" }));
                  }}
                />
                <Select
                  label="Assign room"
                  value={ph.roomId}
                  error={phErrors.roomId}
                  disabled={roomsLoading || available.length === 0}
                  onChange={e => {
                    setPh(p => ({ ...p, roomId: e.target.value }));
                    setPhErrors(p => ({ ...p, roomId: "" }));
                  }}
                >
                  <option value="">
                    {roomsLoading
                      ? "Loading rooms…"
                      : available.length === 0
                      ? "No available rooms"
                      : "Select a room"}
                  </option>
                  {roomOptions}
                </Select>
                <Input
                  label="Check-out date"
                  type="date"
                  value={ph.checkOutDate}
                  error={phErrors.checkOutDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => {
                    setPh(p => ({ ...p, checkOutDate: e.target.value }));
                    setPhErrors(p => ({ ...p, checkOutDate: "" }));
                  }}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  loading={phLoading}
                  className="w-full mt-1"
                >
                  Convert &amp; check in
                </Button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function SuccessBanner({
  title, sub, onNew,
}: {
  title: string; sub: string; onNew: () => void;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 0", gap: "12px",
    }}>
      <div style={{
        width: "48px", height: "48px", borderRadius: "50%",
        background: "#eaf3de",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <CheckCircle2 size={24} style={{ color: "#3b6d11" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>{title}</p>
        <p style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>{sub}</p>
      </div>
      <Button variant="ghost" size="sm" onClick={onNew}>
        Check in another guest
      </Button>
    </div>
  );
}
