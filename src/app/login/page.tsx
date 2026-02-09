'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleMagicLink = async () => {
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const supabase = getSupabaseBrowserClient()
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '')
      const redirectTo = baseUrl ? `${baseUrl.replace(/\/$/, '')}/auth/callback` : undefined

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (signInError) {
        throw signInError
      }

      setMessage('Check your inbox for the magic link.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send magic link.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email to receive a secure sign-in link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleMagicLink} disabled={!email || isLoading}>
            {isLoading ? 'Sending...' : 'Continue with email'}
          </Button>
          {message ? (
            <p className="text-xs text-success">{message}</p>
          ) : null}
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              We'll send a secure sign-in link to your email address.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
