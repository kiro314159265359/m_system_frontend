"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { GoldButton } from "@/components/ui/Button";
import { User, Lock, AlertCircle } from "lucide-react";
import type { StaffRole } from "@/types";

function defaultRoute(role: StaffRole): string {
    switch (role) {
        case "Admin": return "/dashboard";
        case "Reception": return "/reservations";
        case "Cashier": return "/folio/search";
        case "RoomService": return "/room-status";
        case "Restaurant": return "/charge";
    }
}

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await authApi.login(username, password);
            login(res.token, res.fullName, res.role, res.staffId);
            router.push(defaultRoute(res.role as StaffRole));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">

            {/* Left panel — brand showcase */}
            <div className="login-brand">
                <div className="login-brand-pattern" />
                <div className="login-brand-content">
                    <div className="login-brand-mark">
                        <span>H</span>
                    </div>
                    <h1 className="login-brand-title">Maison</h1>
                    <p className="login-brand-sub">Hotel Management System</p>
                    <div className="login-brand-divider" />
                    <p className="login-brand-tagline">
                        Premium hospitality management — rooms, guests,
                        billing, and operations in one elegant interface.
                    </p>
                </div>
                <p className="login-brand-footer">
                    © {new Date().getFullYear()} Maison Hotels
                </p>
            </div>

            {/* Right panel — sign in form */}
            <div className="login-form-panel">
                <div className="login-form-wrap">

                    <div className="login-form-header">
                        <h2>Welcome back</h2>
                        <p>Sign in to your staff account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            label="Username"
                            type="text"
                            placeholder="e.g. reception1"
                            value={username}
                            onChange={e => {
                                setUsername(e.target.value);
                                setError("");
                            }}
                            icon={<User size={15} />}
                            autoComplete="username"
                            autoFocus
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
                                setError("");
                            }}
                            icon={<Lock size={15} />}
                            autoComplete="current-password"
                            required
                        />

                        {error && (
                            <div className="login-error">
                                <AlertCircle size={14} />
                                <p>{error}</p>
                            </div>
                        )}

                        <GoldButton
                            type="submit"
                            loading={loading}
                            className="w-full mt-1 py-2.5"
                        >
                            Sign in
                        </GoldButton>

                        {process.env.NODE_ENV === "development" && (
                          <div className="login-devtools">
                            <p className="login-devtools-label">
                              Quick fill (dev only)
                            </p>
                            <div className="login-devtools-btns">
                              {[
                                { u: "admin",       p: "admin123",      label: "Admin" },
                                { u: "reception1",  p: "reception123",  label: "Reception" },
                                { u: "cashier1",    p: "cashier123",    label: "Cashier" },
                                { u: "roomsvc1",    p: "roomsvc123",    label: "Room svc" },
                                { u: "restaurant1", p: "rest123",       label: "Restaurant" },
                              ].map(acc => (
                                <button
                                  key={acc.u}
                                  type="button"
                                  onClick={() => { setUsername(acc.u); setPassword(acc.p); }}
                                  className="login-devtools-btn"
                                >
                                  {acc.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}