/**
 * Development-only seed endpoint. Creates fake users, posts with images,
 * replies, reposts, quote tweets, likes, and follows. Also creates a few
 * posts for the currently authenticated user.
 *
 * POST /api/dev/seed
 *
 * Returns 404 when NODE_ENV !== "development".
 */

import { Hono } from "hono"
import { eq, sql, inArray } from "@workspace/db"
import { schema } from "@workspace/db"
import { putObject } from "@workspace/media/s3"
import { requireAuth, type HonoEnv } from "../middleware/session.ts"

export const devRoute = new Hono<HonoEnv>()

// ---------------------------------------------------------------------------
// Seed images (Unsplash)
// ---------------------------------------------------------------------------

const SEED_IMAGES = [
	{ key: "seed/code-desk.jpg", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop&q=80", alt: "laptop on desk with code", w: 1200, h: 800 },
	{ key: "seed/sunset.jpg", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop&q=80", alt: "mountain sunset landscape", w: 1200, h: 800 },
	{ key: "seed/coffee.jpg", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=800&fit=crop&q=80", alt: "cup of coffee on table", w: 1200, h: 800 },
	{ key: "seed/keyboard.jpg", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&h=800&fit=crop&q=80", alt: "mechanical keyboard", w: 1200, h: 800 },
	{ key: "seed/plants.jpg", url: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&h=800&fit=crop&q=80", alt: "indoor plants on shelf", w: 1200, h: 800 },
	{ key: "seed/architecture.jpg", url: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=1200&h=800&fit=crop&q=80", alt: "modern architecture", w: 1200, h: 800 },
	{ key: "seed/desk-minimal.jpg", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=800&fit=crop&q=80", alt: "minimal desk setup", w: 1200, h: 800 },
	{ key: "seed/city-night.jpg", url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&h=800&fit=crop&q=80", alt: "city at night", w: 1200, h: 800 },
]

// ---------------------------------------------------------------------------
// Seed users
// ---------------------------------------------------------------------------

const SEED_USERS = [
	{ email: "alice@seed.local", handle: "alice", displayName: "Alice Chen", bio: "building things on the internet. design engineering. prev @stripe" },
	{ email: "bob@seed.local", handle: "bob", displayName: "Bob Park", bio: "swe. rust, go, typescript. opinions are my own" },
	{ email: "carol@seed.local", handle: "carol", displayName: "Carol Reeves", bio: "product designer. making interfaces that feel right" },
	{ email: "dave@seed.local", handle: "dave", displayName: "Dave Kim", bio: "lurking" },
	{ email: "eve@seed.local", handle: "eve", displayName: "Eve Martinez", bio: "open source maintainer. coffee enthusiast. she/her" },
]

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

devRoute.post("/seed", requireAuth(), async (c) => {
	const ctx = c.get("ctx")
	if (ctx.env.NODE_ENV !== "development") return c.notFound()

	const session = c.get("session")!
	const currentUserId = session.user.id
	const db = ctx.db
	const ago = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000)

	// ─── 1. Upsert seed users ────────────────────────────────────────────

	await db
		.insert(schema.users)
		.values(SEED_USERS.map((u) => ({
			email: u.email,
			handle: u.handle,
			displayName: u.displayName,
			name: u.displayName,
			bio: u.bio,
			emailVerified: true,
		})))
		.onConflictDoNothing({ target: schema.users.email })

	const seededUsers = await db
		.select({ id: schema.users.id, handle: schema.users.handle })
		.from(schema.users)
		.where(inArray(schema.users.email, SEED_USERS.map((u) => u.email)))

	const userMap = new Map(seededUsers.map((u) => [u.handle!, u.id]))
	const alice = userMap.get("alice")!
	const bob = userMap.get("bob")!
	const carol = userMap.get("carol")!
	const dave = userMap.get("dave")!
	const eve = userMap.get("eve")!

	// ─── 2. Upload images to S3 ──────────────────────────────────────────

	const mediaIds: string[] = []
	for (const img of SEED_IMAGES) {
		try {
			const res = await fetch(img.url)
			if (!res.ok) continue
			const buf = new Uint8Array(await res.arrayBuffer())

			await putObject({
				s3: ctx.s3,
				bucket: ctx.mediaEnv.S3_BUCKET,
				key: img.key,
				body: buf,
				contentType: "image/jpeg",
			})

			const [inserted] = await db
				.insert(schema.media)
				.values({
					ownerId: alice,
					kind: "image",
					originalKey: img.key,
					mimeType: "image/jpeg",
					width: img.w,
					height: img.h,
					altText: img.alt,
					processingState: "ready",
					variants: [
						{ kind: "medium", key: img.key, width: img.w, height: img.h },
						{ kind: "thumb", key: img.key, width: 400, height: Math.round(400 * (img.h / img.w)) },
					],
				})
				.returning({ id: schema.media.id })
			if (inserted) mediaIds.push(inserted.id)
		} catch {
			// Skip failed image uploads
		}
	}

	// ─── 3. Helper to insert posts ──────────────────────────────────────

	async function createPost(opts: {
		authorId: string
		text: string
		minutesAgo: number
		replyToId?: string
		quoteOfId?: string
		repostOfId?: string
		rootId?: string
		conversationDepth?: number
		mediaIndex?: number[]
	}) {
		const rows = await db
			.insert(schema.posts)
			.values({
				authorId: opts.authorId,
				text: opts.text,
				createdAt: ago(opts.minutesAgo),
				replyToId: opts.replyToId,
				quoteOfId: opts.quoteOfId,
				repostOfId: opts.repostOfId,
				rootId: opts.rootId,
				conversationDepth: opts.conversationDepth ?? 0,
			})
			.returning({ id: schema.posts.id })

		const postId = rows[0]!.id

		// Attach media
		if (opts.mediaIndex) {
			for (let i = 0; i < opts.mediaIndex.length; i++) {
				const idx = opts.mediaIndex[i]
				if (idx === undefined) continue
				const mid = mediaIds[idx]
				if (mid) {
					await db.insert(schema.postMedia).values({ postId, mediaId: mid, position: i })
				}
			}
		}

		return postId
	}

	// ─── 4. Seed posts from fake users ──────────────────────────────────

	const p1 = await createPost({ authorId: alice, text: "just shipped a new component library for our design system. took three months of iteration but the API surface is finally clean. sometimes the best work is what you remove, not what you add.", minutesAgo: 0 })
	const p2 = await createPost({ authorId: bob, text: "hot take: most \"best practices\" in software engineering are just cargo cult patterns that made sense in a specific context and got generalized way too aggressively", minutesAgo: 2 })
	const p3 = await createPost({ authorId: carol, text: "spent the morning redesigning our onboarding flow. reduced the steps from 7 to 3. the trick was realizing we were asking for information we could infer later.", minutesAgo: 5 })
	const p4 = await createPost({ authorId: alice, text: "new desk setup. minimal vibes only.", minutesAgo: 8, mediaIndex: [6] })
	const p5 = await createPost({ authorId: carol, text: "some shots from this weekend. the light was perfect.", minutesAgo: 12, mediaIndex: [1, 5, 7] })
	const p6 = await createPost({ authorId: dave, text: "nice", minutesAgo: 15 })
	const p7 = await createPost({ authorId: alice, text: "the gap between \"works on my machine\" and \"works in production\" is where 80% of engineering effort goes.\n\nmost of what makes software hard is not the code. the network is unreliable, the database has latency, the user has a slow phone.\n\nyou can write perfect code and still have a broken product.", minutesAgo: 20 })
	const p8 = await createPost({ authorId: eve, text: "released v2.0 of the CLI today. biggest change: we dropped the config file entirely. everything is flags now. migration guide in the thread.", minutesAgo: 25 })
	const p9 = await createPost({ authorId: bob, text: "debugging a race condition in our WebSocket handler. the bug only reproduces under load with >500 concurrent connections. this is fine.", minutesAgo: 30 })
	const p10 = await createPost({ authorId: eve, text: "morning coffee and code. best way to start the day.", minutesAgo: 40, mediaIndex: [2] })
	const p11 = await createPost({ authorId: carol, text: "people underestimate how much good typography matters. swapped our body font from system-ui to Inter and the perceived quality of the whole app went up. no other changes.", minutesAgo: 50 })
	const p12 = await createPost({ authorId: bob, text: "wrote a blog post about why we moved from microservices back to a monolith. tl;dr: the network is not reliable, latency adds up, and we had 4 engineers maintaining 23 services.", minutesAgo: 60 })
	const p13 = await createPost({ authorId: alice, text: "new keyboard arrived. the thock is immaculate.", minutesAgo: 75, mediaIndex: [3] })
	const p14 = await createPost({ authorId: eve, text: "open source maintenance is a weird job. you wake up to 47 notifications, 3 bug reports, and someone telling you your life's work is \"mid\". then you fix the bugs because you care.", minutesAgo: 90 })
	const p15 = await createPost({ authorId: dave, text: "been lurking on this platform for a week. vibes are good. might actually start posting.", minutesAgo: 120 })
	const p16 = await createPost({ authorId: bob, text: "before and after. code cleanup makes such a difference.", minutesAgo: 150, mediaIndex: [0, 4] })

	// ─── 5. Replies (nested) ────────────────────────────────────────────

	const r1 = await createPost({ authorId: bob, text: "congrats! what made you decide to go with the compound component pattern?", minutesAgo: 1, replyToId: p1, rootId: p1, conversationDepth: 1 })
	const r2 = await createPost({ authorId: alice, text: "readability mostly. when you see <Card.Header> it is immediately obvious what it does and where it belongs.", minutesAgo: 1, replyToId: r1, rootId: p1, conversationDepth: 2 })
	const r3 = await createPost({ authorId: carol, text: "agree with this approach. we did the same and our component docs became way easier to write too.", minutesAgo: 0, replyToId: r2, rootId: p1, conversationDepth: 3 })
	await createPost({ authorId: eve, text: "the API surface part is so true. we spent 6 weeks just on the props interface for our Button component alone.", minutesAgo: 1, replyToId: p1, rootId: p1, conversationDepth: 1 })
	await createPost({ authorId: carol, text: "not even a hot take. this is just true.", minutesAgo: 3, replyToId: p2, rootId: p2, conversationDepth: 1 })
	await createPost({ authorId: dave, text: "based", minutesAgo: 3, replyToId: p2, rootId: p2, conversationDepth: 1 })
	const r7 = await createPost({ authorId: alice, text: "dropping the config file is bold. how are people migrating?", minutesAgo: 22, replyToId: p8, rootId: p8, conversationDepth: 1 })
	const r8 = await createPost({ authorId: eve, text: "we wrote a codemod that converts the JSON config to CLI flags. runs in about 2 seconds.", minutesAgo: 21, replyToId: r7, rootId: p8, conversationDepth: 2 })
	await createPost({ authorId: bob, text: "this is the way. config files are where developer experience goes to die.", minutesAgo: 21, replyToId: r8, rootId: p8, conversationDepth: 3 })

	// ─── 6. Reposts ─────────────────────────────────────────────────────

	await createPost({ authorId: bob, text: "", minutesAgo: 1, repostOfId: p1 })
	await createPost({ authorId: eve, text: "", minutesAgo: 7, repostOfId: p3 })
	await createPost({ authorId: dave, text: "", minutesAgo: 4, repostOfId: p2 })

	// ─── 7. Quote tweets ────────────────────────────────────────────────

	await createPost({ authorId: carol, text: "this is why I always say: design the API first, build the implementation second. if the API feels wrong, the implementation will never feel right.", minutesAgo: 0, quoteOfId: p1 })
	await createPost({ authorId: alice, text: "this is exactly the kind of bold product decision more tools need. flags > files when the option count is small.", minutesAgo: 24, quoteOfId: p8 })

	// ─── 8. Posts for the current user ──────────────────────────────────

	const cu1 = await createPost({ authorId: currentUserId, text: "just getting started here. building something cool.", minutesAgo: 10 })
	await createPost({ authorId: currentUserId, text: "shipped a big update today. feels good to finally get this out the door.", minutesAgo: 25, mediaIndex: [0] })
	await createPost({ authorId: currentUserId, text: "anyone else spend more time configuring their dev environment than actually writing code?", minutesAgo: 45 })

	// Some seed users reply to and like the current user's posts
	await createPost({ authorId: alice, text: "welcome! excited to see what you build.", minutesAgo: 9, replyToId: cu1, rootId: cu1, conversationDepth: 1 })
	await createPost({ authorId: bob, text: "following!", minutesAgo: 9, replyToId: cu1, rootId: cu1, conversationDepth: 1 })

	// ─── 9. Likes ───────────────────────────────────────────────────────

	const likePairs = [
		{ userId: bob, postId: p1 }, { userId: carol, postId: p1 }, { userId: eve, postId: p1 }, { userId: dave, postId: p1 },
		{ userId: alice, postId: p2 }, { userId: carol, postId: p2 }, { userId: dave, postId: p2 },
		{ userId: alice, postId: p3 }, { userId: bob, postId: p3 }, { userId: eve, postId: p3 },
		{ userId: carol, postId: p4 }, { userId: bob, postId: p4 },
		{ userId: alice, postId: p5 }, { userId: eve, postId: p5 },
		{ userId: bob, postId: p7 }, { userId: carol, postId: p7 }, { userId: eve, postId: p7 },
		{ userId: alice, postId: p8 }, { userId: bob, postId: p8 }, { userId: carol, postId: p8 },
		{ userId: alice, postId: p14 }, { userId: bob, postId: p14 }, { userId: carol, postId: p14 },
		{ userId: alice, postId: p11 }, { userId: bob, postId: p11 },
		// Likes on current user's posts
		{ userId: alice, postId: cu1 }, { userId: bob, postId: cu1 }, { userId: carol, postId: cu1 },
		// Current user likes some posts
		{ userId: currentUserId, postId: p1 }, { userId: currentUserId, postId: p5 }, { userId: currentUserId, postId: p14 },
	]

	await db.insert(schema.likes).values(likePairs).onConflictDoNothing()

	// ─── 10. Follows ────────────────────────────────────────────────────

	const followPairs = [
		// Seed users follow each other
		{ followerId: bob, followeeId: alice }, { followerId: carol, followeeId: alice },
		{ followerId: dave, followeeId: alice }, { followerId: eve, followeeId: alice },
		{ followerId: alice, followeeId: bob }, { followerId: alice, followeeId: carol },
		{ followerId: alice, followeeId: dave }, { followerId: alice, followeeId: eve },
		{ followerId: bob, followeeId: carol }, { followerId: bob, followeeId: eve },
		{ followerId: carol, followeeId: eve }, { followerId: eve, followeeId: bob },
		// Seed users follow the current user
		{ followerId: alice, followeeId: currentUserId },
		{ followerId: bob, followeeId: currentUserId },
		{ followerId: carol, followeeId: currentUserId },
		{ followerId: eve, followeeId: currentUserId },
		// Current user follows some seed users
		{ followerId: currentUserId, followeeId: alice },
		{ followerId: currentUserId, followeeId: bob },
		{ followerId: currentUserId, followeeId: carol },
	]

	await db.insert(schema.follows).values(followPairs).onConflictDoNothing()

	return c.json({
		ok: true,
		message: "Seed data created",
		counts: {
			users: seededUsers.length,
			images: mediaIds.length,
			posts: 16,
			currentUserPosts: 3,
			replies: 9,
			reposts: 3,
			quoteTweets: 2,
			likes: likePairs.length,
			follows: followPairs.length,
		},
	})
})
