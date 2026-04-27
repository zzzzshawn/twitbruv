import { createContext, useCallback, useContext, useState } from "react"
import {
	Lightbox,
	type LightboxImage,
} from "@workspace/ui/components/lightbox"
import type { ReactNode } from "react"

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface LightboxState {
	images: LightboxImage[]
	index: number
	sidebar?: ReactNode
}

interface LightboxContextValue {
	open: (images: LightboxImage[], index?: number, sidebar?: ReactNode) => void
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function LightboxProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<LightboxState | null>(null)

	const openLightbox = useCallback(
		(images: LightboxImage[], index = 0, sidebar?: ReactNode) => {
			setState({ images, index, sidebar })
		},
		[],
	)

	const closeLightbox = useCallback(() => {
		setState(null)
	}, [])

	return (
		<LightboxContext.Provider value={{ open: openLightbox }}>
			{children}
			<Lightbox
				images={state?.images ?? []}
				initialIndex={state?.index ?? 0}
				open={state !== null}
				onOpenChange={(open) => {
					if (!open) closeLightbox()
				}}
				sidebar={state?.sidebar}
			/>
		</LightboxContext.Provider>
	)
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLightbox() {
	const ctx = useContext(LightboxContext)
	if (!ctx) throw new Error("useLightbox must be used inside <LightboxProvider>")
	return ctx
}
