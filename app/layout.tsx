import type { Metadata } from 'next'
import './globals.css'

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: 'CPDTracker – Track Your PEO CPD Hours',
  description: 'Easily track your professional development hours to stay compliant with PEO regulations.',
  generator: 'E Corp'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
