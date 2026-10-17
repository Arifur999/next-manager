// Browser only: saves in-memory content as a file through a temporary object URL.
const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

// The byte order mark makes Excel open the file as UTF-8, so Bangla text survives.
export const downloadCsv = (csv: string, fileName: string) =>
  downloadBlob(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }), `${fileName}.csv`)
