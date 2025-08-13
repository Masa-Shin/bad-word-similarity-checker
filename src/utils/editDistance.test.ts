import { describe, it, expect, beforeEach } from 'vitest'
import { calculateEditDistance, findSimilarWords, clearDistanceCache, calculateDynamicThreshold } from './editDistance'

describe('calculateEditDistance', () => {
  beforeEach(() => {
    clearDistanceCache()
  })

  it('同じ文字列の距離は0', () => {
    expect(calculateEditDistance('hello', 'hello')).toBe(0)
    expect(calculateEditDistance('', '')).toBe(0)
  })

  it('空文字列との距離は文字列長', () => {
    expect(calculateEditDistance('hello', '')).toBe(5)
    expect(calculateEditDistance('', 'world')).toBe(5)
  })

  it('基本的な編集操作', () => {
    // 置換
    expect(calculateEditDistance('cat', 'bat')).toBe(1)
    expect(calculateEditDistance('hello', 'hallo')).toBe(1)
    
    // 挿入
    expect(calculateEditDistance('cat', 'cats')).toBe(1)
    expect(calculateEditDistance('hell', 'hello')).toBe(1)
    
    // 削除
    expect(calculateEditDistance('cats', 'cat')).toBe(1)
    expect(calculateEditDistance('hello', 'hell')).toBe(1)
  })

  it('転置操作のテスト', () => {
    // 隣接転置
    expect(calculateEditDistance('ab', 'ba')).toBe(1)
    expect(calculateEditDistance('receieve', 'recieve')).toBe(1)
    expect(calculateEditDistance('abc', 'bac')).toBe(1)
    
    // 非隣接転置
    expect(calculateEditDistance('abc', 'acb')).toBe(1)
    expect(calculateEditDistance('hello', 'oellh')).toBe(2)
    expect(calculateEditDistance('cat', 'tac')).toBe(2)
    expect(calculateEditDistance('abc', 'cba')).toBe(2)
    expect(calculateEditDistance('abcd', 'adcb')).toBe(2)
    expect(calculateEditDistance('abcd', 'dcba')).toBe(3)
  })

  it('複雑な変換とエッジケース', () => {
    // 複雑な変換
    expect(calculateEditDistance('kitten', 'sitting')).toBe(3)
    expect(calculateEditDistance('saturday', 'sunday')).toBe(3)
    
    // 境界条件
    expect(calculateEditDistance('a', 'b')).toBe(1)
    expect(calculateEditDistance('aaaa', 'bbbb')).toBe(4)
    expect(calculateEditDistance('aaaa', 'aaab')).toBe(1)
    
    // 長い文字列
    const longStr1 = 'a'.repeat(100)
    const longStr2 = 'b'.repeat(100)
    expect(calculateEditDistance(longStr1, longStr2)).toBe(100)
  })
})

describe('findSimilarWords', () => {
  const testWordList = ['cat', 'bat', 'rat', 'dog', 'cats', 'bats']
  const testWordInfo = {
    'cat': 1,
    'bat': 2,
    'rat': 1,
    'dog': 0,
    'cats': 1,
    'bats': 2
  }

  beforeEach(() => {
    clearDistanceCache()
  })

  it('空の入力では空配列を返す', () => {
    expect(findSimilarWords('', testWordList)).toEqual([])
    expect(findSimilarWords('  ', testWordList)).toEqual([])
  })

  it('閾値内の単語を正しく検索', () => {
    const results = findSimilarWords('cat', testWordList, 1)
    const words = results.map(r => r.word)
    
    expect(words).toContain('cat')
    expect(words).toContain('bat')
    expect(words).toContain('rat')
    expect(words).toContain('cats')
    expect(words).not.toContain('dog')
  })

  it('結果が距離でソートされる', () => {
    const results = findSimilarWords('cat', testWordList, 2)
    
    // 距離0の単語が最初に来る
    expect(results[0]?.word).toBe('cat')
    expect(results[0]?.distance).toBe(0)
    
    // 距離が増加順になっている
    for (let i = 1; i < results.length; i++) {
      const current = results[i]
      const previous = results[i - 1]
      if (current && previous) {
        expect(current.distance).toBeGreaterThanOrEqual(previous.distance)
      }
    }
  })

  it('同じ距離の場合はレーティングでソート', () => {
    // 'bat'(rating:2) と 'rat'(rating:1) は両方とも'cat'から距離1
    const results = findSimilarWords('cat', testWordList, 1, testWordInfo)
    
    // 距離1の単語を抽出
    const distance1Words = results.filter(r => r.distance === 1)
    expect(distance1Words.length).toBeGreaterThanOrEqual(2)
    
    // 'bat'(rating:2)が'rat'(rating:1)より前に来ることを確認
    const batIndex = distance1Words.findIndex(w => w.word === 'bat')
    const ratIndex = distance1Words.findIndex(w => w.word === 'rat')
    expect(batIndex).toBeLessThan(ratIndex) // 高rating優先
    expect(distance1Words[batIndex]?.rating).toBe(2)
    expect(distance1Words[ratIndex]?.rating).toBe(1)
  })

  it('閾値計算', () => {
    const testCases = [
      { length: 1, expected: 0 },   // 1文字 → 0 (制限的)
      { length: 2, expected: 1 },   // 2-4文字 → 1
      { length: 3, expected: 1 },
      { length: 4, expected: 1 },
      { length: 5, expected: 2 },   // 5-7文字 → 2
      { length: 6, expected: 2 },
      { length: 7, expected: 2 },
      { length: 8, expected: 3 },   // 8-10文字 → 3
    ]

    testCases.forEach(({ length, expected }) => {
      const actual = calculateDynamicThreshold(length)
      expect(actual).toBe(expected)
    })
  })
})
