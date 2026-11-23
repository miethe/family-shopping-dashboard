import localFont from 'next/font/local'
const display = localFont({ src: './fonts/Montserrat-Bold.otf', variable: '--font-display', display: 'swap', weight: '700', fallback: ['system-ui'] })
const body = localFont({ src: './fonts/OpenSans-Regular.ttf', variable: '--font-body', display: 'swap', weight: '400', fallback: ['system-ui'] })
const symbols = localFont({ src: './fonts/MaterialSymbols.ttf', variable: '--font-symbols', display: 'block', preload: false })
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { PWARegister } from '@/components/pwa-register'

export const metadata: Metadata = {
  title: 'Family Gifting Dashboard',
  description: 'Plan and coordinate family gifts together',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Gifting',
  },

}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#354de8',
  viewportFit: 'cover', // For iOS safe areas
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={`${display.variable} ${body.variable} ${symbols.variable}`} lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <PWARegister />
          {children}
        </Providers>
      </body>
    </html>
  )
}
