import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MaskedWord } from './MaskedWord'

const mockOpen = vi.fn()
window.open = mockOpen

describe('MaskedWord', () => {
  beforeEach(() => {
    mockOpen.mockClear()
  })

  it('1文字の単語は常に表示される', () => {
    render(
      <table>
        <tbody>
          <MaskedWord word="a" distance={1} rating={0} />
        </tbody>
      </table>
    )
    
    expect(screen.getByText('a')).toBeInTheDocument()
  })

  it('2文字の単語は初期状態でマスクされる', () => {
    render(
      <table>
        <tbody>
          <MaskedWord word="ab" distance={1} rating={0} />
        </tbody>
      </table>
    )
    
    expect(screen.getByText('a*')).toBeInTheDocument()
    expect(screen.queryByText('ab')).not.toBeInTheDocument()
  })

  it('3文字以上の単語は中間がマスクされる', () => {
    render(
      <table>
        <tbody>
          <MaskedWord word="hello" distance={2} rating={1} />
        </tbody>
      </table>
    )
    
    expect(screen.getByText('h***o')).toBeInTheDocument()
  })

  it('マスクされた単語をクリックすると表示される', () => {
    render(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={0} />
        </tbody>
      </table>
    )
    
    const maskedWord = screen.getByText('t**t')
    expect(maskedWord).toBeInTheDocument()
    
    fireEvent.click(maskedWord)
    
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.queryByText('t**t')).not.toBeInTheDocument()
  })

  it('編集距離が正しく表示される', () => {
    render(
      <table>
        <tbody>
          <MaskedWord word="test" distance={3} rating={0} />
        </tbody>
      </table>
    )
    
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('レーティングが正しく表示される', () => {
    const { rerender } = render(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={2} />
        </tbody>
      </table>
    )
    
    expect(screen.getByText('高')).toBeInTheDocument()
    
    rerender(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={1} />
        </tbody>
      </table>
    )
    
    expect(screen.getByText('中')).toBeInTheDocument()
    
    rerender(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={0} />
        </tbody>
      </table>
    )
    
    expect(screen.getByText('低')).toBeInTheDocument()
  })

  it('Google検索ボタンが機能する', () => {
    render(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={0} />
        </tbody>
      </table>
    )
    
    const searchButton = screen.getByTitle(/Google検索/)
    fireEvent.click(searchButton)
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('google.com/search'),
      '_blank',
      'noopener,noreferrer'
    )
    
    const callArgs = mockOpen.mock.calls[0]
    expect(callArgs?.[0]).toContain('test%20meaning')
  })

  it('レーティングに応じて適切なCSSクラスが適用される', () => {
    const { container, rerender } = render(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={2} />
        </tbody>
      </table>
    )
    
    expect(container.querySelector('.rating-high')).toBeInTheDocument()
    
    rerender(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={1} />
        </tbody>
      </table>
    )
    
    expect(container.querySelector('.rating-middle')).toBeInTheDocument()
    
    rerender(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={0} />
        </tbody>
      </table>
    )
    
    expect(container.querySelector('.rating-default')).toBeInTheDocument()
  })

  it('キーボードでマスクされた単語を操作できる', () => {
    render(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={0} />
        </tbody>
      </table>
    )
    
    const maskedWord = screen.getByText('t**t')
    
    // Enterキーで単語を表示
    fireEvent.keyDown(maskedWord, { key: 'Enter' })
    expect(screen.getByText('test')).toBeInTheDocument()
    
    // スペースキーで単語を再度マスク
    const revealedWord = screen.getByText('test')
    fireEvent.keyDown(revealedWord, { key: ' ' })
    expect(screen.getByText('t**t')).toBeInTheDocument()
  })

  it('マスクされた単語に適切なARIA属性が設定される', () => {
    render(
      <table>
        <tbody>
          <MaskedWord word="test" distance={1} rating={0} />
        </tbody>
      </table>
    )
    
    const maskedWord = screen.getByText('t**t')
    
    // ARIA属性の確認
    expect(maskedWord).toHaveAttribute('role', 'button')
    expect(maskedWord).toHaveAttribute('tabindex', '0')
    expect(maskedWord).toHaveAttribute('aria-label', 'クリックして "test" を表示')
    expect(maskedWord).toHaveAttribute('aria-pressed', 'true') // マスクされている状態
  })
})
