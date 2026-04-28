import { Field } from "@base-ui/react/field"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

const inputStyles = [
  "rounded-md border border-neutral bg-base-2 px-3 py-1.5 text-sm text-primary",
  "outline-none",
  "placeholder:text-tertiary",
  "ring-neutral ring-0 transition-[box-shadow,color,border-color] duration-150 ease-out",
  "focus:ring-2 focus:border-neutral-strong",
  "motion-reduce:transition-none",
  "disabled:cursor-not-allowed disabled:opacity-50",
]

const wrapperStyles = [
  "rounded-md border border-neutral bg-base-2 py-1.5 text-sm",
  "ring-neutral ring-0 transition-[box-shadow,color,border-color] duration-150 ease-out",
  "has-[:focus]:ring-2 has-[:focus]:border-neutral-strong",
  "motion-reduce:transition-none",
  "has-[*[disabled]]:cursor-not-allowed has-[*[disabled]]:opacity-50",
]

export interface InputProps extends ComponentProps<"input"> {
  /** Icon element rendered before the input */
  iconLeft?: ReactNode
  /** Icon element rendered after the input */
  iconRight?: ReactNode
  /** Class for the wrapper div when icons are present */
  wrapperClassName?: string
}

export function Input({
  iconLeft,
  iconRight,
  wrapperClassName,
  className,
  ...props
}: InputProps) {
  const hasIcon = !!iconLeft || !!iconRight

  if (!hasIcon) {
    return <input className={cn(inputStyles, "w-full", className)} {...props} />
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5",
        wrapperStyles,
        wrapperClassName
      )}
    >
      {iconLeft && (
        <span className="flex size-5 shrink-0 items-center justify-center text-tertiary [&>svg]:size-4">
          {iconLeft}
        </span>
      )}
      <input
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-tertiary",
          className
        )}
        {...props}
      />
      {iconRight && (
        <span className="flex size-5 shrink-0 items-center justify-center text-tertiary [&>svg]:size-4">
          {iconRight}
        </span>
      )}
    </div>
  )
}

/** Input wired to Base UI Field for form validation */
export interface FormInputProps extends ComponentProps<typeof Field.Control> {
  iconLeft?: ReactNode
  iconRight?: ReactNode
  wrapperClassName?: string
}

export function FormInput({
  iconLeft,
  iconRight,
  wrapperClassName,
  className,
  ...props
}: FormInputProps) {
  const hasIcon = !!iconLeft || !!iconRight

  if (!hasIcon) {
    return (
      <Field.Control
        className={cn(inputStyles, "w-full", className)}
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5",
        wrapperStyles,
        wrapperClassName
      )}
    >
      {iconLeft && (
        <span className="flex size-5 shrink-0 items-center justify-center text-tertiary [&>svg]:size-4">
          {iconLeft}
        </span>
      )}
      <Field.Control
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-tertiary",
          className
        )}
        {...props}
      />
      {iconRight && (
        <span className="flex size-5 shrink-0 items-center justify-center text-tertiary [&>svg]:size-4">
          {iconRight}
        </span>
      )}
    </div>
  )
}
