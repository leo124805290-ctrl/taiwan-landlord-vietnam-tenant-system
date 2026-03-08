/**
 * 前端性能優化工具
 * 任務3.1：性能優化和緩存實現
 */

// 懶加載配置
export const lazyLoadConfig = {
  // 圖片懶加載
  images: {
    rootMargin: '50px 0px',
    threshold: 0.01,
  },
  // 組件懶加載
  components: {
    loadingDelay: 200, // ms
  },
}

// 圖片優化工具
export class ImageOptimizer {
  static optimizeImageUrl(url: string, options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {}): string {
    // 如果是外部URL，直接返回
    if (!url.startsWith('/')) return url
    
    const params = new URLSearchParams()
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('fm', options.format)
    
    return params.toString() ? `${url}?${params.toString()}` : url
  }
  
  static preloadCriticalImages(imageUrls: string[]) {
    imageUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  }
}

// 緩存管理
export class CacheManager {
  private static readonly PREFIX = 'taiwan_landlord_'
  private static readonly DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24小時
  
  static set(key: string, value: any, ttl: number = this.DEFAULT_TTL) {
    try {
      const item = {
        value: JSON.stringify(value),
        expiry: Date.now() + ttl,
      }
      localStorage.setItem(`${this.PREFIX}${key}`, JSON.stringify(item))
      return true
    } catch (error) {
      console.warn('緩存設置失敗:', error)
      return false
    }
  }
  
  static get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(`${this.PREFIX}${key}`)
      if (!itemStr) return null
      
      const item = JSON.parse(itemStr)
      if (Date.now() > item.expiry) {
        this.remove(key)
        return null
      }
      
      return JSON.parse(item.value)
    } catch (error) {
      console.warn('緩存讀取失敗:', error)
      this.remove(key)
      return null
    }
  }
  
  static remove(key: string) {
    localStorage.removeItem(`${this.PREFIX}${key}`)
  }
  
  static clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key))
  }
  
  static getStats() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.PREFIX))
    let totalSize = 0
    
    keys.forEach(key => {
      totalSize += localStorage.getItem(key)?.length || 0
    })
    
    return {
      count: keys.length,
      totalSize: totalSize,
      averageSize: keys.length > 0 ? totalSize / keys.length : 0,
    }
  }
}

// 性能監控
export class PerformanceMonitor {
  private static metrics: Record<string, number> = {}
  private static observers: PerformanceObserver[] = []
  
  static start() {
    // 監測首次內容繪製（FCP）
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach(entry => {
            this.metrics.fcp = entry.startTime
            console.log('FCP:', entry.startTime, 'ms')
          })
        })
        fcpObserver.observe({ type: 'paint', buffered: true })
        this.observers.push(fcpObserver)
      } catch (e) {
        console.warn('FCP監測失敗:', e)
      }
      
      // 監測最大內容繪製（LCP）
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.metrics.lcp = lastEntry.startTime
          console.log('LCP:', lastEntry.startTime, 'ms')
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP監測失敗:', e)
      }

// 監測累計佈局偏移（CLS）
      try {
        let clsValue = 0
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry instanceof PerformanceResourceTiming)) continue
            if ('hadRecentInput' in entry && !entry.hadRecentInput && 'value' in entry) {
              const layoutShift = entry as PerformanceEntry & { value: number }
              clsValue += layoutShift.value
              this.metrics.cls = clsValue
              console.log('CLS累計:', clsValue)
            }
          }
        })
        clsObserver.observe({ type: 'layout-shift', buffered: true })
        this.observers.push(clsObserver)
      } catch (e) {
        console.warn('CLS監測失敗:', e)
      }
    }
  }
  
  static stop() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
  
  static getMetrics() {
    return { ...this.metrics }
  }
  
  static reportToAnalytics() {
    const metrics = this.getMetrics()
    // 這裡可以發送到分析服務
    console.log('性能指標報告:', metrics)
    return metrics
  }
}

// 資源預加載
export function preloadResources(resources: Array<{
  url: string
  as: 'script' | 'style' | 'image' | 'font'
  crossorigin?: boolean
}>) {
  resources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.url
    link.as = resource.as
    if (resource.crossorigin) link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// 代碼分割工具
export function lazyImport<T>(factory: () => Promise<{ default: T }>) {
  return factory().then(module => module.default)
}

// 防抖和節流
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// 性能優化Hooks
import { useEffect, useRef } from 'react'

export function usePerformanceMonitor() {
  useEffect(() => {
    PerformanceMonitor.start()
    return () => PerformanceMonitor.stop()
  }, [])
  
  return PerformanceMonitor.getMetrics
}

export function useCache<T>(key: string, initialValue: T, ttl?: number) {
  const cachedValue = CacheManager.get<T>(key)
  const valueRef = useRef<T>(cachedValue || initialValue)
  
  const setValue = (newValue: T) => {
    valueRef.current = newValue
    CacheManager.set(key, newValue, ttl)
  }
  
  return [valueRef.current, setValue] as const
}