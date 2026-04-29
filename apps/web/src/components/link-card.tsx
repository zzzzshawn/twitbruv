import { useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { UnfurlCardChrome } from "./unfurl-card-chrome"
import type { GenericUnfurlCard } from "../lib/api"

export function trimTrailingPunct(url: string): string {
  return url.replace(/[),.;:!?]+$/, "")
}

function faviconServiceUrl(hostname: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=32`
}

function safeHost(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, "")
  } catch {
    return ""
  }
}

export function LinkPill({
  url,
  className,
}: {
  url: string
  className?: string
}) {
  const trimmed = trimTrailingPunct(url)
  let label = trimmed
  try {
    label = new URL(trimmed).hostname.replace(/^www\./, "")
  } catch {}
  const fav =
    label.length > 0
      ? faviconServiceUrl(label)
      : faviconServiceUrl(safeHost(trimmed) || "example.com")

  return (
    <a
      href={trimmed}
      target="_blank"
      rel="noreferrer"
      title={trimmed}
      data-post-card-ignore-open
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex max-w-[min(100%,14rem)] items-baseline gap-1.5 rounded-md border border-neutral bg-base-2 px-1.5 py-0.5 align-middle font-semibold tracking-tight text-primary no-underline shadow-[var(--inset-shadow-primary)] transition hover:scale-[1.03] hover:bg-subtle",
        className
      )}
    >
      <img
        src={fav}
        alt=""
        width={12}
        height={12}
        className="size-3 shrink-0 self-center rounded-[3px] object-cover"
        loading="lazy"
      />
      <span className="truncate">{label}</span>
    </a>
  )
}

export function LinkCardBlock({
  card,
  className,
}: {
  card: GenericUnfurlCard
  className?: string
}) {
  const host = safeHost(card.url)
  const siteLabel = card.siteName ?? host
  const [heroOk, setHeroOk] = useState(Boolean(card.imageUrl))
  const [faviconOk, setFaviconOk] = useState(Boolean(card.faviconUrl))
  const fallbackFav = faviconServiceUrl(host || siteLabel || "example.com")

  const hasHero = Boolean(card.imageUrl) && heroOk

  return (
    <UnfurlCardChrome href={card.url} className={cn("group p-0", className)}>
      {hasHero ? (
        <div className="relative aspect-video overflow-hidden bg-base-2">
          <img
            src={card.imageUrl!}
            alt=""
            width={1200}
            height={630}
            loading="lazy"
            decoding="async"
            onError={() => setHeroOk(false)}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
          />
        </div>
      ) : null}

      <div className={cn("space-y-2", hasHero ? "p-3 pt-3" : "p-3")}>
        <div className="flex gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-subtle ring-1 ring-neutral">
            {card.faviconUrl && faviconOk ? (
              <img
                src={card.faviconUrl}
                alt=""
                width={36}
                height={36}
                className="size-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setFaviconOk(false)}
              />
            ) : (
              <img
                src={fallbackFav}
                alt=""
                width={36}
                height={36}
                className="size-7 object-cover"
                loading="lazy"
              />
            )}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="truncate text-[11px] text-tertiary">
              {siteLabel}
            </div>
            <h3 className="text-[15px] leading-snug font-semibold tracking-tight text-primary">
              {card.title}
            </h3>
            {card.description ? (
              <p className="line-clamp-3 text-[13px] leading-relaxed text-tertiary">
                {card.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-0.5 text-[11.5px] font-medium text-tertiary transition group-hover:text-primary">
          <span>Open {host}</span>
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
