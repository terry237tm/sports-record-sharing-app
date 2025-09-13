import { useState, useEffect, useRef } from 'react'

/**
 * 防抖Hook
 * @param value 需要防抖的值
 * @param delay 防抖延迟时间（毫秒）
 * @returns 防抖后的值
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('')
 * const debouncedSearchTerm = useDebounce(searchTerm, 300)
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // 执行搜索逻辑
 *   }
 * }, [debouncedSearchTerm])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // 设置新的定时器
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * 防抖函数Hook - 用于函数防抖
 * @param func 需要防抖的函数
 * @param delay 防抖延迟时间（毫秒）
 * @param deps 依赖数组
 * @returns 防抖后的函数
 * 
 * @example
 * const debouncedSearch = useDebounceCallback((keyword: string) => {
 *   // 执行搜索逻辑
 * }, 300, [])
 * 
 * // 在输入框onChange中使用
 * onChange={(e) => debouncedSearch(e.detail.value)}
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const funcRef = useRef(func)

  // 更新函数引用
  useEffect(() => {
    funcRef.current = func
  }, [func])

  const debouncedFunc = useRef(((...args: Parameters<T>) => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // 设置新的定时器
    timerRef.current = setTimeout(() => {
      funcRef.current(...args)
    }, delay)
  }) as T).current

  // 清理函数
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return debouncedFunc
}

export default useDebounce