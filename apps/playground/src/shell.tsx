import { useState } from "react"
import { Outlet } from "react-router"
import { Sidebar } from "./components/sidebar"
import { ComposeModal } from "./components/compose-modal"

export function Shell() {
	const [composeOpen, setComposeOpen] = useState(false)

	return (
		<div className="mx-auto flex min-h-svh max-w-[1080px]">
			{/* Left sidebar */}
			<Sidebar onCompose={() => setComposeOpen(true)} />

			{/* Center column */}
			<main className="min-h-svh flex-1">
				<Outlet />
			</main>

			{/* Right gutter -- placeholder for future trending/search panel */}
			<div className="hidden w-[320px] shrink-0 lg:block" />

			{/* Compose modal */}
			<ComposeModal open={composeOpen} onOpenChange={setComposeOpen} />
		</div>
	)
}
