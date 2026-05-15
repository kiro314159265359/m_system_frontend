import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "gold";
    size?: "sm" | "md";
    loading?: boolean;
    icon?: ReactNode;
}

const BASE: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontWeight: 500,
    borderRadius: "8px",
    transition: "all 0.12s",
    cursor: "pointer",
    outline: "none",
    userSelect: "none",
    border: "0.5px solid transparent",
    fontSize: "13px",
};

const SIZES: Record<string, React.CSSProperties> = {
    sm: { padding: "5px 10px", fontSize: "11px" },
    md: { padding: "8px 16px", fontSize: "13px" },
};

const VARIANTS: Record<string, React.CSSProperties> = {
    primary: {
        background: "#1a1714",
        color: "#fff",
        borderColor: "#1a1714",
    },
    secondary: {
        background: "#fff",
        color: "#333",
        borderColor: "rgba(0,0,0,0.15)",
    },
    danger: {
        background: "#e24b4a",
        color: "#fff",
        borderColor: "#e24b4a",
    },
    ghost: {
        background: "transparent",
        color: "#666",
        borderColor: "transparent",
    },
    gold: {
        background: "#c9a96e",
        color: "#1a1714",
        borderColor: "#c9a96e",
        fontWeight: 600,
    },
};

export function Button({
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    children,
    className = "",
    disabled,
    style: propStyle,
    ...props
}: Props) {
    const mergedStyle: React.CSSProperties = {
        ...BASE,
        ...SIZES[size],
        ...VARIANTS[variant],
        ...(disabled || loading ? { opacity: 0.5, cursor: "not-allowed" } : {}),
        ...propStyle,
    };

    return (
        <button
            disabled={disabled || loading}
            style={mergedStyle}
            className={className}
            {...props}
        >
            {loading
                ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                : icon}
            {children}
        </button>
    );
}

// Gold CTA button used for primary hotel actions
export function GoldButton(props: Omit<Props, "variant">) {
    return (
        <Button
            {...props}
            variant="gold"
        />
    );
}