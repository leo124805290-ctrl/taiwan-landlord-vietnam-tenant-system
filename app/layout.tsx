import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '台灣房東越南租客管理系統',
  description: '專為台灣房東管理越南租客設計的管理平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.className} bg-gray-50`}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1 p-6">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
              <p>© 2026 台灣房東越南租客管理系統 - 專為台灣房東設計</p>
              <p className="mt-1">系統版本: 1.0.0 | 最後更新: 2026-02-20</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}