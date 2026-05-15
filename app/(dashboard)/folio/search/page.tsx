"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { GoldButton } from "@/components/ui/Button";
import { Receipt, Search } from "lucide-react";

export default function FolioSearchPage() {
  const router = useRouter();
  const [guestId, setGuestId] = useState("");
  const [error,   setError]   = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const id = parseInt(guestId);
    if (!guestId.trim() || isNaN(id) || id <= 0) {
      setError("Enter a valid guest ID.");
      return;
    }
    router.push(`/folio/${id}`);
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <PageHeader
        title="Guest folio"
        subtitle="Look up and manage guest bills"
      />
      <div className="center-layout">
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{
            background: "#fff", border: "0.5px solid rgba(0,0,0,0.1)",
            borderRadius: "12px", overflow: "hidden",
          }}>
            <div style={{
              padding: "32px",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "18px",
            }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "14px",
                background: "#faeeda",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Receipt size={26} style={{ color: "#854f0b" }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>
                  Find a guest folio
                </p>
                <p style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
                  Enter the guest ID to view their bill
                </p>
              </div>
              <form
                onSubmit={handleSearch}
                style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <Input
                  label="Guest ID"
                  type="number"
                  placeholder="e.g. 3"
                  value={guestId}
                  error={error}
                  icon={<Search size={14} />}
                  min={1}
                  onChange={e => {
                    setGuestId(e.target.value);
                    setError("");
                  }}
                  autoFocus
                />
                <GoldButton type="submit" className="w-full" style={{ padding: "10px" }}>
                  View folio
                </GoldButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
