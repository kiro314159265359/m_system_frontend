import { NextRequest, NextResponse } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
    "/dashboard": ["Admin"],
    "/staff": ["Admin"],
    "/reservations": ["Reception", "Admin"],
    "/checkin": ["Reception", "Admin"],
    "/rooms": ["Reception", "Admin"],
    "/folio": ["Cashier", "Admin"],
    "/room-status": ["RoomService", "Admin"],
    "/inventory": ["RoomService", "Admin"],
    "/charge": ["Restaurant", "Admin"],
};

function defaultPage(role: string): string {
    switch (role) {
        case "Admin": return "/dashboard";
        case "Reception": return "/reservations";
        case "Cashier": return "/folio/search";
        case "RoomService": return "/room-status";
        case "Restaurant": return "/charge";
        default: return "/login";
    }
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (pathname.startsWith("/login")) return NextResponse.next();

    const raw = req.cookies.get("hotel_auth")?.value;
    if (!raw) return NextResponse.redirect(new URL("/login", req.url));

    try {
        const { role } = JSON.parse(decodeURIComponent(raw));
        const match = Object.entries(ROLE_ROUTES).find(([route]) =>
            pathname.startsWith(route)
        );
        if (match && !match[1].includes(role)) {
            return NextResponse.redirect(new URL(defaultPage(role), req.url));
        }
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};