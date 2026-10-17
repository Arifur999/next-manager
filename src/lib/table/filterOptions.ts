export interface FilterOption {
  label: string
  value: string
}

// Faceted-filter options from the values the loaded rows hold: each value
// once, blanks dropped, alphabetical.
export const optionsFromValues = (values: Array<string | null | undefined>): FilterOption[] =>
  [...new Set(values.filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }))
