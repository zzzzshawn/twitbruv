import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { PostCard } from "@workspace/ui/components/post-card"
import { Lightbox } from "@workspace/ui/components/lightbox"
import { SegmentedControl } from "@workspace/ui/components/segmented-control"
import { feedPosts, getRepliesForPost, type Post } from "../data/mock"

const TABS = ["For You", "Following"] as const
type Tab = (typeof TABS)[number]

export default function Feed() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [posts, setPosts] = useState<Post[]>(feedPosts)
	const [activeTab, setActiveTab] = useState<Tab>("For You")

	// Lightbox state from URL search params
	const lightboxPostId = searchParams.get("lightbox")
	const lightboxIndex = parseInt(searchParams.get("img") ?? "0", 10)
	const lightboxOpen = lightboxPostId !== null

	const lightboxPost = lightboxPostId
		? posts.find((p) => p.id === lightboxPostId)
		: null
	const lightboxImages = (lightboxPost?.media ?? [])
		.filter((m) => m.type === "image")
		.map((m) => ({ url: m.url, alt: m.type === "image" ? m.alt : undefined }))

	const openLightbox = (postId: string, index: number) => {
		navigate(`?lightbox=${postId}&img=${index}`, { replace: false })
	}

	const closeLightbox = () => {
		navigate(-1)
	}

	const toggleLike = (id: string) => {
		setPosts((prev) =>
			prev.map((p) =>
				p.id === id
					? {
							...p,
							liked: !p.liked,
							likes: p.liked ? p.likes - 1 : p.likes + 1,
						}
					: p,
			),
		)
	}

	const toggleRepost = (id: string) => {
		setPosts((prev) =>
			prev.map((p) =>
				p.id === id
					? {
							...p,
							reposted: !p.reposted,
							reposts: p.reposted ? p.reposts - 1 : p.reposts + 1,
						}
					: p,
			),
		)
	}

	const toggleBookmark = (id: string) => {
		setPosts((prev) =>
			prev.map((p) =>
				p.id === id ? { ...p, bookmarked: !p.bookmarked } : p,
			),
		)
	}

	return (
		<div>
			{/* Header */}
			<header className="sticky top-0 z-40 flex h-12 items-center bg-base-1/80 px-4 backdrop-blur-md">
				<SegmentedControl
					items={TABS}
					value={activeTab}
					onChange={setActiveTab}
				/>
			</header>

			{/* Feed */}
			<div className="flex flex-col gap-1 px-2">
				{activeTab === "For You" ? (
					posts.map((post) => (
						<PostCard
							key={post.id}
							author={post.author}
							text={post.text}
							time={post.createdAt}
							likes={post.likes}
							replies={post.replies}
							reposts={post.reposts}
							liked={post.liked}
							reposted={post.reposted}
							bookmarked={post.bookmarked}
							media={post.media}
							repostedBy={post.repostedBy}
							truncateText
							onClick={() => navigate(`/thread/${post.id}`)}
							onReply={() => navigate(`/thread/${post.id}`)}
							onLike={() => toggleLike(post.id)}
							onRepost={() => toggleRepost(post.id)}
							onBookmark={() => toggleBookmark(post.id)}
							onMediaClick={(index) => openLightbox(post.id, index)}
						/>
					))
				) : (
					<div className="flex items-center justify-center py-16 text-sm text-tertiary">
						Nothing here yet
					</div>
				)}
			</div>

			{/* Lightbox */}
			<Lightbox
				images={lightboxImages}
				initialIndex={lightboxIndex}
				open={lightboxOpen}
				onOpenChange={(open) => {
					if (!open) closeLightbox()
				}}
				sidebar={
					lightboxPost && (
						<div className="flex flex-col">
							<PostCard
								author={lightboxPost.author}
								text={lightboxPost.text}
								time={lightboxPost.createdAt}
								likes={lightboxPost.likes}
								replies={lightboxPost.replies}
								reposts={lightboxPost.reposts}
								liked={lightboxPost.liked}
								reposted={lightboxPost.reposted}
								bookmarked={lightboxPost.bookmarked}
								disableHover
								onLike={() => toggleLike(lightboxPost.id)}
								onRepost={() => toggleRepost(lightboxPost.id)}
								onBookmark={() => toggleBookmark(lightboxPost.id)}
							/>
							{getRepliesForPost(lightboxPost.id).map((reply) => (
								<PostCard
									key={reply.id}
									author={reply.author}
									text={reply.text}
									time={reply.createdAt}
									likes={reply.likes}
									replies={reply.replies}
									reposts={reply.reposts}
								/>
							))}
						</div>
					)
				}
			/>
		</div>
	)
}
