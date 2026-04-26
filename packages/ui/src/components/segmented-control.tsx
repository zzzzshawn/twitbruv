import { useRef, useState, useLayoutEffect, useCallback } from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface SegmentedControlProps<T extends string> {
	items: readonly T[]
	value: T
	onChange: (value: T) => void
	className?: string
}

/**
 * Segmented control with a sliding active indicator.
 * The background pill smoothly animates between items on selection.
 */
export function SegmentedControl<T extends string>({
	items,
	value,
	onChange,
	className,
}: SegmentedControlProps<T>) {
	const containerRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<Map<T, HTMLButtonElement>>(new Map())
	const [pillStyle, setPillStyle] = useState<React.CSSProperties>({})
	const [hasTransition, setHasTransition] = useState(false)

	const measure = useCallback(() => {
		const el = itemRefs.current.get(value)
		if (!el || !containerRef.current) return

		const containerRect = containerRef.current.getBoundingClientRect()
		const itemRect = el.getBoundingClientRect()

		setPillStyle({
			width: itemRect.width,
			height: itemRect.height,
			transform: `translateX(${itemRect.left - containerRect.left}px)`,
		})
	}, [value])

	// Measure on value change
	useLayoutEffect(() => {
		measure()
		// Enable transition after first measurement so initial render doesn't animate
		requestAnimationFrame(() => setHasTransition(true))
	}, [measure])

	// Re-measure on resize
	useLayoutEffect(() => {
		const observer = new ResizeObserver(() => measure())
		if (containerRef.current) observer.observe(containerRef.current)
		return () => observer.disconnect()
	}, [measure])

	return (
		<div
			ref={containerRef}
			className={cn("relative flex items-center gap-0.5", className)}
		>
			{/* Sliding pill */}
			<div
				className={cn(
					"absolute left-0 top-0 rounded-lg bg-subtle",
					hasTransition &&
						"transition-[transform,width] duration-250 ease-out-expo motion-reduce:transition-none",
				)}
				style={pillStyle}
			/>

			{/* Items */}
			{items.map((item) => (
				<button
					key={item}
					ref={(el) => {
						if (el) itemRefs.current.set(item, el)
						else itemRefs.current.delete(item)
					}}
					type="button"
					onClick={() => onChange(item)}
					className={cn(
						"relative z-[1] cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium outline-none select-none transition-colors duration-150",
						item === value ? "text-primary" : "text-tertiary hover:text-secondary",
					)}
				>
					{item}
				</button>
			))}
		</div>
	)
}
