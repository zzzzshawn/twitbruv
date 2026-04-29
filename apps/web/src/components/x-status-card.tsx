import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"
import { CheckBadgeIcon } from "@heroicons/react/24/solid"
import { cn } from "@workspace/ui/lib/utils"
import { UnfurlCardChrome } from "./unfurl-card-chrome"
import type { XUnfurlCard } from "../lib/api"

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
          {card.authorAvatarUrl ? (
            <img
              src={card.authorAvatarUrl}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-full object-cover ring-1 ring-neutral"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="size-11 shrink-0 rounded-full bg-subtle ring-1 ring-neutral" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="truncate font-semibold text-primary">
                {card.authorName}
              </span>
              {card.authorVerified ? (
                <CheckBadgeIcon
                  aria-hidden
                  className="size-4 shrink-0 text-sky-500"
                />
              ) : null}
              <span className="truncate text-[13px] text-tertiary">
                @{card.authorScreenName}
              </span>
            </div>
            {card.createdAt ? (
              <div className="mt-0.5 text-[11px] text-tertiary">
                {card.createdAt}
              </div>
            ) : null}
          </div>
        </div>

        <p className="wrap-break-words text-[15px] leading-relaxed whitespace-pre-wrap text-primary">
          {card.text}
        </p>

        <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-neutral pt-3 text-[12px] text-tertiary">
          <span className="inline-flex items-center gap-1">
            <ChatBubbleLeftRightIcon className="size-3.5 shrink-0" />
            {compactCount(card.replies)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ArrowPathIcon className="size-3.5 shrink-0" />
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

        <div className="flex items-center gap-1.5 pt-0.5 text-[11.5px] font-medium text-tertiary transition group-hover:text-primary">
          <span>Open on X</span>
          <span
            aria-hidden
            className="transition duration-300 group-hover:translate-x-0.5"
          >
            →
          </span>
        </div>
      </div>
    </UnfurlCardChrome>
  )
}
