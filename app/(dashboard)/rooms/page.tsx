"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { roomsApi } from "@/lib/api";
import type { Room, RoomStatus } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusVariant, roomStatusColor } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Building2 } from "lucide-react";

type Filter = "All" | RoomStatus;

const FILTERS: Filter[] = ["All", "Available", "Occupied", "Dirty", "Maintenance"];

const LEGEND: { label: string; color: string }[] = [
  { label: "Available",   color: "bg-[#63b14c]" },
  { label: "Occupied",    color: "bg-[#378add]"  },
  { label: "Dirty",       color: "bg-[#ba7517]" },
  { label: "Maintenance", color: "bg-[#e24b4a]"   },
];

export default function RoomsPage() {
  const [rooms,   setRooms]   = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState<Filter>("All");

  useEffect(() => {
    roomsApi.getAll()
      .then(setRooms)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All"
    ? rooms
    : rooms.filter(r => r.status === filter);

  const counts = {
    Available:   rooms.filter(r => r.status === "Available").length,
    Occupied:    rooms.filter(r => r.status === "Occupied").length,
    Dirty:       rooms.filter(r => r.status === "Dirty").length,
    Maintenance: rooms.filter(r => r.status === "Maintenance").length,
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <PageHeader
            title="Rooms"
            subtitle={`${rooms.length} rooms across 3 floors`}
          />
        </div>
        <div className="filter-buttons">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? "active" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        {LEGEND.map(l => (
          <div key={l.label} className="legend-item">
            <div className={`legend-dot ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && error && (
        <p className="text-sm text-red-500 text-center py-10">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          icon={<Building2 size={28} />}
          title="No rooms found"
          description={`No rooms with status "${filter}".`}
        />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="rooms-grid">
          {filtered.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoomCard({ room }: { room: Room }) {
  return (
    <div className={`room-card ${room.status.toLowerCase()}`}>
      <div className="room-card-top">
        <div>
          <div className="room-card-num">{room.roomNumber}</div>
          <div className="room-card-type">{room.type}</div>
        </div>
        <Badge
          label={room.status}
          variant={statusVariant(room.status)}
        />
      </div>
      <div className="room-card-price">
        <span>${room.pricePerNight}</span> / night
      </div>
      {room.status === "Available" ? (
        <Link href="/checkin">
          <button className="room-card-action gold">
            Check in
          </button>
        </Link>
      ) : room.status === "Dirty" ? (
        <button className="room-card-action">
          Mark clean
        </button>
      ) : room.status === "Maintenance" ? (
        <button className="room-card-action">
          Resolve
        </button>
      ) : (
        <button className="room-card-action" disabled>
          {room.status}
        </button>
      )}
    </div>
  );
}
