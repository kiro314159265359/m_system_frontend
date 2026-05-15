"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { StaffRole } from "@/types";
import {
    LayoutDashboard, Users, CalendarCheck,
    DoorOpen, Building2, Receipt,
    Wrench, Package, UtensilsCrossed, LogOut,
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles: StaffRole[];
    section: string;
}

const NAV: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard size={16} />,
        roles: ["Admin"],
        section: "Overview",
    },
    {
        label: "Reservations",
        href: "/reservations",
        icon: <CalendarCheck size={16} />,
        roles: ["Reception", "Admin"],
        section: "Front desk",
    },
    {
        label: "Check-in",
        href: "/checkin",
        icon: <DoorOpen size={16} />,
        roles: ["Reception", "Admin"],
        section: "Front desk",
    },
    {
        label: "Rooms",
        href: "/rooms",
        icon: <Building2 size={16} />,
        roles: ["Reception", "Admin"],
        section: "Front desk",
    },
    {
        label: "Folio",
        href: "/folio/search",
        icon: <Receipt size={16} />,
        roles: ["Cashier", "Admin"],
        section: "Operations",
    },
    {
        label: "Room status",
        href: "/room-status",
        icon: <Wrench size={16} />,
        roles: ["RoomService", "Admin"],
        section: "Operations",
    },
    {
        label: "Inventory",
        href: "/inventory",
        icon: <Package size={16} />,
        roles: ["RoomService", "Admin"],
        section: "Operations",
    },
    {
        label: "Restaurant",
        href: "/charge",
        icon: <UtensilsCrossed size={16} />,
        roles: ["Restaurant", "Admin"],
        section: "Operations",
    },
    {
        label: "Staff",
        href: "/staff",
        icon: <Users size={16} />,
        roles: ["Admin"],
        section: "Admin",
    },
];

// Section ordering
const SECTION_ORDER = ["Overview", "Front desk", "Operations", "Admin"];

function initials(name: string) {
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

export function Sidebar() {
    const { user, logout, isRole } = useAuth();
    const pathname = usePathname();

    const visible = NAV.filter(item => isRole(...item.roles));

    // Group by section
    const grouped = SECTION_ORDER
        .map(section => ({
            label: section,
            items: visible.filter(item => item.section === section),
        }))
        .filter(g => g.items.length > 0);

    return (
        <aside className="dashboard-sidebar">

            {/* Logo */}
            <div className="sb-logo">
                <div className="sb-logo-mark">
                    <div className="sb-diamond">
                        <span>H</span>
                    </div>
                    <div>
                        <div className="sb-name">Maison</div>
                        <div className="sb-sub">Hotel Management</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="sb-nav">
                {grouped.map(group => (
                    <div key={group.label}>
                        <div className="sb-section">{group.label}</div>
                        {group.items.map(item => {
                            const active =
                                pathname === item.href ||
                                (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`sb-item ${active ? "active" : ""}`}
                                >
                                    {item.icon}
                                    {item.label}
                                    {active && (
                                        <div className="dot" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User footer */}
            <div className="sb-foot">
                <div className="sb-user">
                    <div className="sb-avatar">
                        {user ? initials(user.fullName) : "??"}
                    </div>
                    <div>
                        <div className="sb-uname">{user?.fullName}</div>
                        <div className="sb-urole">{user?.role}</div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={logout}
                    className="sb-logout"
                >
                    <LogOut size={14} strokeWidth={2} />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}