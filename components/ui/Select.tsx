import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
    ({ label, error, className = "", children, ...props }, ref) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {label && (
                <label style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#c9a96e",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                }}>
                    {label}
                </label>
            )}
            <div style={{ position: "relative" }}>
                <select
                    ref={ref}
                    style={{
                        width: "100%",
                        paddingLeft: "0.875rem",
                        paddingRight: "2.25rem",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        fontSize: "13px",
                        background: "#2c2c2a",
                        color: "#f5f0e8",
                        border: "0.5px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        outline: "none",
                        appearance: "none",
                        transition: "all 0.15s",
                        cursor: "pointer",
                    }}
                    className={[
                        "focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]/30",
                        "disabled:bg-[#1a1714] disabled:cursor-not-allowed disabled:text-[#5f5e5a]",
                        error ? "border-red-400/50 focus:ring-red-400/50 focus:border-red-400" : "",
                        className,
                    ].join(" ")}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown
                    size={14}
                    style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#888780",
                        pointerEvents: "none",
                    }}
                />
            </div>
            {error && <p style={{ fontSize: "11px", color: "#e24b4a" }}>{error}</p>}
        </div>
    )
);
Select.displayName = "Select";