// メモ化用のキャッシュ
const memoCache = new Map<string, number>()
const MAX_CACHE_SIZE = 10000

// キャッシュキーを生成
const getCacheKey = (str1: string, str2: string): string => {
  return `${str1}|${str2}`
}

// 安全な配列アクセスヘルパー関数
const safeGet = (matrix: number[][], row: number, col: number): number => {
  const rowData = matrix[row]
  return rowData?.[col] ?? Infinity
}
const safeSet = (matrix: number[][], row: number, col: number, value: number): void => {
  const rowData = matrix[row]
  if (rowData) {
    rowData[col] = value
  }
}

// ダメラウ・レーベンシュタイン距離の計算（キャッシュなし）
const computeDamerauLevenshteinDistance = (
  str1: string,
  str2: string,
  maxDistance?: number
): number => {
  const m = str1.length
  const n = str2.length
  
  // 空文字列のケース
  if (m === 0) return n
  if (n === 0) return m
  
  // ダメラウ・レーベンシュタイン距離の計算
  const H: number[][] = Array.from({ length: m + 2 }, () => 
    Array.from({ length: n + 2 }, () => Infinity)
  )
  
  const maxDist = m + n
  safeSet(H, 0, 0, maxDist)
  
  for (let i = 0; i <= m; i++) {
    safeSet(H, i + 1, 0, maxDist)
    safeSet(H, i + 1, 1, i)
  }
  
  for (let j = 0; j <= n; j++) {
    safeSet(H, 0, j + 1, maxDist)
    safeSet(H, 1, j + 1, j)
  }

  const da: Record<string, number> = {}
  const alphabet = new Set([...str1, ...str2])
  alphabet.forEach(char => da[char] = 0)

  for (let i = 1; i <= m; i++) {
    let db = 0
    
    // 早期終了チェック用の最小値
    let minDist = Infinity
    
    for (let j = 1; j <= n; j++) {
      const char2 = str2[j - 1] ?? ''
      const k = da[char2] ?? 0
      const l = db
      let cost = 1
      
      const char1 = str1[i - 1] ?? ''
      if (char1 === char2) {
        cost = 0
        db = j
      }
      
      const distance = Math.min(
        safeGet(H, i, j) + cost,         // 置換
        safeGet(H, i + 1, j) + 1,         // 挿入
        safeGet(H, i, j + 1) + 1,         // 削除
        safeGet(H, k, l) + (i - k - 1) + 1 + (j - l - 1)  // 転置
      )
      
      safeSet(H, i + 1, j + 1, distance)
      
      // 行の最小値を追跡
      if (j === n) {
        minDist = Math.min(minDist, distance)
      }
    }
    
    // 早期終了: 現在の行の最小値が閾値を超える場合
    if (maxDistance !== undefined && i < m) {
      // 残りの操作数を考慮
      const remainingOps = m - i
      if (minDist - remainingOps > maxDistance) {
        return maxDistance + 1
      }
    }
    
    const char1 = str1[i - 1]
    if (char1 != null) {
      da[char1] = i
    }
  }
  
  return safeGet(H, m + 1, n + 1)
}

export const calculateEditDistance = (
  str1: string, 
  str2: string, 
  maxDistance?: number
): number => {
  // メモ化チェック
  const cacheKey = getCacheKey(str1, str2)
  const cached = memoCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  // ダメラウ・レーベンシュタイン距離を計算
  const result = computeDamerauLevenshteinDistance(str1, str2, maxDistance)
  
  // 結果をキャッシュに保存
  memoCache.set(cacheKey, result)
  
  // キャッシュサイズ制限
  if (memoCache.size > MAX_CACHE_SIZE) {
    // 古いエントリを削除（FIFO）
    const firstKey = memoCache.keys().next().value
    if (firstKey !== undefined) {
      memoCache.delete(firstKey)
    }
  }
  
  return result
}

// キャッシュをクリアする関数
export const clearDistanceCache = (): void => {
  memoCache.clear()
}

export interface SimilarWord {
  word: string
  distance: number
  rating: number
}

// 閾値計算関数
export const calculateDynamicThreshold = (length: number): number => {
  // 3文字増えるごとに1上がる: 2-4→1, 5-7→2, 8-10→3...
  return Math.floor((length - 2) / 3) + 1
}

export const findSimilarWords = (
  input: string, 
  wordList: string[], 
  threshold?: number, 
  wordInfo?: Record<string, number>
): SimilarWord[] => {
  if (!input.trim()) return []
  
  const inputLower = input.toLowerCase()
  const dynamicThreshold = threshold ?? calculateDynamicThreshold(input.length)
  const similarWords: SimilarWord[] = []

  const filteredWords = wordList.filter(word => {
    // 長さの差が閾値を超える単語はあらかじめ除外
    const lengthDiff = Math.abs(word.length - input.length)
    return lengthDiff <= dynamicThreshold
  })

  filteredWords.forEach(word => {
    const distance = calculateEditDistance(inputLower, word.toLowerCase(), dynamicThreshold)
    
    if (distance <= dynamicThreshold) {
      similarWords.push({
        word,
        distance,
        rating: wordInfo ? (wordInfo[word] ?? 0) : 0
      })
    }
  })

  return similarWords.sort((a, b) => {
    if (a.distance !== b.distance) {
      return a.distance - b.distance
    }
    return b.rating - a.rating
  })
}
