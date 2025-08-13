import { useState, useEffect } from 'react'
import { findSimilarWords, SimilarWord } from '../utils/editDistance'
import { badWordList, badWordInfo } from '../data/badWords'

interface BadWordCheckerResult {
  similarWords: SimilarWord[]
  isChecking: boolean
  hasSimilarWords: boolean
}

const DEBOUNCE_DELAY = 250

export const useBadWordChecker = (input: string): BadWordCheckerResult => {
  const [similarWords, setSimilarWords] = useState<SimilarWord[]>([])
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!input.trim()) {
      setSimilarWords([])
      setIsChecking(false)
      return
    }

    setIsChecking(true)
    setSimilarWords([])

    const timeoutId = setTimeout(() => {
      const results = findSimilarWords(input, badWordList, undefined, badWordInfo)
      setSimilarWords(results)
      setIsChecking(false)
    }, DEBOUNCE_DELAY)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [input])

  return {
    similarWords,
    isChecking,
    hasSimilarWords: similarWords.length > 0
  }
}
