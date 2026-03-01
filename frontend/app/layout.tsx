import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'

import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' })

export const metadata: Metadata = {
  title: 'Learning Lens',
  description: 'End-to-end AI-powered student assessment platform demo. Composting Systems project. Student uploads evidence, AI analyzes against rubric, generates prompts, student revises, teacher reviews.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${_inter.variable} ${_spaceMono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
