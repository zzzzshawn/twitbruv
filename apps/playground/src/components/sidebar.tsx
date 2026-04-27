import { NavLink } from "react-router"
import {
	HomeIcon,
	MagnifyingGlassIcon,
	BellIcon,
	EnvelopeIcon,
	UserIcon,
	PencilSquareIcon,
	SunIcon,
	MoonIcon,
	ComputerDesktopIcon,
	Cog6ToothIcon,
	ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline"
import {
	HomeIcon as HomeIconSolid,
	MagnifyingGlassIcon as MagnifyingGlassIconSolid,
	BellIcon as BellIconSolid,
	EnvelopeIcon as EnvelopeIconSolid,
	UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid"
import {
	SunIcon as SunIcon16,
	MoonIcon as MoonIcon16,
	ComputerDesktopIcon as ComputerDesktopIcon16,
} from "@heroicons/react/16/solid"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { DropdownMenu } from "@workspace/ui/components/dropdown-menu"
import { SegmentedControl } from "@workspace/ui/components/segmented-control"
import { me } from "../data/mock"

export type ThemeMode = "light" | "dark" | "system"

const navItems = [
	{ to: "/", label: "Home", icon: HomeIcon, iconActive: HomeIconSolid },
	{ to: "/search", label: "Search", icon: MagnifyingGlassIcon, iconActive: MagnifyingGlassIconSolid },
	{ to: "/notifications", label: "Notifications", icon: BellIcon, iconActive: BellIconSolid },
	{ to: "/messages", label: "Messages", icon: EnvelopeIcon, iconActive: EnvelopeIconSolid },
	{ to: "/profile", label: "Profile", icon: UserIcon, iconActive: UserIconSolid },
] as const

const themeOptions = [
	{ value: "light" as const, icon: <SunIcon16 /> },
	{ value: "dark" as const, icon: <MoonIcon16 /> },
	{ value: "system" as const, icon: <ComputerDesktopIcon16 /> },
]

interface SidebarProps {
	onCompose: () => void
	theme: ThemeMode
	onThemeChange: (theme: ThemeMode) => void
}

export function Sidebar({ onCompose, theme, onThemeChange }: SidebarProps) {
	return (
		<aside className="sticky top-0 flex h-svh w-[68px] shrink-0 flex-col items-center justify-between py-4 xl:w-[240px] xl:items-start xl:px-3">
			{/* Logo */}
			<div className="flex h-10 w-10 items-center justify-center text-primary xl:ml-1">
				<svg className="size-6" viewBox="0 0 193 257" fill="none">
					<path d="M127.502 50.3154C127.502 57.7961 121.438 63.8604 113.957 63.8604H78.2862C70.8055 63.8604 64.7412 57.7961 64.7412 50.3154V13.545C64.7412 6.06429 58.6769 0 51.1962 0H13.545C6.06429 0 0 6.06429 0 13.545V51.1962C0 58.6769 6.06429 64.7412 13.545 64.7412H50.0966C57.5773 64.7412 63.6416 70.8055 63.6416 78.2862V113.929C63.6416 121.409 57.5773 127.474 50.0966 127.474H13.545C6.06429 127.474 0 133.538 0 141.019V178.67C0 186.151 6.06429 192.215 13.545 192.215H51.1953C58.6759 192.215 64.7402 198.279 64.7402 205.76V243.411C64.7402 250.892 70.8045 256.956 78.2852 256.956H115.936C123.417 256.956 129.481 250.892 129.481 243.411V207.378C129.481 199.897 135.546 193.833 143.026 193.833H179.059C186.539 193.833 192.604 187.769 192.604 180.288V142.638C192.604 135.157 186.539 129.093 179.059 129.093H141.408C133.928 129.093 127.863 135.157 127.863 142.638V178.67C127.863 186.151 121.799 192.215 114.318 192.215H78.2862C70.8055 192.215 64.7412 186.151 64.7412 178.67V142.147C64.7412 134.666 70.8055 128.602 78.2862 128.602H114.838C122.319 128.602 128.383 122.537 128.383 115.057V78.2862C128.383 70.8055 134.447 64.7412 141.928 64.7412H178.698C186.179 64.7412 192.243 58.6769 192.243 51.1962V13.545C192.243 6.06429 186.179 0 178.698 0H141.047C133.566 0 127.502 6.06429 127.502 13.545V50.3154Z" fill="currentColor"/>
				</svg>
			</div>

			{/* Nav links */}
			<nav className="mt-2 flex flex-1 flex-col gap-1">
				{navItems.map(({ to, label, icon: Icon, iconActive: IconActive }) => (
					<NavLink
						key={to}
						to={to}
						end={to === "/"}
						className={({ isActive }) =>
							cn(
								"group flex h-11 items-center gap-4 rounded-full px-3 transition-colors hover:bg-subtle",
								isActive && "font-semibold",
							)
						}
					>
						{({ isActive }) => (
							<>
								{isActive ? (
									<IconActive className="size-6 text-primary" />
								) : (
									<Icon className="size-6 text-primary" />
								)}
								<span className="hidden text-[15px] text-primary xl:block">
									{label}
								</span>
							</>
						)}
					</NavLink>
				))}

				{/* Compose button */}
				<div className="mt-4">
					{/* Full button on xl */}
					<Button
						variant="primary"
						size="md"
						className="hidden h-11 w-full xl:flex"
						onClick={onCompose}
					>
						Post
					</Button>
					{/* Icon-only on smaller */}
					<Button
						variant="primary"
						size="md"
						className="flex h-11 w-11 xl:hidden"
						onClick={onCompose}
					>
						<PencilSquareIcon className="size-5" />
					</Button>
				</div>
			</nav>

			{/* Profile pill / user menu */}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					className="flex items-center gap-3 rounded-full p-2 transition-colors hover:bg-subtle xl:w-full"
				>
					{me.avatarUrl ? (
						<img
							src={me.avatarUrl}
							alt=""
							className="size-9 shrink-0 rounded-full object-cover"
						/>
					) : (
						<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-subtle text-sm font-semibold text-secondary">
							{me.displayName[0]}
						</div>
					)}
					<div className="hidden min-w-0 text-left xl:block">
						<div className="truncate text-sm font-semibold text-primary">
							{me.displayName}
						</div>
						<div className="truncate text-xs text-tertiary">
							@{me.handle}
						</div>
					</div>
				</DropdownMenu.Trigger>

				<DropdownMenu.Content
					side="top"
					align="start"
					sideOffset={8}
					minWidth="min-w-[260px]"
				>
					{/* User info header */}
					<div className="flex items-center gap-3 px-2 py-2">
						{me.avatarUrl ? (
							<img
								src={me.avatarUrl}
								alt=""
								className="size-10 shrink-0 rounded-full object-cover"
							/>
						) : (
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-subtle text-sm font-semibold text-secondary">
								{me.displayName[0]}
							</div>
						)}
						<div className="flex flex-col gap-0.5">
							<span className="text-sm font-medium text-primary">
								{me.displayName}
							</span>
							<span className="text-xs text-tertiary">
								@{me.handle}
							</span>
						</div>
					</div>

					<DropdownMenu.Separator />

					{/* Appearance toggle */}
					<div className="flex items-center justify-between px-2 py-1.5">
						<span className="text-sm text-primary">Appearance</span>
						<SegmentedControl<ThemeMode>
							options={themeOptions}
							value={theme}
							onValueChange={onThemeChange}
						/>
					</div>

					<DropdownMenu.Separator />

					<DropdownMenu.Item icon={<Cog6ToothIcon className="size-4" />}>
						Settings
					</DropdownMenu.Item>

					<DropdownMenu.Separator />

					<DropdownMenu.Item
						icon={<ArrowRightStartOnRectangleIcon className="size-4" />}
						variant="danger"
					>
						Log out
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</aside>
	)
}
