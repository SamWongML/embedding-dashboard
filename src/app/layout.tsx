import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { cookies } from 'next/headers'
import { Providers } from '@/components/providers'
import { isTheme, THEME_COOKIE_NAME, THEME_STORAGE_KEY, type Theme } from '@/lib/preferences/theme'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Embedding Dashboard',
    template: '%s | Embedding Dashboard',
  },
  description: 'Centralized embedding system dashboard with server monitoring, metrics, and search capabilities',
  keywords: ['embeddings', 'dashboard', 'monitoring', 'search', 'analytics'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
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
    <html lang="en" suppressHydrationWarning>
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
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <Providers initialTheme={initialTheme}>{children}</Providers>
      </body>
    </html>
  )
}
