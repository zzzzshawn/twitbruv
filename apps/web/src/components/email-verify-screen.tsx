import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import { RESEND_COOLDOWN_SEC } from "@workspace/validators/auth"
import { authClient } from "../lib/auth"
import { useMe } from "../lib/me"

// While the verify screen is up, poll /api/me faster than the ambient 30s so that clicking
// the email link in another tab unlocks the app within ~5s.
const POLL_INTERVAL_MS = 5_000

export function EmailVerifyScreen({ email }: { email: string }) {
  const { refresh } = useMe()
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [sending, setSending] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCountdown = useCallback((sec: number) => {
    setSecondsLeft(sec)
    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (tickRef.current) {
            clearInterval(tickRef.current)
            tickRef.current = null
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [])

  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [refresh])

  const onResend = useCallback(async () => {
    if (sending || secondsLeft > 0) return
    setSending(true)
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${window.location.origin}/?verified=1`,
      })
      if (error) {
        // better-auth surfaces the API status under error.status when the rate limiter fires.
        const status = (error as { status?: number }).status
        if (status === 429) {
          toast.error("Slow down — wait before requesting another email.")
          startCountdown(RESEND_COOLDOWN_SEC)
        } else {
          toast.error(error.message ?? "Could not send verification email")
        }
        return
      }
      toast.success("Verification email sent")
      startCountdown(RESEND_COOLDOWN_SEC)
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not send verification email"
      )
    } finally {
      setSending(false)
    }
  }, [email, sending, secondsLeft, startCountdown])

  const onSignOut = useCallback(async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await authClient.signOut()
    } catch {
      // best-effort; we still bounce to /login below
    }
    if (typeof window !== "undefined") {
      window.location.assign("/login")
    }
  }, [signingOut])

  const buttonLabel = sending
    ? "Sending…"
    : secondsLeft > 0
      ? `Resend in ${secondsLeft}s`
      : "Resend email"

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <Card.Header>
          <span className="text-sm font-medium text-primary">
            Verify your email
          </span>
          <span className="text-xs text-tertiary">
            We sent a verification link to <strong>{email}</strong>. Click it to
            unlock your account.
          </span>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            This page will refresh automatically once your email is verified.
            Check your spam folder if the email doesn't arrive within a minute.
          </p>
          <Button
            type="button"
            size="md"
            className="w-full"
            onClick={onResend}
            disabled={sending || secondsLeft > 0}
          >
            {buttonLabel}
          </Button>
          <button
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            className="text-muted-foreground text-center text-xs underline-offset-4 hover:underline disabled:opacity-50"
          >
            Use a different account
          </button>
        </Card.Content>
      </Card>
    </div>
  )
}
