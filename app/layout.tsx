import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🏢 多物業管理系統 Pro v2.0',
  description: '專業的多物業管理系統，支援中文/越南文，提供完整的租金、電費、維修管理功能',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏢</text></svg>" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}