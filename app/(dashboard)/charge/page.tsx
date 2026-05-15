"use client";

import { useState, FormEvent } from "react";
import { restaurantApi } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { GoldButton } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { UtensilsCrossed } from "lucide-react";

const EMPTY = { guestId: "", description: "", amount: "" };

export default function ChargePage() {
  const toast = useToast();

  const [form,       setForm]       = useState(EMPTY);
  const [errors,     setErrors]     = useState<Partial<typeof EMPTY>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const e: Partial<typeof EMPTY> = {};
    if (!form.guestId || Number(form.guestId) <= 0)
      e.guestId = "Enter a valid guest ID.";
    if (!form.description.trim())
      e.description = "Description is required.";
    if (!form.amount || Number(form.amount) <= 0)
      e.amount = "Amount must be greater than 0.";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await restaurantApi.addCharge({
        guestId:     Number(form.guestId),
        description: form.description,
        amount:      Number(form.amount),
      });
      toast.success(`$${Number(form.amount).toFixed(2)} charged to guest #${form.guestId}.`);
      setForm(EMPTY);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Charge failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function field(key: keyof typeof EMPTY, value: string) {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: "" }));
  }

  return (
    <div>
      <PageHeader
        title="Restaurant"
        subtitle="Add food and beverage charges to a guest folio"
      />

      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div style={{
          background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)",
          borderRadius: "12px", overflow: "hidden",
        }}>
          <CardHeader
            title="Add charge"
            icon={<UtensilsCrossed size={14} />}
          />
          <div style={{ padding: "18px" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Input
                label="Guest ID"
                type="number"
                placeholder="e.g. 3"
                min={1}
                value={form.guestId}
                error={errors.guestId}
                onChange={e => field("guestId", e.target.value)}
              />
              <Input
                label="Description"
                placeholder="e.g. Dinner for 2"
                value={form.description}
                error={errors.description}
                onChange={e => field("description", e.target.value)}
              />
              <Input
                label="Amount (USD)"
                type="number"
                placeholder="0.00"
                min={0.01}
                step={0.01}
                value={form.amount}
                error={errors.amount}
                onChange={e => field("amount", e.target.value)}
              />

              {/* Preview */}
              {form.guestId && form.description && form.amount && (
                <div style={{
                  background: "#faeeda", border: "0.5px solid #fac775",
                  borderRadius: "8px", padding: "10px 14px",
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, color: "#854f0b", marginBottom: "4px" }}>
                    Charge preview
                  </div>
                  <div style={{ fontSize: "12px", color: "#333" }}>
                    <strong>${Number(form.amount).toFixed(2)}</strong> — {form.description}
                  </div>
                  <div style={{ fontSize: "10px", color: "#888", marginTop: "2px" }}>
                    → Guest #{form.guestId}
                  </div>
                </div>
              )}

              <GoldButton
                type="submit"
                loading={submitting}
                className="w-full"
              >
                Add to folio
              </GoldButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
