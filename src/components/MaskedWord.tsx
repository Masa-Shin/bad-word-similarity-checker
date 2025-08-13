import { useState, MouseEvent, KeyboardEvent } from 'react'
import { maskWord } from '../utils/wordMasking'

interface MaskedWordProps {
  word: string
  distance: number
  rating: number
}

const RATING_CONFIG: Record<number, { text: string; className: string }> = {
  2: { text: '高', className: 'rating-high' },
  1: { text: '中', className: 'rating-middle' },
  0: { text: '低', className: 'rating-default' }
}

export const MaskedWord = ({ word, distance, rating }: MaskedWordProps): React.JSX.Element => {
  const [isRevealed, setIsRevealed] = useState(false)
  
  const displayWord = isRevealed ? word : maskWord(word)
  const ratingConfig: { text: string; className: string } = RATING_CONFIG[rating] ?? { 
    text: rating.toString(), 
    className: 'rating-default' 
  }
  
  const handleClick = (): void => {
    setIsRevealed(prev => !prev)
  }
  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleClick()
    }
  }
  
  const handleGoogleSearch = (e: MouseEvent): void => {
    e.stopPropagation()
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(`${word} meaning`)}`, 
      '_blank', 
      'noopener,noreferrer'
    )
  }
  
  return (
    <tr className="similar-word-item">
      <td className="word-cell">
        <span 
          className="word masked-word"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`クリックして "${word}" を表示`}
          aria-pressed={!isRevealed}
          style={{ cursor: 'pointer' }}
        >
          {displayWord}
        </span>
        <button 
          className="google-search-btn"
          onClick={handleGoogleSearch}
          title={`"${word} meaning"をGoogle検索`}
        >
          🔍
        </button>
      </td>
      <td className="distance">{distance}</td>
      <td className={`rating ${ratingConfig.className}`}>
        {ratingConfig.text}
      </td>
    </tr>
  )
}
