import type { Metadata } from 'next'
import { Orbitron, Space_Mono } from 'next/font/google'
import './globals.css'
import { BRANDING } from '@/lib/constants'
import { ToastProvider } from '@/components/ui/Toast'
import { StarField } from '@/components/space/StarField'
import { SpaceDebris } from '@/components/space/SpaceDebris'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
  fallback: ['monospace', 'Courier New'],
})

export const metadata: Metadata = {
  title: `${BRANDING.name} | ${BRANDING.full_title}`,
  description: `${BRANDING.name}: ${BRANDING.tagline}. Smart India Hackathon 2026, PS 26170, ISRO, Team GSR NEXUS.`,
  keywords: [
    'AGNIVEDH',
    'ISRO',
    'Component Burn-In',
    'Latent Defect Detection',
    'Explainable AI',
    'Smart India Hackathon 2026',
    'Team GSR NEXUS',
  ],
  openGraph: {
    title: `${BRANDING.name} — ${BRANDING.tagline}`,
    description: BRANDING.full_title,
    siteName: BRANDING.name,
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${spaceMono.variable}`}>
      <body className="bg-background text-foreground antialiased min-h-screen relative selection:bg-[#39FF14] selection:text-black">
        <ToastProvider>
          {/* Animated space background canvas & debris */}
          <StarField />
          <SpaceDebris />

          {/* Main Content Area */}
          <div className="relative z-10 flex flex-col min-h-screen">
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
