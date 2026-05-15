import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(
    ({ label, error, hint, icon, className = "", style, ...props }, ref) => (
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
                {icon && (
                    <span
                        style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            display: "flex",
                            alignItems: "center",
                            color: "#888780",
                        }}
                    >
                        {icon}
                    </span>
                )}
                <input
                    ref={ref}
                    style={{
                        width: "100%",
                        paddingLeft: icon ? "2.5rem" : "0.875rem",
                        paddingRight: "0.875rem",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        fontSize: "13px",
                        background: "#2c2c2a",
                        color: "#f5f0e8",
                        border: "0.5px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        outline: "none",
                        transition: "all 0.15s",
                        ...style,
                    }}
                    className={[
                        "placeholder:text-[#888780]",
                        "focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]/30",
                        "disabled:bg-[#1a1714] disabled:text-[#5f5e5a] disabled:cursor-not-allowed",
                        error ? "border-red-400/50 focus:ring-red-400/50 focus:border-red-400" : "",
                        className,
                    ].join(" ")}
                    {...props}
                />
            </div>
            {error && <p style={{ fontSize: "11px", color: "#e24b4a" }}>{error}</p>}
            {hint && !error && <p style={{ fontSize: "11px", color: "#888780" }}>{hint}</p>}
        </div>
    )
);
Input.displayName = "Input";