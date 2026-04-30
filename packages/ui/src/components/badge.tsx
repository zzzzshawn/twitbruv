import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

const variantStyles = {
  neutral: "bg-subtle text-secondary",
  danger: "bg-danger-subtle text-danger",
  warning: "bg-warn-subtle text-warn",
  success: "bg-success-subtle text-success",
  /** Matches GitHub contributions heatmap tooltips (border, blur, inset shadow). */
  tooltip:
    "border border-neutral bg-subtle text-[11px] text-primary backdrop-blur-sm px-2 py-1 [box-shadow:var(--shadow-gh-tooltip)]",
} as const

export type BadgeVariant = keyof typeof variantStyles

export interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: ReactNode
}

export function Badge({
  variant = "neutral",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs leading-tight font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
