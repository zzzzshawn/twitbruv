export type User = {
	id: string
	handle: string
	displayName: string
	avatarUrl: string | null
	bio?: string
}

export type PostMedia =
	| { type: "image"; url: string; alt?: string }
	| { type: "video"; url: string; thumbnailUrl: string }

export type Post = {
	id: string
	author: User
	text: string
	createdAt: string
	likes: number
	replies: number
	reposts: number
	repostedBy?: string
	liked?: boolean
	reposted?: boolean
	bookmarked?: boolean
	replyTo?: { author: User; id: string }
	media?: PostMedia[]
}

// ── Users ──────────────────────────────────────────────

export const users: Record<string, User> = {
	aaron: {
		id: "1",
		handle: "aaronmahlke",
		displayName: "Aaron Mahlke",
		avatarUrl: "/avatars/aaronmahlke.png",
		bio: "design & engineering. crafting the surface people see, hear, and interact with.",
	},
	ahmet: {
		id: "2",
		handle: "bruvimtired",
		displayName: "ahmet",
		avatarUrl: "/avatars/bruvimtired.jpg",
		bio: "swe @zerodotemail · opinions are my own",
	},
	vc: {
		id: "3",
		handle: "madewithmiso",
		displayName: "V.C. Billingsley",
		avatarUrl: "/avatars/vc.jpg",
		bio: "making things with miso",
	},
	dave: {
		id: "4",
		handle: "dave",
		displayName: "Dave Kim",
		avatarUrl: null,
		bio: "lurking",
	},
}

export const me = users.aaron

// ── Posts ──────────────────────────────────────────────

export const feedPosts: Post[] = [
	{
		id: "p1",
		author: users.aaron,
		text: "morning ritual before the standup",
		createdAt: "2m",
		likes: 24,
		replies: 3,
		reposts: 2,
		media: [
			{ type: "image", url: "/media/aaronmahlke_coffe.jpeg", alt: "Latte art on concrete counter" },
		],
	},
	{
		id: "p2",
		author: users.ahmet,
		text: "shadcn/ui MCP is broken btw. \"Server not found. Please check the URL.\" great developer experience 10/10",
		createdAt: "15m",
		likes: 89,
		replies: 12,
		reposts: 8,
		liked: true,
		media: [
			{ type: "image", url: "/media/bruvimtired_shadcn-ui-mcp-problem.jpeg", alt: "shadcn/ui MCP error dialog" },
		],
	},
	{
		id: "p3",
		author: users.vc,
		text: "released v0.4 of the design tool today. 3x faster on the render pipeline. still not fast enough but getting there.\n\nthe big win was switching from sequential layer compositing to a DAG-based scheduler. instead of rendering one layer at a time, we now resolve the dependency graph upfront and parallelize everything that doesn't have a direct dependency.\n\nstill need to optimize the asset caching. right now we're invalidating too aggressively when source files update. planning to add content-addressable deduplication in v0.5.",
		createdAt: "1h",
		likes: 156,
		replies: 22,
		reposts: 41,
	},
	{
		id: "p4",
		author: users.dave,
		text: "does anyone else rewrite their entire css every 6 months or is that just me",
		createdAt: "2h",
		likes: 342,
		replies: 67,
		reposts: 23,
		liked: true,
		reposted: true,
		repostedBy: "You",
	},
	{
		id: "p5",
		author: users.ahmet,
		text: "LONDON LONDON LONDON",
		createdAt: "3h",
		likes: 78,
		replies: 15,
		reposts: 9,
		media: [
			{ type: "image", url: "/media/bruvimtired_london_london_london.png", alt: "Steve Ballmer excited" },
		],
	},
	{
		id: "p6",
		author: users.vc,
		text: "the best design tools are the ones built by people who actually design.\n\nmost tools are built by engineers who think about features. but the ones that win are built by people who think about flow. every click, every panel, every shortcut either helps you stay in the zone or pulls you out of it.\n\nthe biggest lesson from building @miso: people don't learn interfaces, they feel them. if something feels off, they'll never figure out why. they'll just leave.",
		createdAt: "5h",
		likes: 203,
		replies: 8,
		reposts: 34,
		bookmarked: true,
		repostedBy: "ahmet",
	},
	{
		id: "p7",
		author: users.aaron,
		text: "the trick with rounded corners is knowing when to stop. 16px on a card, full-round on a pill, 0 on a divider. consistency doesn't mean same-everywhere.",
		createdAt: "6h",
		likes: 45,
		replies: 7,
		reposts: 3,
	},
	{
		id: "p8",
		author: users.ahmet,
		text: "6th or 7th beer but prs incoming brrrm brrrm",
		createdAt: "8h",
		likes: 112,
		replies: 14,
		reposts: 19,
		media: [
			{ type: "image", url: "/media/bruvimtired_bear_chat.png", alt: "Chat message about beers and PRs" },
		],
	},
	{
		id: "p9",
		author: users.aaron,
		text: "babe wake up new wallpapers",
		createdAt: "10h",
		likes: 234,
		replies: 18,
		reposts: 45,
		media: [
			{ type: "image", url: "/media/aaronmahlke_wallpaper_1.jpeg", alt: "Blue gradient wallpaper" },
			{ type: "image", url: "/media/aaronmahlke_wallpaper_2.jpeg", alt: "Dark blue diagonal wallpaper" },
			{ type: "image", url: "/media/aaronmahlke_wallpaper_3.jpeg", alt: "Purple blue gradient wallpaper" },
		],
	},
	{
		id: "p10",
		author: users.aaron,
		text: "new projects cooking",
		createdAt: "12h",
		likes: 67,
		replies: 5,
		reposts: 8,
		media: [
			{ type: "video", url: "/media/aaronmahlke_new_projects.mp4", thumbnailUrl: "" },
		],
	},
]

// ── Thread data ───────────────────────────────────────

export const threadPost: Post = {
	id: "t1",
	author: users.vc,
	text: "hot take: most design systems fail because they optimize for the component author, not the component user.\n\nyou end up with beautiful Storybook pages and terrible developer experience.",
	createdAt: "4h",
	likes: 412,
	replies: 34,
	reposts: 89,
}

export const threadAncestor: Post = {
	id: "t0",
	author: users.ahmet,
	text: "been thinking about why so many teams abandon their design systems after 6 months...",
	createdAt: "5h",
	likes: 67,
	replies: 12,
	reposts: 5,
}

export const threadReplies: Post[] = [
	{
		id: "r1",
		author: users.aaron,
		text: "this. the dx of using the component matters 10x more than how it looks in isolation.",
		createdAt: "3h",
		likes: 89,
		replies: 2,
		reposts: 4,
		replyTo: { author: users.vc, id: "t1" },
	},
	{
		id: "r2",
		author: users.ahmet,
		text: "counterpoint: if the component doesn't look good in isolation it probably doesn't look good in production either",
		createdAt: "3h",
		likes: 34,
		replies: 5,
		reposts: 1,
		replyTo: { author: users.vc, id: "t1" },
	},
	{
		id: "r3",
		author: users.dave,
		text: "both are true. you need taste AND empathy for the dev using it.",
		createdAt: "2h",
		likes: 56,
		replies: 0,
		reposts: 2,
		replyTo: { author: users.vc, id: "t1" },
	},
]

// ── Generic replies for any post ──────────────────────

const genericReplies: Post[] = [
	{
		id: "gr1",
		author: users.ahmet,
		text: "this is so real",
		createdAt: "1h",
		likes: 12,
		replies: 0,
		reposts: 1,
	},
	{
		id: "gr2",
		author: users.vc,
		text: "interesting take. i've been thinking about this differently though. the constraint itself is what makes it interesting, not the solution.",
		createdAt: "45m",
		likes: 8,
		replies: 1,
		reposts: 0,
	},
	{
		id: "gr3",
		author: users.dave,
		text: "bookmarked",
		createdAt: "30m",
		likes: 3,
		replies: 0,
		reposts: 0,
	},
]

/** Get replies for a post. Thread post gets its dedicated replies, others get generic ones. */
export function getRepliesForPost(postId: string): Post[] {
	if (postId === threadPost.id) return threadReplies
	return genericReplies.map((r) => ({
		...r,
		id: `${postId}-${r.id}`,
	}))
}
