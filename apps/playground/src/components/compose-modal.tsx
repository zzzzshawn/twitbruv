import { useState, useEffect } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Avatar } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { me } from "../data/mock"

const MAX_CHARS = 300

export function ComposeModal({
	open,
	onOpenChange,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const [text, setText] = useState("")
	const remaining = MAX_CHARS - text.length
	const overLimit = remaining < 0
	const pct = Math.min((text.length / MAX_CHARS) * 100, 100)

	// Reset text when modal closes
	useEffect(() => {
		if (!open) setText("")
	}, [open])

	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
				<DialogPrimitive.Popup className="fixed top-[10%] left-1/2 z-50 w-full max-w-[600px] -translate-x-1/2 rounded-2xl bg-base-1 shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3">
						<DialogPrimitive.Close
							className="text-sm text-secondary hover:text-primary"
						>
							Cancel
						</DialogPrimitive.Close>
						<Button
							variant="primary"
							size="sm"
							disabled={text.length === 0 || overLimit}
							onClick={() => onOpenChange(false)}
						>
							Post
						</Button>
					</div>

					{/* Compose area */}
					<div className="flex gap-3 px-4 pt-4 pb-2">
						<Avatar
							initial={me.displayName[0]}
							src={me.avatarUrl}
							size="lg"
						/>
						<div className="min-w-0 flex-1">
							<textarea
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder="What's happening?"
								className="w-full resize-none bg-transparent pt-1 text-base text-primary outline-none placeholder:text-tertiary"
								rows={5}
								autoFocus
							/>
						</div>
					</div>

					{/* Bottom bar */}
					<div className="flex items-center justify-end px-4 py-3">
						{text.length > 0 && (
							<div className="flex items-center gap-2">
								<svg className="size-5" viewBox="0 0 20 20">
									<circle
										cx="10"
										cy="10"
										r="8"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="text-neutral"
									/>
									<circle
										cx="10"
										cy="10"
										r="8"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeDasharray={`${(pct / 100) * 50.27} 50.27`}
										strokeLinecap="round"
										className={cn(
											overLimit ? "text-danger" : "text-primary",
										)}
										transform="rotate(-90 10 10)"
									/>
								</svg>
								{(overLimit || remaining <= 20) && (
									<span
										className={cn(
											"text-xs tabular-nums",
											overLimit ? "text-danger" : "text-secondary",
										)}
									>
										{remaining}
									</span>
								)}
							</div>
						)}
					</div>
				</DialogPrimitive.Popup>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	)
}
