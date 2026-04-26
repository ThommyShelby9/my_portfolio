/**
 * Fuzzy Search Utility
 * Implements fuzzy string matching with scoring for command palette
 */

export interface FuzzyMatch {
  matched: boolean
  score: number
  indices: number[]
}

/**
 * Perform fuzzy match on a string with a pattern
 * Returns match result with score and matched character indices
 */
export function fuzzyMatch(str: string, pattern: string): FuzzyMatch {
  if (!pattern) {
    return { matched: true, score: 0, indices: [] }
  }

  const strLower = str.toLowerCase()
  const patternLower = pattern.toLowerCase()

  let score = 0
  let patternIndex = 0
  const indices: number[] = []

  // Try to find each pattern character in the string
  for (let i = 0; i < strLower.length; i++) {
    if (strLower[i] === patternLower[patternIndex]) {
      score += 1

      // Bonus for consecutive matches
      if (indices.length > 0 && indices[indices.length - 1] === i - 1) {
        score += 5
      }

      // Bonus for word start matches
      if (i === 0 || strLower[i - 1] === ' ' || strLower[i - 1] === '-' || strLower[i - 1] === '_') {
        score += 10
      }

      indices.push(i)
      patternIndex++

      // All pattern characters found
      if (patternIndex === pattern.length) {
        break
      }
    }
  }

  const matched = patternIndex === pattern.length

  // Penalize for longer strings (prefer shorter matches)
  if (matched) {
    score -= str.length * 0.1
  }

  return { matched, score, indices }
}

/**
 * Filter and sort items by fuzzy match score
 */
export function fuzzyFilter<T extends { name: string }>(
  items: T[],
  query: string
): T[] {
  if (!query) {
    return items
  }

  return items
    .map(item => ({
      item,
      match: fuzzyMatch(item.name, query)
    }))
    .filter(({ match }) => match.matched)
    .sort((a, b) => b.match.score - a.match.score)
    .map(({ item }) => item)
}

/**
 * Highlight matched characters in a string
 * Returns HTML string with matched characters wrapped in <mark> tags
 */
export function highlightMatches(str: string, pattern: string): string {
  if (!pattern) {
    return str
  }

  const match = fuzzyMatch(str, pattern)
  if (!match.matched) {
    return str
  }

  let result = ''
  let lastIndex = 0

  match.indices.forEach(index => {
    // Add non-matched characters
    result += str.substring(lastIndex, index)
    // Add matched character with highlight
    result += `<mark class="highlight">${str[index]}</mark>`
    lastIndex = index + 1
  })

  // Add remaining characters
  result += str.substring(lastIndex)

  return result
}
