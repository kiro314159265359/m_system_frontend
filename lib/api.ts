import type {
    Room, Reservation, Folio,
    InventoryItem, Staff
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5199";

function getToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem("hotel_auth");
        return raw ? JSON.parse(raw).token : null;
    } catch {
        return null;
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = getToken();

    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init.headers,
        },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? `Request failed (${res.status})`);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

export const authApi = {
    login: (username: string, password: string) =>
        request<{ token: string; fullName: string; role: string; staffId: number }>(
            "/api/auth/login",
            { method: "POST", body: JSON.stringify({ username, password }) }
        ),
};

export const roomsApi = {
    getAll: () => request<Room[]>("/api/rooms"),
    updateStatus: (id: number, status: string) =>
        request<void>(`/api/rooms/${id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
        }),
};

export const reservationsApi = {
    getActive: () => request<Reservation[]>("/api/reservations"),
    phoneBooking: (data: {
        guestFullName: string;
        guestPhone: string;
        checkInDate: string;
        checkOutDate: string;
    }) =>
        request<Reservation>("/api/reservations/phone", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    checkIn: (data: {
        guestFullName: string;
        guestPhone: string;
        nationalId?: string;
        roomId: number;
        checkOutDate: string;
        existingReservationId?: number | null;
    }) =>
        request<Reservation>("/api/reservations/checkin", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

export const folioApi = {
    getByGuest: (guestId: number) =>
        request<Folio>(`/api/folio/guest/${guestId}`),
    getByReservation: (reservationId: number) =>
        request<Folio>(`/api/folio/reservation/${reservationId}`),
    confirmPayment: (folioId: number) =>
        request<void>(`/api/folio/${folioId}/confirm-payment`, {
            method: "POST",
        }),
};

export const restaurantApi = {
    addCharge: (data: {
        guestId: number;
        description: string;
        amount: number;
    }) =>
        request<void>("/api/restaurant/charge", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

export const inventoryApi = {
    getAll: () => request<InventoryItem[]>("/api/inventory"),
    use: (data: { roomId: number; itemId: number; quantity: number }) =>
        request<void>("/api/inventory/use", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

export const staffApi = {
    getAll: () => request<Staff[]>("/api/staff"),
};