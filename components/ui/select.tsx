import * as React from "react";

// Inline MagicCard (from Magic UI MCP)
const MagicCard = ({
  children,
  className = "",
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
  gradientFrom = "#9E7AFF",
  gradientTo = "#FE8BBB",
}: {
  children?: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = React.useState({ x: -gradientSize, y: -gradientSize });

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (cardRef.current) {
      const { left, top } = cardRef.current.getBoundingClientRect();
      setMouse({ x: e.clientX - left, y: e.clientY - top });
    }
  }, [cardRef]);

  const handleMouseLeave = React.useCallback(() => {
    setMouse({ x: -gradientSize, y: -gradientSize });
  }, [gradientSize]);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-[inherit] ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-border duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${gradientSize}px circle at ${mouse.x}px ${mouse.y}px, ${gradientFrom}, ${gradientTo}, var(--border) 100%)`,
        }}
      />
      <div className="absolute inset-px rounded-[inherit] bg-background" />
      <div
        className="pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${gradientSize}px circle at ${mouse.x}px ${mouse.y}px, ${gradientColor}, transparent 100%)`,
          opacity: gradientOpacity,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};

// Inline ShineBorder (from Magic UI MCP)
const ShineBorder = ({
  borderWidth = 1,
  duration = 14,
  shineColor = "#000000",
  className = "",
  style = {},
  ...props
}: {
  borderWidth?: number;
  duration?: number;
  shineColor?: string | string[];
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}) => {
  return (
    <div
      style={{
        "--border-width": `${borderWidth}px`,
        "--duration": `${duration}s`,
        backgroundImage: `radial-gradient(transparent,transparent, ${Array.isArray(shineColor) ? shineColor.join(",") : shineColor},transparent,transparent)`,
        backgroundSize: "300% 300%",
        mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: "var(--border-width)",
        ...style,
      } as React.CSSProperties}
      className={`pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine ${className}`}
      {...props}
    />
  );
};

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className = "block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", ...props }, ref) => (
  <MagicCard className="w-full">
    <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
    <select ref={ref} className={className} {...props} />
  </MagicCard>
));

Select.displayName = "Select";