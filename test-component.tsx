'use client'

import { useApp } from '@/contexts/AppContext'

export default function TestComponent() {
  try {
    const app = useApp()
    return <div>AppContext 工作正常: {app.state.tab}</div>
  } catch (error: any) {
    return <div>AppContext 錯誤: {error.message}</div>
  }
}
