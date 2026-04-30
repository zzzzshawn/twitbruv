import { cn } from "@workspace/ui/lib/utils"
import type { ComponentProps } from "react"

const textareaStyles = [
  "rounded-md bg-base-2 px-3 py-2 text-sm text-primary shadow-[var(--shadow-field)]",
  "outline-none resize-y min-h-20",
  "placeholder:text-tertiary",
  "ring-neutral ring-0 transition-[box-shadow,color,border-color] duration-150 ease-out",
  "focus:ring-2 focus:border-neutral-strong",
  "motion-reduce:transition-none",
  "disabled:cursor-not-allowed disabled:opacity-50",
]

export interface TextareaProps extends ComponentProps<"textarea"> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea className={cn(textareaStyles, "w-full", className)} {...props} />
  )
}
