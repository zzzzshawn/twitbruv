export default function LinkCardWithImage() {
	return (
		<div className="max-w-[560px] overflow-hidden rounded-lg border border-neutral bg-base-1">
			<div className="relative aspect-[1200/630] overflow-hidden bg-base-2">
				<img
					src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop"
					alt=""
					className="absolute inset-0 h-full w-full object-cover"
				/>
			</div>
			<div className="space-y-2 p-3">
				<div className="flex gap-3">
					<span className="mt-0.5 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-subtle ring-1 ring-neutral">
						<span className="text-xs font-bold text-tertiary">E</span>
					</span>
					<div className="min-w-0 flex-1 space-y-1">
						<div className="truncate text-[11px] text-tertiary">
							example.com
						</div>
						<h3 className="text-[15px] leading-snug font-semibold tracking-tight text-primary">
							Building in Public: A Developer's Journey
						</h3>
						<p className="line-clamp-3 text-[13px] leading-relaxed text-tertiary">
							How we shipped a social platform for developers in 90 days, lessons learned, and what's next.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
