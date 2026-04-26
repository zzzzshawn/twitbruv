import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { ChevronRightIcon, CheckIcon } from "@heroicons/react/16/solid"
import { cn } from "@workspace/ui/lib/utils"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
	return <MenuPrimitive.Root {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
	return <MenuPrimitive.Portal {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
	return <MenuPrimitive.Trigger {...props} />
}

function DropdownMenuContent({
	align = "start",
	alignOffset = 0,
	side = "bottom",
	sideOffset = 4,
	className,
	...props
}: MenuPrimitive.Popup.Props &
	Pick<
		MenuPrimitive.Positioner.Props,
		"align" | "alignOffset" | "side" | "sideOffset"
	>) {
	return (
		<MenuPrimitive.Portal>
			<MenuPrimitive.Positioner
				className="isolate z-50 outline-none"
				align={align}
				alignOffset={alignOffset}
				side={side}
				sideOffset={sideOffset}
			>
				<MenuPrimitive.Popup
					className={cn(
						"z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg p-1 text-primary shadow-md ring-1 ring-neutral duration-100 outline-none",
						"data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						"relative bg-base-1/70 before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150",
						"**:data-[slot$=-item]:focus:bg-subtle **:data-[slot$=-item]:data-highlighted:bg-subtle",
						className,
					)}
					{...props}
				/>
			</MenuPrimitive.Positioner>
		</MenuPrimitive.Portal>
	)
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
	return <MenuPrimitive.Group {...props} />
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: MenuPrimitive.GroupLabel.Props & { inset?: boolean }) {
	return (
		<MenuPrimitive.GroupLabel
			data-inset={inset}
			className={cn(
				"px-2 py-1.5 text-xs text-secondary data-inset:pl-7.5",
				className,
			)}
			{...props}
		/>
	)
}

function DropdownMenuItem({
	className,
	inset,
	variant = "default",
	...props
}: MenuPrimitive.Item.Props & {
	inset?: boolean
	variant?: "default" | "destructive"
}) {
	return (
		<MenuPrimitive.Item
			data-slot="dropdown-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				"group/dropdown-menu-item relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none",
				"focus:bg-subtle focus:text-primary data-inset:pl-7.5",
				"data-[variant=destructive]:text-danger data-[variant=destructive]:focus:bg-danger-subtle data-[variant=destructive]:focus:text-danger",
				"data-disabled:pointer-events-none data-disabled:opacity-50",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			{...props}
		/>
	)
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
	return <MenuPrimitive.SubmenuRoot {...props} />
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: MenuPrimitive.SubmenuTrigger.Props & { inset?: boolean }) {
	return (
		<MenuPrimitive.SubmenuTrigger
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset}
			className={cn(
				"flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs outline-hidden select-none",
				"focus:bg-subtle focus:text-primary data-inset:pl-7.5",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronRightIcon className="ml-auto size-3.5" />
		</MenuPrimitive.SubmenuTrigger>
	)
}

function DropdownMenuSubContent({
	align = "start",
	alignOffset = -3,
	side = "right",
	sideOffset = 0,
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
	return (
		<DropdownMenuContent
			className={cn("w-auto min-w-32", className)}
			align={align}
			alignOffset={alignOffset}
			side={side}
			sideOffset={sideOffset}
			{...props}
		/>
	)
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	inset,
	...props
}: MenuPrimitive.CheckboxItem.Props & { inset?: boolean }) {
	return (
		<MenuPrimitive.CheckboxItem
			data-slot="dropdown-menu-checkbox-item"
			data-inset={inset}
			className={cn(
				"relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none",
				"focus:bg-subtle focus:text-primary data-inset:pl-7.5",
				"data-disabled:pointer-events-none data-disabled:opacity-50",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			checked={checked}
			{...props}
		>
			<span className="pointer-events-none absolute right-2 flex items-center justify-center">
				<MenuPrimitive.CheckboxItemIndicator>
					<CheckIcon className="size-3.5" />
				</MenuPrimitive.CheckboxItemIndicator>
			</span>
			{children}
		</MenuPrimitive.CheckboxItem>
	)
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
	return <MenuPrimitive.RadioGroup {...props} />
}

function DropdownMenuRadioItem({
	className,
	children,
	inset,
	...props
}: MenuPrimitive.RadioItem.Props & { inset?: boolean }) {
	return (
		<MenuPrimitive.RadioItem
			data-slot="dropdown-menu-radio-item"
			data-inset={inset}
			className={cn(
				"relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none",
				"focus:bg-subtle focus:text-primary data-inset:pl-7.5",
				"data-disabled:pointer-events-none data-disabled:opacity-50",
				"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
				className,
			)}
			{...props}
		>
			<span className="pointer-events-none absolute right-2 flex items-center justify-center">
				<MenuPrimitive.RadioItemIndicator>
					<CheckIcon className="size-3.5" />
				</MenuPrimitive.RadioItemIndicator>
			</span>
			{children}
		</MenuPrimitive.RadioItem>
	)
}

function DropdownMenuSeparator({
	className,
	...props
}: MenuPrimitive.Separator.Props) {
	return (
		<MenuPrimitive.Separator
			className={cn("-mx-1 my-1 h-px bg-neutral", className)}
			{...props}
		/>
	)
}

function DropdownMenuShortcut({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			className={cn(
				"ml-auto text-[0.625rem] tracking-widest text-tertiary",
				className,
			)}
			{...props}
		/>
	)
}

export {
	DropdownMenu,
	DropdownMenuPortal,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
}
