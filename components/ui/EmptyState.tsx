import { ReactNode } from "react";

interface Props {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 0",
            gap: "10px",
        }}>
            <div style={{
                padding: "14px",
                background: "#faeeda",
                borderRadius: "12px",
                color: "#854f0b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {icon}
            </div>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#555" }}>{title}</p>
            {description && (
                <p style={{
                    fontSize: "11px", color: "#999",
                    textAlign: "center", maxWidth: "260px",
                }}>
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}