"use client";

import {
    createContext, useContext, useState,
    useEffect, useCallback, ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, StaffRole } from "@/types";

interface AuthContextValue {
    user: AuthUser | null;
    initialized: boolean;
    login: (token: string, fullName: string, role: string, staffId: number) => void;
    logout: () => void;
    isRole: (...roles: StaffRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const KEY = "hotel_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [initialized, setInitialized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) setUser(JSON.parse(raw));
        } catch {
            localStorage.removeItem(KEY);
        } finally {
            setInitialized(true);
        }
    }, []);

    const login = useCallback(
        (token: string, fullName: string, role: string, staffId: number) => {
            const u: AuthUser = { token, fullName, role: role as StaffRole, staffId };
            localStorage.setItem(KEY, JSON.stringify(u));
            // sync cookie for middleware
            document.cookie = `hotel_auth=${encodeURIComponent(
                JSON.stringify({ role })
            )}; path=/; max-age=${60 * 60 * 12}`;
            setUser(u);
        },
        []
    );

    const logout = useCallback(() => {
        localStorage.removeItem(KEY);
        document.cookie = "hotel_auth=; path=/; max-age=0";
        setUser(null);
        router.push("/login");
    }, [router]);

    const isRole = useCallback(
        (...roles: StaffRole[]) => !!user && roles.includes(user.role),
        [user]
    );

    return (
        <AuthContext.Provider value={{ user, initialized, login, logout, isRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}