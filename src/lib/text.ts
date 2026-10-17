// "1 deal", "2 deals". Irregular words pass their plural: plural(3, "person", "people").
export const plural = (count: number, one: string, many = `${one}s`): string =>
  `${count.toLocaleString("en-US")} ${count === 1 ? one : many}`

const isTitleCaseWord = (word: string) => /^[A-Z][a-z]+$/.test(word)

// All capitals with a real word in it is shouting; "QA" alone is an acronym.
const isShouted = (value: string) => value === value.toUpperCase() && /[A-Z]{4,}/.test(value)

/**
 * "IN_REVIEW", "On Hold" and "in review" all read as "In review".
 *
 * Status names are typed by each agency, so an acronym ("In QA") is kept as
 * written and only words that are merely capitalised are lowered.
 */
export const sentenceCase = (value: string): string => {
  const spaced = value.replace(/_/g, " ").trim()
  const words = (isShouted(spaced) ? spaced.toLowerCase() : spaced).split(/\s+/)

  return words
    .map((word, index) => {
      if (index > 0) return isTitleCaseWord(word) ? word.toLowerCase() : word
      return word === word.toLowerCase() ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word
    })
    .join(" ")
}
