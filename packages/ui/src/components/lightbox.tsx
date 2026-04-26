import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { cn } from "@workspace/ui/lib/utils"
import {
	XMarkIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline"

export interface LightboxImage {
	url: string
	alt?: string
}

export interface LightboxProps {
	images: LightboxImage[]
	initialIndex?: number
	open: boolean
	onOpenChange: (open: boolean) => void
	/** Content rendered in the right sidebar (e.g. comments) */
	sidebar?: ReactNode
}

export function Lightbox({
	images,
	initialIndex = 0,
	open,
	onOpenChange,
	sidebar,
}: LightboxProps) {
	const [index, setIndex] = useState(initialIndex)
	const popupRef = useRef<HTMLDivElement>(null)

	// Reset index when opening with a new initialIndex
	useEffect(() => {
		if (open) setIndex(initialIndex)
	}, [open, initialIndex])

	const hasNext = index < images.length - 1
	const hasPrev = index > 0

	const goNext = useCallback(() => {
		setIndex((i) => Math.min(i + 1, images.length - 1))
	}, [images.length])

	const goPrev = useCallback(() => {
		setIndex((i) => Math.max(i - 1, 0))
	}, [])

	// Keyboard handler on the popup element itself (inside the focus trap)
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "ArrowRight") {
				e.preventDefault()
				goNext()
			} else if (e.key === "ArrowLeft") {
				e.preventDefault()
				goPrev()
			}
		},
		[goNext, goPrev],
	)

	const current = images[index]

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/90 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
				<DialogPrimitive.Popup
					ref={popupRef}
					onKeyDown={handleKeyDown}
					className="fixed inset-0 z-50 flex overflow-hidden outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
				>
					{/* Image area */}
					<div
						className="relative flex flex-1 items-center justify-center animate-[lightboxContentIn_300ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
						onClick={() => onOpenChange(false)}
					>
						{/* Close button */}
						<LightboxButton
							onClick={(e) => {
								e.stopPropagation()
								onOpenChange(false)
							}}
							className="absolute top-4 left-4"
						>
							<XMarkIcon className="size-5" />
						</LightboxButton>

						{/* Counter */}
						{images.length > 1 && (
							<span className="absolute top-5 left-1/2 -translate-x-1/2 text-sm text-white/70 tabular-nums">
								{index + 1} / {images.length}
							</span>
						)}

						{/* Previous arrow */}
						{hasPrev && (
							<LightboxButton
								onClick={(e) => {
									e.stopPropagation()
									goPrev()
								}}
								className="absolute left-4 top-1/2 -translate-y-1/2"
							>
								<ChevronLeftIcon className="size-5" />
							</LightboxButton>
						)}

						{/* Image */}
						{current && (
							<img
								src={current.url}
								alt={current.alt ?? ""}
								onClick={(e) => e.stopPropagation()}
								className="max-h-[90vh] max-w-[90%] select-none rounded-lg object-contain"
								key={current.url}
							/>
						)}

						{/* Next arrow */}
						{hasNext && (
							<LightboxButton
								onClick={(e) => {
									e.stopPropagation()
									goNext()
								}}
								className="absolute right-4 top-1/2 -translate-y-1/2"
							>
								<ChevronRightIcon className="size-5" />
							</LightboxButton>
						)}
					</div>

					{/* Sidebar (comments) */}
					{sidebar && (
						<div className="hidden shrink-0 p-3 lg:block">
							<div className="h-full w-[380px] overflow-y-auto rounded-2xl bg-base-1 p-2 shadow-lg animate-[lightboxSidebarIn_400ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
								{sidebar}
							</div>
						</div>
					)}
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}

// ── Lightbox button ───────────────────────────────────
// Dark-context button with visible bg on hover. Can't use the standard
// Button component here because its variants assume a light background.

function LightboxButton({
	children,
	onClick,
	className,
}: {
	children: ReactNode
	onClick?: (e: React.MouseEvent) => void
	className?: string
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex size-9 items-center justify-center rounded-full bg-white/10 text-white/70 outline-none transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-1 focus-visible:ring-white/20 active:scale-95",
				className,
			)}
		>
			{children}
		</button>
	)
}
