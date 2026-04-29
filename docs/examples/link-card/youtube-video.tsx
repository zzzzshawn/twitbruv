import { PlayIcon } from "@heroicons/react/24/solid"
import { LinkCardShell } from "@workspace/ui/components/link-card"

export default function YoutubeVideoCard() {
	return (
		<LinkCardShell href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="p-0">
			<div className="relative aspect-video w-full bg-black">
				<img
					src="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
					alt=""
					className="size-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
				<span className="absolute right-2 bottom-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium text-white tabular-nums">
					3:33
				</span>
				<div className="absolute inset-0 flex items-center justify-center">
					<span className="flex size-14 items-center justify-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur-sm">
						<PlayIcon className="size-8 translate-x-0.5" />
					</span>
				</div>
			</div>
			<div className="space-y-1 p-3">
				<div className="flex items-center gap-2 text-sm text-tertiary">
					<span className="font-semibold tracking-wide text-red-500">
						YouTube
					</span>
					<span className="truncate">Rick Astley</span>
				</div>
				<h3 className="line-clamp-2 text-sm font-semibold text-primary">
					Rick Astley - Never Gonna Give You Up (Official Music Video)
				</h3>
				<p className="flex flex-wrap gap-x-2 gap-y-0.5 text-sm text-tertiary">
					<span>1.6B views</span>
					<span>16M likes</span>
					<span>3.2M comments</span>
				</p>
			</div>
		</LinkCardShell>
	)
}
