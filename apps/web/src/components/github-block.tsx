import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { StarIcon } from "@heroicons/react/24/solid"
import { cn } from "@workspace/ui/lib/utils"
import { api } from "../lib/api"
import { qk } from "../lib/query-keys"
import type { GithubContributions, GithubPinnedRepo } from "../lib/api"

interface Props {
  handle: string
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 98 96"
      aria-hidden
      className={cn("size-4 shrink-0", className)}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.08 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.446 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.304 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.22-22.231-5.378-22.231-24.106 0-5.301 1.946-9.678 5.136-13.011-.568-1.282-2.227-6.494 1.052-13.576 0 0 4.206-1.297 13.678 5.066 3.91-1.087 8.168-1.667 12.324-1.667s8.406.58 12.324 1.667c9.46-5.363 13.666-5.066 13.666-5.066 2.279 7.08.72 12.294.408 13.576 3.201 3.333 5.124 7.71 5.124 13.011 0 18.764-11.414 22.88-22.269 24.081 1.778 1.576 3.325 4.605 3.325 9.287 0 6.709-.072 12.07-.072 13.686 0 1.303.909 2.852 3.316 2.352C84.92 89.496 98 71.064 98 49.217 98 22 76.075 0 48.854 0z"
      />
    </svg>
  )
}

function ForkGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className={cn("size-3 shrink-0", className)}
      fill="currentColor"
    >
      <path d="M4.5 1.25a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM3 3.5h.75V5.1a2.9 2.9 0 0 0 1.84 2.7L6 7.9l1.16-.1A2.9 2.9 0 0 0 9 5.1V3.5h.75a.75.75 0 0 1 0 1.5H9.75v.1c0 1.45-.92 2.76-2.3 3.25v1.9a1.25 1.25 0 1 1-1.5 0V8.35A3.64 3.64 0 0 1 3.75 5.1V5H3a.75.75 0 0 1 0-1.5Zm2.5 7.5a.25.25 0 1 0 0 .5.25.25 0 0 0 0-.5ZM2.25 9.5a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Zm7 0a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0Z" />
    </svg>
  )
}

export function GithubBlock({ handle }: Props) {
  const { data, error } = useQuery({
    queryKey: qk.connectors.userGithub(handle),
    queryFn: () => api.userGithub(handle),
    retry: false,
  })

  if (error) return null
  if (!data || !data.connected) return null

  return (
    <section className="border-border border-t px-4 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-foreground inline-flex items-center gap-2 text-sm font-semibold">
          <GitHubMark />
          <span>GitHub</span>
          <a
            href={data.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground font-normal hover:underline"
          >
            @{data.login}
          </a>
        </h2>
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[13px]">
          <span>
            <span className="text-foreground font-semibold tabular-nums">
              {data.contributions.totalContributions.toLocaleString()}
            </span>{" "}
            contributions this year
          </span>
          {data.stale && (
            <span className="border-border bg-muted/50 text-muted-foreground rounded-full border px-1.5 py-px text-[10px] tracking-wider uppercase">
              Cached
            </span>
          )}
        </div>
      </div>

      <ContributionsHeatmap data={data.contributions} className="mt-4" />

      {data.pinned.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {data.pinned.map((repo) => (
            <PinnedRepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </section>
  )
}

function ContributionsHeatmap({
  data,
  className,
}: {
  data: GithubContributions
  className?: string
}) {
  const cell = 11
  const gap = 2
  const cols = data.weeks.length
  const width = cols * (cell + gap) - gap
  const height = 7 * (cell + gap) - gap
  const gutterW = 16

  const monthTicks = useMemo(() => {
    const monthFmt = new Intl.DateTimeFormat(undefined, { month: "short" })
    const ticks: { wi: number; label: string }[] = []
    let prevMonth: number | null = null
    data.weeks.forEach((week, wi) => {
      const first = week.days[0]
      if (!first) return
      const d = new Date(`${first.date}T12:00:00Z`)
      const m = d.getUTCMonth()
      if (prevMonth !== m) {
        ticks.push({ wi, label: monthFmt.format(d) })
        prevMonth = m
      }
    })
    return ticks
  }, [data.weeks])

  const legendColors = useMemo(() => {
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const week of data.weeks) {
      for (const day of week.days) {
        if (day.count > 0 && !seen.has(day.color)) {
          seen.add(day.color)
          ordered.push(day.color)
        }
      }
    }
    if (ordered.length >= 5) {
      const out: string[] = []
      for (let i = 0; i < 5; i++) {
        const idx = Math.round((i * (ordered.length - 1)) / 4)
        out.push(ordered[idx]!)
      }
      return out
    }
    if (ordered.length > 0) {
      const padded = [...ordered]
      while (padded.length < 5) padded.push(padded[padded.length - 1]!)
      return padded.slice(0, 5)
    }
    return null
  }, [data.weeks])

  const legendFallbackOpacities = [0.35, 0.5, 0.65, 0.8, 0.95]

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="inline-block min-w-0">
        <div
          className="relative mb-1 h-3.5"
          style={{ marginLeft: gutterW, width }}
        >
          {monthTicks.map(({ wi, label }) => (
            <span
              key={`${wi}-${label}`}
              className="text-muted-foreground absolute top-0 text-[10px] leading-none tabular-nums"
              style={{ left: wi * (cell + gap) }}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="flex items-start">
          <div className="relative shrink-0" style={{ width: gutterW, height }}>
            {[
              { di: 1, label: "Mon" },
              { di: 3, label: "Wed" },
              { di: 5, label: "Fri" },
            ].map(({ di, label }) => (
              <span
                key={di}
                className="text-muted-foreground absolute left-0 -translate-y-1/2 text-[10px] leading-none tabular-nums"
                style={{ top: di * (cell + gap) + cell / 2 }}
              >
                {label}
              </span>
            ))}
          </div>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="GitHub contributions over the last year"
            className="block shrink-0"
          >
            {data.weeks.map((week, wi) =>
              week.days.map((day) => {
                const di = new Date(day.date).getUTCDay()
                const empty = day.count === 0
                return (
                  <rect
                    key={`${wi}-${day.date}`}
                    x={wi * (cell + gap)}
                    y={di * (cell + gap)}
                    width={cell}
                    height={cell}
                    rx={2}
                    ry={2}
                    fill={empty ? "var(--background-color-base-2)" : day.color}
                    fillOpacity={empty ? 0.7 : 1}
                  >
                    <title>{`${day.count} on ${day.date}`}</title>
                  </rect>
                )
              })
            )}
          </svg>
        </div>
        <div
          className="text-muted-foreground mt-2 flex items-center gap-1.5 text-[10px]"
          style={{ marginLeft: gutterW }}
        >
          <span>Less</span>
          {legendColors
            ? legendColors.map((c, i) => (
                <span
                  key={i}
                  className="inline-block size-[11px] shrink-0 rounded-[2px]"
                  style={{ backgroundColor: c }}
                />
              ))
            : legendFallbackOpacities.map((op, i) => (
                <span
                  key={i}
                  className="inline-block size-[11px] shrink-0 rounded-[2px] bg-(--text-color-tertiary)"
                  style={{ opacity: op }}
                />
              ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

function PinnedRepoCard({ repo }: { repo: GithubPinnedRepo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      className="border-border bg-background hover:bg-muted/40 block rounded-md border px-3.5 py-2.5 shadow-xs transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
    >
      <div className="flex items-center gap-1.5 text-[14.5px] font-semibold tracking-tight">
        <span className="truncate">{repo.name}</span>
      </div>
      {repo.description && (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-[12.5px]">
          {repo.description}
        </p>
      )}
      <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-[11.5px]">
        {repo.primaryLanguage && (
          <span className="flex items-center gap-1">
            <span
              aria-hidden
              className="inline-block size-2.5 rounded-full"
              style={{
                backgroundColor: repo.primaryLanguage.color ?? "currentColor",
              }}
            />
            {repo.primaryLanguage.name}
          </span>
        )}
        {repo.stars > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <StarIcon className="size-3 shrink-0" aria-hidden />
            {repo.stars}
          </span>
        )}
        {repo.forks > 0 && (
          <span className="inline-flex items-center gap-0.5">
            <ForkGlyph />
            {repo.forks}
          </span>
        )}
      </div>
    </a>
  )
}
