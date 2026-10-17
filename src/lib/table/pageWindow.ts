export type PageWindowItem = number | "ellipsis-start" | "ellipsis-end"

/** How far an ellipsis button jumps. */
export const ELLIPSIS_JUMP = 5

const SLOTS = 7

// The page buttons a table shows: always seven slots (first, last, the current
// page and its neighbours, ellipses for the rest), so the buttons never shift
// under the cursor while paging.
export const getPageWindow = (currentPage: number, totalPages: number): PageWindowItem[] => {
  if (totalPages <= SLOTS) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis-start", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages]
}
