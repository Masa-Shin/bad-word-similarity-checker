export const maskWord = (word: string): string => {
  if (word.length <= 1) {
    return word
  }
  
  if (word.length === 2) {
    return `${word[0]}*`
  }
  
  const firstChar = word[0]
  const lastChar = word[word.length - 1]
  const middleLength = word.length - 2
  const maskedMiddle = '*'.repeat(middleLength)
  
  return `${firstChar}${maskedMiddle}${lastChar}`
}