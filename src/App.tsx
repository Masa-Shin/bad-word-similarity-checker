import { useState, ChangeEvent } from 'react'
import { useBadWordChecker } from './hooks/useBadWordChecker'
import { MaskedWord } from './components/MaskedWord'
import './App.css'

const App = (): React.JSX.Element => {
  const [brandName, setBrandName] = useState('')
  const { similarWords, isChecking, hasSimilarWords } = useBadWordChecker(brandName)
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setBrandName(e.target.value)
  }

  return (
    <>
      <h1>ブランド名チェッカー</h1>
      <div className="card">
        <input
          type="text"
          value={brandName}
          onChange={handleInputChange}
          placeholder="ブランド名を入力してください"
          className="brand-input"
          autoFocus
        />
        
        {isChecking && (
          <div className="checking">チェック中...</div>
        )}
        
        {hasSimilarWords && (
          <div className="results">
            <h3>似ているかもしれない不適切語が見つかりました</h3>
            <table className="similar-words-table">
              <thead>
                <tr>
                  <th>単語</th>
                  <th>編集距離</th>
                  <th>ヤバそうさ</th>
                </tr>
              </thead>
              <tbody>
                {similarWords.map((item) => (
                  <MaskedWord 
                    key={item.word} 
                    word={item.word} 
                    distance={item.distance}
                    rating={item.rating}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {brandName !== '' && !isChecking && !hasSimilarWords && (
          <div className="safe">✅ 似ている不適切語は見つかりませんでした</div>
        )}
      </div>
    </>
  )
}

export default App
