import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Providers } from '@/components/providers'
import { geistMono, geistSans } from '@/lib/design/fonts'
import { isTheme, THEME_COOKIE_NAME, THEME_STORAGE_KEY, type Theme } from '@/lib/preferences/theme'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Knowledge Base Studio',
    template: '%s | Knowledge Base Studio',
  },
  description:
    'Knowledge Base Studio for managing embeddings, monitoring system health, and exploring search and analytics workflows',
  keywords: [
    'knowledge base',
    'studio',
    'embeddings',
    'monitoring',
    'search',
    'analytics',
  ],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f10' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const cookieTheme = cookieStore.get(THEME_COOKIE_NAME)?.value
  const initialTheme: Theme = isTheme(cookieTheme) ? cookieTheme : 'system'

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
                const cookieName = ${JSON.stringify(THEME_COOKIE_NAME)};
                const cookieTheme = document.cookie
                  .split('; ')
                  .find((entry) => entry.startsWith(cookieName + '='))
                  ?.split('=')[1];
                const storedTheme =
                  localStorage.getItem(storageKey) ||
                  (cookieTheme ? decodeURIComponent(cookieTheme) : null) ||
                  'system';
                const theme = ['light', 'dark', 'system'].includes(storedTheme)
                  ? storedTheme
                  : 'system';
                const resolved = theme === 'system'
                  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                  : theme;
                document.documentElement.classList.add(resolved);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers initialTheme={initialTheme}>{children}</Providers>
      </body>
    </html>
  )
}
