import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { useCallback, useState } from "react"
import {
  IdentificationIcon,
  PencilSquareIcon,
  SparklesIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid"
import { Button } from "@workspace/ui/components/button"
import { SegmentedControl } from "@workspace/ui/components/segmented-control"
import { authClient } from "../lib/auth"
import { checkSessionCookie } from "../lib/auth-fns"
import { api } from "../lib/api"
import { qk } from "../lib/query-keys"
import { useMe } from "../lib/me"
import { Compose } from "../components/compose"
import {
  useCompose,
  useOnModalPostCreated,
} from "../components/compose-provider"
import { Feed } from "../components/feed"
import { PageEmpty, PageLoading } from "../components/page-surface"
import { PageFrame } from "../components/page-frame"
import type { Post } from "../lib/api"

const FEED_TABS = ["following", "network", "all"] as const
type FeedTab = (typeof FEED_TABS)[number]

const TAB_LABELS: Record<FeedTab, string> = {
  following: "Following",
  network: "Network",
  all: "All",
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { tab?: FeedTab } => {
    const raw = search.tab
    if (typeof raw === "string" && FEED_TABS.includes(raw as FeedTab)) {
      return { tab: raw as FeedTab }
    }
    return {}
  },
  beforeLoad: async () => {
    const { hasSessionCookie } = await checkSessionCookie()
    if (!hasSessionCookie) throw redirect({ to: "/welcome" })
  },
  component: Home,
})

function Home() {
  const { isPending } = authClient.useSession()
  const { me } = useMe()
  const navigate = useNavigate()
  const { open: openCompose } = useCompose()
  const { tab: searchTab } = Route.useSearch()
  const tab: FeedTab = searchTab ?? "following"
  const [newPost, setNewPost] = useState<Post | null>(null)

  useOnModalPostCreated(
    useCallback((post: Post) => {
      setNewPost(post)
    }, [])
  )

  const loadFeed = useCallback((cursor?: string) => api.feed(cursor), [])
  const loadPublic = useCallback(
    (cursor?: string) => api.publicTimeline(cursor),
    []
  )
  const loadNetwork = useCallback(
    (cursor?: string) => api.networkFeed(cursor),
    []
  )

  const needsHandle = me && !me.handle

  const emptyState =
    tab === "following" ? (
      <PageEmpty
        icon={<UserPlusIcon />}
        title="Build your timeline"
        description="Follow people to see their posts here. Try the public timeline to find someone interesting."
        actions={
          <>
            <Button
              size="sm"
              variant="primary"
              nativeButton={false}
              render={<Link to="/search" />}
            >
              Find people
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link to="/" search={{ tab: "all" }} />}
            >
              View public timeline
            </Button>
          </>
        }
      />
    ) : tab === "network" ? (
      <PageEmpty
        icon={<SparklesIcon />}
        title="Your network is quiet"
        description="Posts liked or reposted by people you follow will surface here. Until then, browse the public timeline."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link to="/" search={{ tab: "all" }} />}
          >
            View public timeline
          </Button>
        }
      />
    ) : (
      <PageEmpty
        icon={<PencilSquareIcon />}
        title="Be the first to post"
        description="Nothing here yet. Share something to get the conversation started."
        actions={
          <Button size="sm" variant="primary" onClick={() => openCompose()}>
            Write a post
          </Button>
        }
      />
    )

  return (
    <PageFrame>
      <header className="sticky top-0 z-40 flex h-12 items-center bg-base-1/80 px-4 backdrop-blur-md">
        <SegmentedControl
          layout="fit"
          variant="ghost"
          value={tab}
          options={FEED_TABS.map((key) => ({
            value: key,
            label: TAB_LABELS[key],
          }))}
          onValueChange={(value) => {
            void navigate({
              to: "/",
              search: value === "following" ? undefined : { tab: value },
            })
          }}
        />
      </header>
      {needsHandle ? (
        <PageEmpty
          icon={<IdentificationIcon />}
          title="Finish setting up your account"
          description="Pick a handle so others can find and mention you. Handles are permanent in v1, so choose wisely."
          actions={
            <Button
              size="sm"
              variant="primary"
              nativeButton={false}
              render={<Link to="/settings" />}
            >
              Claim your handle
            </Button>
          }
          className="px-4"
        />
      ) : (
        <Compose onCreated={(p) => setNewPost(p)} collapsible />
      )}
      {isPending ? (
        <PageLoading />
      ) : needsHandle ? null : (
        <Feed
          queryKey={qk.feed(tab)}
          load={
            tab === "following"
              ? loadFeed
              : tab === "network"
                ? loadNetwork
                : loadPublic
          }
          emptyState={emptyState}
          prependItem={newPost}
          renderActivityBanner={
            tab === "network"
              ? (p) => {
                  const np = p as Post & {
                    networkActors?: Array<{
                      id: string
                      handle: string | null
                      displayName: string | null
                    }>
                    networkActorTotal?: number
                  }
                  if (!np.networkActors || np.networkActors.length === 0)
                    return null
                  const first = np.networkActors[0]
                  const more = (np.networkActorTotal ?? 1) - 1
                  const name =
                    first.displayName ||
                    (first.handle ? `@${first.handle}` : "Someone")
                  return (
                    <div className="ml-10 flex items-center gap-1.5 text-xs text-tertiary">
                      <span>
                        {name}
                        {more > 0
                          ? ` and ${more} other${more === 1 ? "" : "s"}`
                          : ""}{" "}
                        liked or reposted
                      </span>
                    </div>
                  )
                }
              : undefined
          }
        />
      )}
    </PageFrame>
  )
}
