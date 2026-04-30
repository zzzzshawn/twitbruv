import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps } from "react"

export interface DividerProps extends ComponentProps<"div"> {}

/** Full-width 1px rule on `bg-base-0` with theme `shadow-divider` highlight. */
export function Divider({ className, ...props }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn(
        "h-px w-full shrink-0 bg-base-0 shadow-(--shadow-divider)",
        className
      )}
      {...props}
    />
  )
}
