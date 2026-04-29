import {
	ArrowPathRoundedSquareIcon,
	ArrowUturnLeftIcon,
	ChartBarIcon,
	ChatBubbleLeftIcon,
	HeartIcon,
} from "@heroicons/react/24/outline"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { Avatar } from "@workspace/ui/components/avatar"
import { LinkCardShell } from "@workspace/ui/components/link-card"

export default function XStatusCard() {
	return (
		<LinkCardShell href="https://x.com/example/status/1234" className="p-0">
			<div className="space-y-3 p-3">
				<div className="flex gap-3">
					<Avatar initial="G" size="lg" />
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-1.5 text-sm">
							<span className="flex items-center gap-0.5 truncate">
								<span className="font-semibold text-primary">
									Guillermo Rauch
								</span>
								<CheckBadgeIcon
									aria-hidden
									className="size-4 shrink-0 text-sky-500"
								/>
							</span>
							<span className="truncate text-tertiary">@rauchg</span>
						</div>
						<div className="mt-0.5 text-sm text-tertiary">Apr 28, 2026</div>
					</div>
				</div>

				<p className="text-sm leading-relaxed whitespace-pre-wrap text-primary">
					Vercel just deployed its 1 billionth build. What a ride.
				</p>

				<div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-neutral pt-3 text-sm text-tertiary">
					<span className="inline-flex items-center gap-1">
						<ChatBubbleLeftIcon className="size-3.5 shrink-0" />
						342
					</span>
					<span className="inline-flex items-center gap-1">
						<ArrowPathRoundedSquareIcon className="size-3.5 shrink-0" />
						1.2k
					</span>
					<span className="inline-flex items-center gap-1">
						<HeartIcon className="size-3.5 shrink-0" />
						8.4k
					</span>
					<span className="inline-flex items-center gap-1">
						<ArrowUturnLeftIcon className="size-3.5 shrink-0" />
						89
					</span>
					<span className="inline-flex items-center gap-1">
						<ChartBarIcon className="size-3.5 shrink-0" />
						1.2M
					</span>
				</div>
			</div>
		</LinkCardShell>
	)
}
