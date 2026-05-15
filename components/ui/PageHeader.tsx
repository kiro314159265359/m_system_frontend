import { ReactNode } from "react";

interface Props {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: Props) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: "3px",
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{
                        fontSize: "12px",
                        color: "#c9a96e",
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}