import {
  ArrowPathRoundedSquareIcon,
  ArrowUturnLeftIcon,
  ChartBarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { cn } from "@workspace/ui/lib/utils"
import { Avatar } from "@workspace/ui/components/avatar"
import { UnfurlCardChrome } from "./unfurl-card-chrome"
import type { XUnfurlCard } from "../lib/api"

function formatTimestamp(raw: string): string {
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function compactCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 10_000) return `${(n / 1000).toFixed(1)}k`
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function XStatusCardBlock({
  card,
  className,
}: {
  card: XUnfurlCard
  className?: string
}) {
  return (
    <UnfurlCardChrome href={card.url} className={cn("group p-0", className)}>
      <div className="space-y-3 p-3">
        <div className="flex gap-3">
          <Avatar
            initial={card.authorName.charAt(0)}
            src={card.authorAvatarUrl}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="flex items-center gap-0.5 truncate">
                <span className="font-semibold text-primary">
                  {card.authorName}
                </span>
                {card.authorVerified ? (
                  <CheckBadgeIcon
                    aria-hidden
                    className="size-4 shrink-0 text-sky-500"
                  />
                ) : null}
              </span>
              <span className="truncate text-tertiary">
                @{card.authorScreenName}
              </span>
            </div>
            {card.createdAt ? (
              <div className="mt-0.5 text-sm text-tertiary">
                {formatTimestamp(card.createdAt)}
              </div>
            ) : null}
          </div>
        </div>

        <p className="wrap-break-words text-sm leading-relaxed whitespace-pre-wrap text-primary">
          {card.text}
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-neutral pt-3 text-sm text-tertiary">
          <span className="inline-flex items-center gap-1">
            <ChatBubbleLeftIcon className="size-3.5 shrink-0" />
            {compactCount(card.replies)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ArrowPathRoundedSquareIcon className="size-3.5 shrink-0" />
            {compactCount(card.retweets)}
          </span>
          <span className="inline-flex items-center gap-1">
            <HeartIcon className="size-3.5 shrink-0" />
            {compactCount(card.likes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ArrowUturnLeftIcon className="size-3.5 shrink-0" />
            {compactCount(card.quotes)}
          </span>
          {card.views !== null ? (
            <span className="inline-flex items-center gap-1">
              <ChartBarIcon className="size-3.5 shrink-0" />
              {compactCount(card.views)}
            </span>
          ) : null}
        </div>
      </div>
    </UnfurlCardChrome>
  )
}
