import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { Bars3Icon } from "@heroicons/react/16/solid"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Separator } from "@workspace/ui/components/separator"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@workspace/ui/components/sheet"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@workspace/ui/components/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
	state: "expanded" | "collapsed"
	open: boolean
	setOpen: (open: boolean) => void
	openMobile: boolean
	setOpenMobile: (open: boolean) => void
	isMobile: boolean
	toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
	const context = React.useContext(SidebarContext)
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider.")
	}
	return context
}

function SidebarProvider({
	defaultOpen = true,
	open: openProp,
	onOpenChange: setOpenProp,
	className,
	style,
	children,
	...props
}: React.ComponentProps<"div"> & {
	defaultOpen?: boolean
	open?: boolean
	onOpenChange?: (open: boolean) => void
}) {
	const isMobile = useIsMobile()
	const [openMobile, setOpenMobile] = React.useState(false)
	const [_open, _setOpen] = React.useState(defaultOpen)
	const open = openProp ?? _open
	const setOpen = React.useCallback(
		(value: boolean | ((value: boolean) => boolean)) => {
			const openState = typeof value === "function" ? value(open) : value
			if (setOpenProp) {
				setOpenProp(openState)
			} else {
				_setOpen(openState)
			}
			document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
		},
		[setOpenProp, open],
	)

	const toggleSidebar = React.useCallback(() => {
		return isMobile
			? setOpenMobile((open) => !open)
			: setOpen((open) => !open)
	}, [isMobile, setOpen, setOpenMobile])

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault()
				toggleSidebar()
			}
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [toggleSidebar])

	const state = open ? "expanded" : "collapsed"

	const contextValue = React.useMemo<SidebarContextProps>(
		() => ({
			state,
			open,
			setOpen,
			isMobile,
			openMobile,
			setOpenMobile,
			toggleSidebar,
		}),
		[state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
	)

	return (
		<SidebarContext.Provider value={contextValue}>
			<div
				style={
					{
						"--sidebar-width": SIDEBAR_WIDTH,
						"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
						...style,
					} as React.CSSProperties
				}
				className={cn(
					"group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-base-1",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</SidebarContext.Provider>
	)
}

function Sidebar({
	side = "left",
	variant = "sidebar",
	collapsible = "offcanvas",
	className,
	children,
	dir,
	...props
}: React.ComponentProps<"div"> & {
	side?: "left" | "right"
	variant?: "sidebar" | "floating" | "inset"
	collapsible?: "offcanvas" | "icon" | "none"
}) {
	const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

	if (collapsible === "none") {
		return (
			<div
				className={cn(
					"flex h-full w-(--sidebar-width) flex-col bg-base-1 text-primary",
					className,
				)}
				{...props}
			>
				{children}
			</div>
		)
	}

	if (isMobile) {
		return (
			<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
				<SheetContent
					dir={dir}
					data-sidebar="sidebar"
					data-mobile="true"
					className="w-(--sidebar-width) bg-base-1 p-0 text-primary [&>button]:hidden"
					style={
						{
							"--sidebar-width": SIDEBAR_WIDTH_MOBILE,
						} as React.CSSProperties
					}
					side={side}
				>
					<SheetHeader className="sr-only">
						<SheetTitle>Sidebar</SheetTitle>
						<SheetDescription>Displays the mobile sidebar.</SheetDescription>
					</SheetHeader>
					<div className="flex h-full w-full flex-col">{children}</div>
				</SheetContent>
			</Sheet>
		)
	}

	return (
		<div
			className="group peer hidden text-primary md:block"
			data-state={state}
			data-collapsible={state === "collapsed" ? collapsible : ""}
			data-variant={variant}
			data-side={side}
		>
			<div
				className={cn(
					"relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
					"group-data-[collapsible=offcanvas]:w-0",
					"group-data-[side=right]:rotate-180",
					variant === "floating" || variant === "inset"
						? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
						: "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
				)}
			/>
			<div
				data-side={side}
				className={cn(
					"fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
					variant === "floating" || variant === "inset"
						? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
						: "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=left]:border-neutral group-data-[side=right]:border-l group-data-[side=right]:border-neutral",
					className,
				)}
				{...props}
			>
				<div
					data-sidebar="sidebar"
					className="flex size-full flex-col bg-base-1 group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-neutral"
				>
					{children}
				</div>
			</div>
		</div>
	)
}

function SidebarTrigger({
	className,
	onClick,
	...props
}: React.ComponentProps<typeof Button>) {
	const { toggleSidebar } = useSidebar()
	return (
		<Button
			data-sidebar="trigger"
			variant="transparent"
			size="sm"
			className={cn(className)}
			onClick={(event) => {
				onClick?.(event)
				toggleSidebar()
			}}
			{...props}
		>
			<Bars3Icon className="size-4" />
			<span className="sr-only">Toggle Sidebar</span>
		</Button>
	)
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
	const { toggleSidebar } = useSidebar()
	return (
		<button
			aria-label="Toggle Sidebar"
			tabIndex={-1}
			onClick={toggleSidebar}
			title="Toggle Sidebar"
			className={cn(
				"absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] hover:after:bg-neutral sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
				"in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
				"[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
				"group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-base-1",
				"[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
				"[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
				className,
			)}
			{...props}
		/>
	)
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
	return (
		<main
			className={cn(
				"relative flex w-full flex-1 flex-col bg-base-1 md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
				className,
			)}
			{...props}
		/>
	)
}

function SidebarInput({
	className,
	...props
}: React.ComponentProps<typeof Input>) {
	return (
		<Input
			data-sidebar="input"
			className={cn("h-8 w-full border-neutral bg-subtle/20", className)}
			{...props}
		/>
	)
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="header"
			className={cn("flex flex-col gap-2 p-2", className)}
			{...props}
		/>
	)
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="footer"
			className={cn("flex flex-col gap-2 p-2", className)}
			{...props}
		/>
	)
}

function SidebarSeparator({
	className,
	...props
}: React.ComponentProps<typeof Separator>) {
	return (
		<Separator
			data-sidebar="separator"
			className={cn("mx-2 w-auto bg-neutral", className)}
			{...props}
		/>
	)
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="content"
			className={cn(
				"no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
				className,
			)}
			{...props}
		/>
	)
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="group"
			className={cn(
				"relative flex w-full min-w-0 flex-col px-2 py-1",
				className,
			)}
			{...props}
		/>
	)
}

function SidebarGroupLabel({
	className,
	render,
	...props
}: useRender.ComponentProps<"div"> & React.ComponentProps<"div">) {
	return useRender({
		defaultTagName: "div",
		props: mergeProps<"div">(
			{
				className: cn(
					"flex h-8 shrink-0 items-center rounded-md px-2 text-xs text-secondary ring-focus outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
					className,
				),
			},
			props,
		),
		render,
		state: {
			slot: "sidebar-group-label",
			sidebar: "group-label",
		},
	})
}

function SidebarGroupAction({
	className,
	render,
	...props
}: useRender.ComponentProps<"button"> & React.ComponentProps<"button">) {
	return useRender({
		defaultTagName: "button",
		props: mergeProps<"button">(
			{
				className: cn(
					"absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-secondary ring-focus outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-subtle hover:text-primary focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
					className,
				),
			},
			props,
		),
		render,
		state: {
			slot: "sidebar-group-action",
			sidebar: "group-action",
		},
	})
}

function SidebarGroupContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-sidebar="group-content"
			className={cn("w-full text-xs", className)}
			{...props}
		/>
	)
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-sidebar="menu"
			className={cn("flex w-full min-w-0 flex-col gap-px", className)}
			{...props}
		/>
	)
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
	return (
		<li
			data-sidebar="menu-item"
			className={cn("group/menu-item relative", className)}
			{...props}
		/>
	)
}

const menuButtonVariantStyles = {
	default: "hover:bg-subtle hover:text-primary",
	outline:
		"bg-base-1 shadow-[0_0_0_1px_var(--border-color-neutral)] hover:bg-subtle hover:text-primary",
} as const

const menuButtonSizeStyles = {
	default: "h-8 text-xs",
	sm: "h-7 text-xs",
	lg: "h-12 text-xs group-data-[collapsible=icon]:p-0!",
} as const

export type SidebarMenuButtonVariant = keyof typeof menuButtonVariantStyles
export type SidebarMenuButtonSize = keyof typeof menuButtonSizeStyles

function SidebarMenuButton({
	render,
	isActive = false,
	variant = "default",
	size = "default",
	tooltip,
	className,
	...props
}: useRender.ComponentProps<"button"> &
	React.ComponentProps<"button"> & {
		isActive?: boolean
		tooltip?: string | React.ComponentProps<typeof TooltipContent>
	} & {
		variant?: SidebarMenuButtonVariant
		size?: SidebarMenuButtonSize
	}) {
	const { isMobile, state } = useSidebar()
	const comp = useRender({
		defaultTagName: "button",
		props: mergeProps<"button">(
			{
				className: cn(
					"peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-xs ring-focus outline-hidden transition-[width,height,padding]",
					"group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
					"focus-visible:ring-2 active:bg-subtle active:text-primary disabled:pointer-events-none disabled:opacity-50",
					"data-open:hover:bg-subtle data-open:hover:text-primary data-active:bg-subtle data-active:font-medium data-active:text-primary",
					"[&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
					menuButtonVariantStyles[variant],
					menuButtonSizeStyles[size],
					className,
				),
			},
			props,
		),
		render: !tooltip ? render : <TooltipTrigger render={render} />,
		state: {
			slot: "sidebar-menu-button",
			sidebar: "menu-button",
			size,
			active: isActive,
		},
	})

	if (!tooltip) return comp

	if (typeof tooltip === "string") {
		tooltip = { children: tooltip }
	}

	return (
		<Tooltip>
			{comp}
			<TooltipContent
				side="right"
				hidden={state !== "collapsed" || isMobile}
				{...tooltip}
			/>
		</Tooltip>
	)
}

function SidebarMenuAction({
	className,
	render,
	showOnHover = false,
	...props
}: useRender.ComponentProps<"button"> &
	React.ComponentProps<"button"> & {
		showOnHover?: boolean
	}) {
	return useRender({
		defaultTagName: "button",
		props: mergeProps<"button">(
			{
				className: cn(
					"absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-secondary ring-focus outline-hidden transition-transform hover:bg-subtle hover:text-primary focus-visible:ring-2 peer-hover/menu-button:text-primary [&>svg]:size-4 [&>svg]:shrink-0",
					"after:absolute after:-inset-2 md:after:hidden",
					"group-data-[collapsible=icon]:hidden",
					showOnHover &&
						"group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-active/menu-button:text-primary md:opacity-0",
					className,
				),
			},
			props,
		),
		render,
		state: {
			slot: "sidebar-menu-action",
			sidebar: "menu-action",
		},
	})
}

function SidebarMenuBadge({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"pointer-events-none absolute right-1 flex min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-secondary select-none group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	)
}

function SidebarMenuSkeleton({
	className,
	showIcon = false,
	...props
}: React.ComponentProps<"div"> & {
	showIcon?: boolean
}) {
	const width = React.useMemo(() => {
		return `${Math.floor(Math.random() * 40) + 50}%`
	}, [])

	return (
		<div
			className={cn(
				"flex h-8 items-center gap-2 rounded-md px-2",
				className,
			)}
			{...props}
		>
			{showIcon && (
				<Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />
			)}
			<Skeleton
				className="h-4 max-w-(--skeleton-width) flex-1"
				data-sidebar="menu-skeleton-text"
				style={{ "--skeleton-width": width } as React.CSSProperties}
			/>
		</div>
	)
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-sidebar="menu-sub"
			className={cn(
				"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-neutral px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	)
}

function SidebarMenuSubItem({
	...props
}: React.ComponentProps<"li">) {
	return <li {...props} />
}

function SidebarMenuSubButton({
	render,
	size = "default",
	isActive,
	className,
	...props
}: useRender.ComponentProps<"a"> &
	React.ComponentProps<"a"> & {
		isActive?: boolean
		size?: "sm" | "default"
	}) {
	return useRender({
		defaultTagName: "a",
		props: mergeProps<"a">(
			{
				className: cn(
					"flex min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-secondary ring-focus outline-hidden hover:bg-subtle hover:text-primary focus-visible:ring-2 active:bg-subtle active:text-primary disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-secondary",
					size === "sm" ? "h-7 text-xs" : "h-8 text-xs",
					isActive && "bg-subtle font-medium text-primary",
					className,
				),
			},
			props,
		),
		render,
		state: {
			slot: "sidebar-menu-sub-button",
			sidebar: "menu-sub-button",
			size,
			active: isActive,
		},
	})
}

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
}
