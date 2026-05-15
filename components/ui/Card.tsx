import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`card ${className}`}
            style={{
                background: "#fff",
                border: "0.5px solid rgba(0,0,0,0.1)",
                borderRadius: "12px",
                overflow: "hidden",
            }}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    title,
    subtitle,
    action,
    icon,
}: {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    icon?: ReactNode;
}) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "0.5px solid rgba(0,0,0,0.07)",
            background: "#fafaf9",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {icon && (
                    <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "7px",
                        background: "#faeeda",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        color: "#854f0b",
                    }}>
                        {icon}
                    </div>
                )}
                <div>
                    <h2 style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#111",
                    }}>
                        {title}
                    </h2>
                    {subtitle && (
                        <p style={{
                            fontSize: "11px",
                            color: "#999",
                            marginTop: "1px",
                        }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {action}
        </div>
    );
}

export function StatCard({
    label,
    value,
    sub,
    icon,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: ReactNode;
    iconBg?: string;
    iconColor?: string;
}) {
    return (
        <div className="stat-card">
            <div className="stat-head">
                <p className="stat-label">{label}</p>
                <div className="stat-icon" style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "7px",
                    fontSize: "13px",
                }}>
                    {icon}
                </div>
            </div>
            <p className="stat-val">{value}</p>
            {sub && <p className="stat-sub">{sub}</p>}
        </div>
    );
}