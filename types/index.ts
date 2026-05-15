export type StaffRole =
    | "Admin"
    | "Reception"
    | "Cashier"
    | "RoomService"
    | "Restaurant";

export interface AuthUser {
    staffId: number;
    fullName: string;
    role: StaffRole;
    token: string;
}

export type RoomStatus = "Available" | "Occupied" | "Dirty" | "Maintenance";
export type RoomType = "Single" | "Double" | "Suite";

export interface Room {
    id: number;
    roomNumber: string;
    type: RoomType;
    status: RoomStatus;
    pricePerNight: number;
}

export type ReservationStatus = "Pending" | "CheckedIn" | "CheckedOut" | "Cancelled";
export type ReservationSource = "Phone" | "WalkIn";

export interface Reservation {
    id: number;
    guestName: string;
    guestPhone: string;
    roomNumber: string | null;
    status: ReservationStatus;
    source: ReservationSource;
    checkInDate: string;
    checkOutDate: string;
}

export type FolioLineType = "RoomCharge" | "RestaurantCharge" | "Other";

export interface FolioLine {
    id: number;
    lineType: FolioLineType;
    description: string;
    amount: number;
    createdAt: string;
}

export interface Folio {
    id: number;
    reservationId: number;
    guestName: string;
    roomNumber: string;
    isPaid: boolean;
    total: number;
    createdAt: string;
    lines: FolioLine[];
}

export interface InventoryItem {
    id: number;
    name: string;
    quantity: number;
}

export interface Staff {
    id: number;
    fullName: string;
    username: string;
    role: StaffRole;
    isActive: boolean;
}