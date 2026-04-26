import { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { PostCard } from "@workspace/ui/components/post-card"
import { Lightbox } from "@workspace/ui/components/lightbox"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeftIcon } from "@heroicons/react/16/solid"
import {
	feedPosts,
	threadPost,
	threadAncestor,
	getRepliesForPost,
	type Post,
} from "../data/mock"

function usePostState(initial: Post) {
	const [post, setPost] = useState(initial)
	return {
		post,
		toggleLike: () =>
			setPost((p) => ({
				...p,
				liked: !p.liked,
				likes: p.liked ? p.likes - 1 : p.likes + 1,
			})),
		toggleRepost: () =>
			setPost((p) => ({
				...p,
				reposted: !p.reposted,
				reposts: p.reposted ? p.reposts - 1 : p.reposts + 1,
			})),
		toggleBookmark: () =>
			setPost((p) => ({ ...p, bookmarked: !p.bookmarked })),
	}
}

function usePostListState(initial: Post[]) {
	const [posts, setPosts] = useState(initial)
	const toggle = (id: string, field: "liked" | "reposted" | "bookmarked") =>
		setPosts((prev) =>
			prev.map((p) => {
				if (p.id !== id) return p
				const toggled = !p[field]
				const countField =
					field === "liked"
						? "likes"
						: field === "reposted"
							? "reposts"
							: null
				return {
					...p,
					[field]: toggled,
					...(countField
						? { [countField]: toggled ? p[countField] + 1 : p[countField] - 1 }
						: {}),
				}
			}),
		)
	return { posts, toggle }
}

export default function Thread() {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const [searchParams] = useSearchParams()

	const initialPost = feedPosts.find((p) => p.id === id) ?? threadPost
	const isThreadView = initialPost.id === threadPost.id

	const ancestor = usePostState(threadAncestor)
	const main = usePostState(initialPost)
	const { posts: replyList, toggle: toggleReply } = usePostListState(
		getRepliesForPost(initialPost.id),
	)

	// Lightbox
	const lightboxImageIndex = searchParams.get("img")
	const lightboxOpen = lightboxImageIndex !== null
	const lightboxImages = (main.post.media ?? [])
		.filter((m) => m.type === "image")
		.map((m) => ({ url: m.url, alt: m.type === "image" ? m.alt : undefined }))

	return (
		<div>
			{/* Header */}
			<header className="sticky top-0 z-40 flex h-12 items-center gap-3 bg-base-1/80 px-2 backdrop-blur-md">
				<Button
					variant="transparent"
					size="md"
					iconLeft={<ArrowLeftIcon />}
					onClick={() => navigate(-1)}
				/>
				<h1 className="text-[15px] font-semibold text-primary">Post</h1>
			</header>

			<div className="flex flex-col gap-1 px-2">
				{/* Ancestor */}
				{isThreadView && (
					<PostCard
						author={ancestor.post.author}
						text={ancestor.post.text}
						time={ancestor.post.createdAt}
						likes={ancestor.post.likes}
						replies={ancestor.post.replies}
						reposts={ancestor.post.reposts}
						liked={ancestor.post.liked}
						onLike={ancestor.toggleLike}
						onRepost={ancestor.toggleRepost}
						onBookmark={ancestor.toggleBookmark}
						threadLine="bottom"
					/>
				)}

				{/* Main post */}
				<PostCard
					author={main.post.author}
					text={main.post.text}
					time={main.post.createdAt}
					likes={main.post.likes}
					replies={main.post.replies}
					reposts={main.post.reposts}
					liked={main.post.liked}
					reposted={main.post.reposted}
					bookmarked={main.post.bookmarked}
					media={main.post.media}
					disableHover
					onLike={main.toggleLike}
					onRepost={main.toggleRepost}
					onBookmark={main.toggleBookmark}
					onMediaClick={(index) =>
						navigate(`?img=${index}`, { replace: false })
					}
					threadLine={isThreadView ? "top" : undefined}
				/>

				{/* Replies */}
				{replyList.map((reply) => (
					<PostCard
						key={reply.id}
						author={reply.author}
						text={reply.text}
						time={reply.createdAt}
						likes={reply.likes}
						replies={reply.replies}
						reposts={reply.reposts}
						liked={reply.liked}
						onLike={() => toggleReply(reply.id, "liked")}
						onRepost={() => toggleReply(reply.id, "reposted")}
						onBookmark={() => toggleReply(reply.id, "bookmarked")}
					/>
				))}
			</div>

			{/* Lightbox */}
			<Lightbox
				images={lightboxImages}
				initialIndex={parseInt(lightboxImageIndex ?? "0", 10)}
				open={lightboxOpen}
				onOpenChange={(open) => {
					if (!open) navigate(-1)
				}}
				sidebar={
					<div className="flex flex-col">
						<PostCard
							author={main.post.author}
							text={main.post.text}
							time={main.post.createdAt}
							likes={main.post.likes}
							replies={main.post.replies}
							reposts={main.post.reposts}
							liked={main.post.liked}
							reposted={main.post.reposted}
							bookmarked={main.post.bookmarked}
							disableHover
							onLike={main.toggleLike}
							onRepost={main.toggleRepost}
							onBookmark={main.toggleBookmark}
						/>
						{replyList.map((reply) => (
							<PostCard
								key={reply.id}
								author={reply.author}
								text={reply.text}
								time={reply.createdAt}
								likes={reply.likes}
								replies={reply.replies}
								reposts={reply.reposts}
								liked={reply.liked}
								onLike={() => toggleReply(reply.id, "liked")}
								onRepost={() => toggleReply(reply.id, "reposted")}
								onBookmark={() => toggleReply(reply.id, "bookmarked")}
							/>
						))}
					</div>
				}
			/>
		</div>
	)
}
