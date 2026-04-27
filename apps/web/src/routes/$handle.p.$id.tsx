import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import { Button } from "@workspace/ui/components/button"
import { ApiError, api } from "../lib/api"
import { APP_NAME } from "../lib/env"
import { buildSeoMeta, canonicalLink, clipDescription } from "../lib/seo"
import { Compose } from "../components/compose"
import { FeedPostCard } from "../components/feed-post-card"
import { PageError } from "../components/page-surface"
import type { Post, Thread } from "../lib/api"

// ───────────────────────────────────────────────────────────────────────────
// Route definition (SEO loader + head)
// ───────────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/$handle/p/$id")({
	component: ThreadView,
	loader: async ({ params }) => {
		try {
			const { post } = await api.post(params.id)
			return { post }
		} catch {
			return { post: null }
		}
	},
	head: ({ loaderData, params }) => {
		const post = loaderData?.post ?? null
		const path = `/${params.handle}/p/${params.id}`
		if (!post) {
			return {
				meta: buildSeoMeta({
					title: "Post not found",
					description: `This post on ${APP_NAME} either doesn't exist or has been removed.`,
					path,
				}),
				links: [canonicalLink(path)],
			}
		}
		const author =
			post.author.displayName || `@${post.author.handle ?? "user"}`
		const description = clipDescription(
			post.text || `A post by ${author} on ${APP_NAME}.`,
		)
		return {
			meta: buildSeoMeta({
				title: `${author}: "${clipDescription(post.text, 60)}"`,
				description,
				path,
				image: `/og/post/${post.id}`,
				type: "article",
				largeCard: true,
				publishedTime: post.createdAt,
				authorHandle: post.author.handle ?? undefined,
			}),
			links: [canonicalLink(path)],
			scripts: [
				{
					type: "application/ld+json",
					children: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "SocialMediaPosting",
						headline: clipDescription(post.text, 110),
						articleBody: post.text,
						datePublished: post.createdAt,
						dateModified: post.editedAt ?? post.createdAt,
						url: path,
						author: post.author.handle
							? {
									"@type": "Person",
									name:
										post.author.displayName ??
										post.author.handle,
									url: `/${post.author.handle}`,
								}
							: undefined,
						interactionStatistic: [
							{
								"@type": "InteractionCounter",
								interactionType:
									"https://schema.org/LikeAction",
								userInteractionCount: post.counts.likes,
							},
							{
								"@type": "InteractionCounter",
								interactionType:
									"https://schema.org/ShareAction",
								userInteractionCount: post.counts.reposts,
							},
							{
								"@type": "InteractionCounter",
								interactionType:
									"https://schema.org/CommentAction",
								userInteractionCount: post.counts.replies,
							},
						],
					}),
				},
			],
		}
	},
})

// ───────────────────────────────────────────────────────────────────────────
// Thread view component
// ───────────────────────────────────────────────────────────────────────────

function ThreadView() {
	const { handle, id } = Route.useParams()
	const navigate = useNavigate()
	const [thread, setThread] = useState<Thread | null>(null)
	const [error, setError] = useState<string | null>(null)
	const focalRef = useRef<HTMLDivElement>(null)
	const didScrollRef = useRef(false)

	// Load thread data
	useEffect(() => {
		setThread(null)
		setError(null)
		didScrollRef.current = false
		api.thread(id)
			.then(setThread)
			.catch((e) => {
				if (e instanceof ApiError && e.status === 404) {
					setError("Post not found")
				} else {
					setError("Something went wrong")
				}
			})
	}, [id])

	// Scroll to focal post on load (Twitter-style: parents hidden above)
	useEffect(() => {
		if (!thread || didScrollRef.current) return
		if (thread.ancestors.length === 0) return // no parents to scroll past
		didScrollRef.current = true
		requestAnimationFrame(() => {
			focalRef.current?.scrollIntoView({ block: "start" })
		})
	}, [thread])

	// ── Optimistic update helpers ──────────────────────────────────────

	const replace = useCallback((next: Post) => {
		setThread((t) =>
			t
				? {
						ancestors: t.ancestors.map((p) =>
							p.id === next.id ? next : p,
						),
						post:
							t.post && t.post.id === next.id ? next : t.post,
						replies: t.replies.map((p) =>
							p.id === next.id
								? { ...p, ...next }
								: p,
						),
					}
				: t,
		)
	}, [])

	const removeFromThread = useCallback(
		(removeId: string) => {
			setThread((t) =>
				t
					? {
							ancestors: t.ancestors.filter(
								(p) => p.id !== removeId,
							),
							post:
								t.post && t.post.id === removeId
									? null
									: t.post,
							replies: t.replies.filter(
								(p) => p.id !== removeId,
							),
						}
					: t,
			)
		},
		[],
	)

	const onReply = useCallback((post: Post) => {
		setThread((t) =>
			t
				? {
						...t,
						post: t.post
							? {
									...t.post,
									counts: {
										...t.post.counts,
										replies: t.post.counts.replies + 1,
									},
								}
							: t.post,
						replies: [
							...t.replies,
							{ ...post, descendantReplyCount: 0 },
						],
					}
				: t,
		)
	}, [])

	// ── Error / loading states ─────────────────────────────────────────

	if (error) {
		return (
			<main>
				<PageError message={error} className="px-4 py-16" />
				<div className="px-4 text-center">
					<Link
						to="/$handle"
						params={{ handle }}
						className="text-xs text-primary hover:underline"
					>
						Back to @{handle}
					</Link>
				</div>
			</main>
		)
	}

	if (!thread) {
		return (
			<main>
				<div className="px-4 py-16 text-center">
					<p className="text-sm text-tertiary">Loading…</p>
				</div>
			</main>
		)
	}

	const hasParents = thread.ancestors.length > 0

	return (
		<main>
			{/* Sticky header */}
			<header className="sticky top-0 z-40 flex h-12 items-center gap-3 bg-base-1/80 px-4 backdrop-blur-md">
				<Button
					variant="transparent"
					size="sm"
					iconLeft={<ArrowLeftIcon className="size-4" />}
					onClick={() => navigate({ to: "/" })}
					aria-label="Back"
				/>
				<span className="text-sm font-semibold text-primary">
					Post
				</span>
			</header>

			{/* Parent chain */}
			{hasParents &&
				thread.ancestors.map((p, i) => {
					const isFirst = i === 0
					const threadLine = isFirst ? "bottom" : "both"
					return (
						<FeedPostCard
							key={p.id}
							post={p}
							onChange={replace}
							onRemove={() => removeFromThread(p.id)}
							threadLine={threadLine}
						/>
					)
				})}

			{/* Focal post */}
			{thread.post && (
				<div ref={focalRef}>
					<FeedPostCard
						post={thread.post}
						onChange={replace}
						onRemove={() => {
							navigate({
								to: "/$handle",
								params: { handle },
							})
						}}
						threadLine={hasParents ? "top" : undefined}
						disableHover
						truncateText={false}
					/>
				</div>
			)}

			{/* Reply composer */}
			{thread.post && (
				<div>
					<Compose
						replyToId={thread.post.id}
						onCreated={onReply}
						collapsible
						placeholder="Post your reply"
					/>
				</div>
			)}

			{/* Replies */}
			{thread.replies.map((reply) => (
				<div key={reply.id}>
					<FeedPostCard
						post={reply}
						onChange={replace}
						onRemove={() => removeFromThread(reply.id)}
					/>
					{reply.descendantReplyCount > 0 && reply.author.handle && (
						<div className="px-4 pb-2 pl-[68px]">
							<Button
								variant="transparent"
								size="sm"
								onClick={() =>
									navigate({
										to: "/$handle/p/$id",
										params: {
											handle: reply.author.handle!,
											id: reply.id,
										},
									})
								}
							>
								View {reply.descendantReplyCount} more{" "}
								{reply.descendantReplyCount === 1
									? "reply"
									: "replies"}
							</Button>
						</div>
					)}
				</div>
			))}
		</main>
	)
}
