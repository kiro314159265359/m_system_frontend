"use client";

import { useEffect, useState, FormEvent } from "react";
import { inventoryApi, roomsApi } from "@/lib/api";
import type { InventoryItem, Room } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { GoldButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { Package, CheckCircle2 } from "lucide-react";

const EMPTY = { roomId: "", itemId: "", quantity: "1" };

export default function InventoryPage() {
  const toast = useToast();

  const [items,      setItems]      = useState<InventoryItem[]>([]);
  const [rooms,      setRooms]      = useState<Room[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState<Partial<typeof EMPTY>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [i, r] = await Promise.all([
        inventoryApi.getAll(),
        roomsApi.getAll(),
      ]);
      setItems(i);
      setRooms(r.filter(r => r.status === "Occupied"));
    } catch {
      toast.error("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  function validate() {
    const e: Partial<typeof EMPTY> = {};
    if (!form.roomId)                         e.roomId   = "Select a room.";
    if (!form.itemId)                         e.itemId   = "Select an item.";
    if (!form.quantity || Number(form.quantity) < 1)
                                              e.quantity = "Quantity must be at least 1.";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await inventoryApi.use({
        roomId:   Number(form.roomId),
        itemId:   Number(form.itemId),
        quantity: Number(form.quantity),
      });
      const itemName = items.find(i => i.id === Number(form.itemId))?.name;
      toast.success(`${form.quantity}× ${itemName} logged for room.`);
      setForm(EMPTY);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log usage.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Track and log item usage per room"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>

        {/* Stock list */}
        <div className="table-wrap">
          <CardHeader
            title="Current stock"
            icon={<Package size={14} />}
          />
          {loading ? (
            <div style={{ padding: "32px", display: "flex", justifyContent: "center" }}><Spinner /></div>
          ) : items.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#999", fontSize: "13px" }}>
              No items in inventory
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>In stock</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: "#333" }}>{item.name}</td>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: item.quantity <= 5
                          ? "#e24b4a"
                          : item.quantity <= 15
                          ? "#ba7517"
                          : "#111",
                      }}>
                        {item.quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Use items form */}
        <div style={{
          background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)",
          borderRadius: "12px", overflow: "hidden",
        }}>
          <CardHeader
            title="Log usage"
            icon={<CheckCircle2 size={14} />}
          />
          <div style={{ padding: "16px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Select
                label="Room (occupied)"
                value={form.roomId}
                error={errors.roomId}
                disabled={loading}
                onChange={e => {
                  setForm(p => ({ ...p, roomId: e.target.value }));
                  setErrors(p => ({ ...p, roomId: "" }));
                }}
              >
                <option value="">
                  {loading ? "Loading…" : rooms.length === 0
                    ? "No occupied rooms"
                    : "Select occupied room"}
                </option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Room {r.roomNumber} — {r.type}
                  </option>
                ))}
              </Select>

              <Select
                label="Item"
                value={form.itemId}
                error={errors.itemId}
                disabled={loading || items.length === 0}
                onChange={e => {
                  setForm(p => ({ ...p, itemId: e.target.value }));
                  setErrors(p => ({ ...p, itemId: "" }));
                }}
              >
                <option value="">Select item</option>
                {items.map(i => (
                  <option key={i.id} value={i.id} disabled={i.quantity === 0}>
                    {i.name} ({i.quantity} left)
                  </option>
                ))}
              </Select>

              <Input
                label="Quantity"
                type="number"
                min={1}
                value={form.quantity}
                error={errors.quantity}
                onChange={e => {
                  setForm(p => ({ ...p, quantity: e.target.value }));
                  setErrors(p => ({ ...p, quantity: "" }));
                }}
              />

              <GoldButton
                type="submit"
                loading={submitting}
                className="w-full mt-1"
              >
                Log usage
              </GoldButton>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
