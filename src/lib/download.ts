// Browser only: saves in-memory content as a file through a temporary object URL.
const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  // Revoked a tick later: revoking at once can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

// The byte order mark makes Excel open the file as UTF-8, so Bangla text survives.
export const downloadCsv = (csv: string, fileName: string) =>
  downloadBlob(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }), `${fileName}.csv`)
