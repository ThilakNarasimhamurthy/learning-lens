import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'

import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' })

export const metadata: Metadata = {
  title: 'EduFlow AI - Interactive Demo',
  description: 'End-to-end AI-powered student assessment platform demo. Student uploads essay, AI analyzes against rubric, generates prompts, student revises, teacher reviews.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_inter.variable} ${_spaceMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
