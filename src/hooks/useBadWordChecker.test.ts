import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBadWordChecker } from './useBadWordChecker'

// モックデータ
vi.mock('../data/badWords', () => ({
  badWordList: ['bad', 'evil', 'wrong', 'test'],
  badWordInfo: {
    'bad': 2,
    'evil': 2,
    'wrong': 1,
    'test': 0
  }
}))

describe('useBadWordChecker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('空の入力では結果が空', () => {
    const { result } = renderHook(() => useBadWordChecker(''))
    
    expect(result.current.similarWords).toEqual([])
    expect(result.current.isChecking).toBe(false)
    expect(result.current.hasSimilarWords).toBe(false)
  })

  it('スペースのみの入力では結果が空', () => {
    const { result } = renderHook(() => useBadWordChecker('   '))
    
    expect(result.current.similarWords).toEqual([])
    expect(result.current.isChecking).toBe(false)
    expect(result.current.hasSimilarWords).toBe(false)
  })

  it('入力後250ms待ってから検索を実行', async () => {
    const { result } = renderHook(() => useBadWordChecker('bad'))
    
    // 最初はチェック中
    expect(result.current.isChecking).toBe(true)
    expect(result.current.similarWords).toEqual([])
    
    // 250ms経過
    await act(async () => {
      vi.advanceTimersByTime(250)
    })
    
    expect(result.current.isChecking).toBe(false)
    expect(result.current.similarWords.length).toBeGreaterThan(0)
    expect(result.current.hasSimilarWords).toBe(true)
  })

  it('入力が変更されると前の検索をキャンセル', async () => {
    const { result, rerender } = renderHook(
      ({ input }) => useBadWordChecker(input),
      { initialProps: { input: 'bad' } }
    )
    
    // 100ms待つ
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    
    // 入力を変更
    rerender({ input: 'evil' })
    
    // さらに250ms待つ
    await act(async () => {
      vi.advanceTimersByTime(250)
    })
    
    // 'evil'の結果が返ってくる
    const evilMatch = result.current.similarWords.find(w => w.word === 'evil')
    expect(evilMatch).toBeDefined()
    expect(evilMatch?.distance).toBe(0)
  })

  it('結果が距離でソートされる', async () => {
    const { result } = renderHook(() => useBadWordChecker('bads'))
    
    await act(async () => {
      vi.advanceTimersByTime(250)
    })
    
    const words = result.current.similarWords
    
    // 距離が昇順にソートされていることを確認
    for (let i = 1; i < words.length; i++) {
      const current = words[i]
      const previous = words[i - 1]
      if (current && previous) {
        expect(current.distance).toBeGreaterThanOrEqual(previous.distance)
      }
    }
  })
})
