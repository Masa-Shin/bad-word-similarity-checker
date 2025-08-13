import { cuss } from 'cuss'

// ratingが0のものは普通の単語も結構含むので一旦除去
// TODO: ratingを選択可能にする
export const badWordInfo = Object.fromEntries(
  Object.entries(cuss).filter(([, rating]) => rating > 0)
)

export const badWordList = Object.keys(badWordInfo)
