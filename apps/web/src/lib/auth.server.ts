import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import type { SelfUser } from "./api"

const API_URL =
  process.env.VITE_PUBLIC_API_URL ?? "http://localhost:3001"

export interface ServerAuthState {
  user: SelfUser | null
}

/**
 * Server function that reads the session cookie from the incoming SSR request,
 * forwards it to the API server to validate the session and fetch the user profile.
 *
 * Runs server-side during SSR (fast same-network call) so the sidebar can render
 * fully on the first paint with no flicker.
 */
export const getServerAuthState = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServerAuthState> => {
    const headers = getRequestHeaders()
    const cookie = headers.get("cookie")

    if (!cookie) return { user: null }

    try {
      // Validate session via better-auth
      const sessionRes = await fetch(`${API_URL}/api/auth/get-session`, {
        headers: { cookie },
      })
      if (!sessionRes.ok) return { user: null }

      const sessionData = await sessionRes.json()
      if (!sessionData?.session) return { user: null }

      // Fetch full user profile
      const meRes = await fetch(`${API_URL}/api/me`, {
        headers: { cookie },
      })
      if (!meRes.ok) return { user: null }

      const { user } = (await meRes.json()) as { user: SelfUser }
      return { user }
    } catch {
      return { user: null }
    }
  },
)
