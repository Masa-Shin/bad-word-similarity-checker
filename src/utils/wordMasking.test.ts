import { describe, it, expect } from 'vitest'
import { maskWord } from './wordMasking'

describe('maskWord', () => {
  it('1文字の単語はマスクしない', () => {
    expect(maskWord('a')).toBe('a')
    expect(maskWord('x')).toBe('x')
  })

  it('2文字の単語は最後の文字のみマスク', () => {
    expect(maskWord('ab')).toBe('a*')
    expect(maskWord('xy')).toBe('x*')
    expect(maskWord('12')).toBe('1*')
  })

  it('3文字の単語は中間をマスク', () => {
    expect(maskWord('abc')).toBe('a*c')
    expect(maskWord('dog')).toBe('d*g')
  })

  it('4文字以上の単語は最初と最後以外をマスク', () => {
    expect(maskWord('hello')).toBe('h***o')
    expect(maskWord('world')).toBe('w***d')
    expect(maskWord('testing')).toBe('t*****g')
  })

  it('空文字列を処理できる', () => {
    expect(maskWord('')).toBe('')
  })

  it('特殊文字を含む単語も正しくマスク', () => {
    expect(maskWord('a@b')).toBe('a*b')
    expect(maskWord('!#$%')).toBe('!**%')
  })

  it('日本語文字も正しくマスク', () => {
    expect(maskWord('あい')).toBe('あ*')
    expect(maskWord('こんにちは')).toBe('こ***は')
  })
})