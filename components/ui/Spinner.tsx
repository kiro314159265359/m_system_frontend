import { Loader2 } from "lucide-react";

export function Spinner({ text = "Loading..." }: { text?: string }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 0",
            gap: "10px",
        }}>
            <Loader2
                size={22}
                style={{
                    animation: "spin 1s linear infinite",
                    color: "#c9a96e",
                }}
            />
            <p style={{ fontSize: "12px", color: "#999" }}>{text}</p>
        </div>
    );
}