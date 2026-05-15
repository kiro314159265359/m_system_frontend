"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { folioApi } from "@/lib/api";
import type { Folio } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardHeader } from "@/components/ui/Card";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { GoldButton, Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import {
  Receipt, ArrowLeft, CheckCircle2,
  Building2, Calendar,
} from "lucide-react";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
}

const LINE_TYPE_LABELS: Record<string, string> = {
  RoomCharge:       "Room",
  RestaurantCharge: "Restaurant",
  Other:            "Other",
};

export default function FolioPage() {
  const { guestId } = useParams<{ guestId: string }>();
  const toast = useToast();

  const [folio,   setFolio]   = useState<Folio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [paying,  setPaying]  = useState(false);

  useEffect(() => {
    folioApi.getByGuest(Number(guestId))
      .then(setFolio)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [guestId]);

  async function handleConfirmPayment() {
    if (!folio) return;
    setPaying(true);
    try {
      await folioApi.confirmPayment(folio.id);
      setFolio(f => f ? { ...f, isPaid: true } : f);
      toast.success("Payment confirmed. Guest checked out.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
        <Link href="/folio/search">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />}>
            Back
          </Button>
        </Link>
        <PageHeader
          title={`Folio — Guest #${guestId}`}
          subtitle={folio ? folio.guestName : ""}
        />
      </div>

      {loading && <Spinner />}

      {!loading && error && (
        <div className="table-wrap">
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "4px" }}>
              No active folio found
            </p>
            <p style={{ fontSize: "12px", color: "#999" }}>{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && folio && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Guest info strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {[
              { icon: <Building2 size={14} />, label: "Room", value: folio.roomNumber },
              { icon: <Calendar size={14} />,  label: "Checked in", value: fmt(folio.createdAt) },
              {
                icon: <Receipt size={14} />,
                label: "Status",
                value: <Badge label={folio.isPaid ? "Paid" : "Open"} variant={folio.isPaid ? "available" : "pending"} />,
              },
            ].map((info, i) => (
              <div key={i} style={{
                background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)",
                borderRadius: "10px", padding: "14px",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "#faeeda", color: "#854f0b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", flexShrink: 0,
                }}>
                  {info.icon}
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#999" }}>{info.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#111", marginTop: "1px" }}>
                    {info.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Line items */}
          <div className="table-wrap">
            <CardHeader
              title="Charges"
              subtitle={`${folio.lines.length} line item${folio.lines.length !== 1 ? "s" : ""}`}
              icon={<Receipt size={14} />}
            />
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {folio.lines.map(line => (
                  <tr key={line.id}>
                    <td>{line.description}</td>
                    <td>
                      <Badge
                        label={LINE_TYPE_LABELS[line.lineType] ?? line.lineType}
                        variant={statusVariant(line.lineType)}
                      />
                    </td>
                    <td style={{ fontSize: "11px", color: "#999" }}>
                      {fmtTime(line.createdAt)}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      ${line.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total + payment */}
            <div style={{
              padding: "16px 18px",
              borderTop: "0.5px solid rgba(0,0,0,0.07)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  fontSize: "10px", color: "#999",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  Total due
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginTop: "3px" }}>
                  ${folio.total.toFixed(2)}
                </div>
              </div>

              {folio.isPaid ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#eaf3de", border: "0.5px solid #c0dd97",
                  borderRadius: "10px", padding: "10px 16px",
                }}>
                  <CheckCircle2 size={18} style={{ color: "#3b6d11" }} />
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#3b6d11" }}>
                      Paid &amp; checked out
                    </div>
                    <div style={{ fontSize: "10px", color: "#63881f" }}>
                      Payment confirmed
                    </div>
                  </div>
                </div>
              ) : (
                <GoldButton
                  loading={paying}
                  onClick={handleConfirmPayment}
                  icon={<CheckCircle2 size={15} />}
                  style={{ padding: "10px 20px", fontSize: "13px" }}
                >
                  Confirm payment
                </GoldButton>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
