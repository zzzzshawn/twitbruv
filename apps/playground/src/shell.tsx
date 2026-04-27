import { useState, useEffect } from "react"
import { Outlet } from "react-router"
import { Sidebar, type ThemeMode } from "./components/sidebar"
import { ComposeModal } from "./components/compose-modal"

function getSystemTheme(): "light" | "dark" {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light"
}

function applyTheme(mode: ThemeMode) {
	const resolved = mode === "system" ? getSystemTheme() : mode
	document.documentElement.setAttribute("data-theme", resolved)
}

export function Shell() {
	const [composeOpen, setComposeOpen] = useState(false)
	const [theme, setTheme] = useState<ThemeMode>(() => {
		const stored = localStorage.getItem("theme") as ThemeMode | null
		return stored ?? "system"
	})

	// Apply theme on mount and when it changes
	useEffect(() => {
		applyTheme(theme)
		localStorage.setItem("theme", theme)
	}, [theme])

	// Listen for system theme changes when in "system" mode
	useEffect(() => {
		if (theme !== "system") return
		const mq = window.matchMedia("(prefers-color-scheme: dark)")
		const handler = () => applyTheme("system")
		mq.addEventListener("change", handler)
		return () => mq.removeEventListener("change", handler)
	}, [theme])

	return (
		<div className="mx-auto flex min-h-svh max-w-[1080px]">
			{/* Left sidebar */}
			<Sidebar
				onCompose={() => setComposeOpen(true)}
				theme={theme}
				onThemeChange={setTheme}
			/>

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
