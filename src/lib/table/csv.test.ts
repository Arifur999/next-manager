import { describe, expect, it } from "vitest"
import { toCsv, toCsvCell } from "./csv"

describe("toCsvCell", () => {
  it("leaves plain values alone and blanks out null", () => {
    expect(toCsvCell("Retainer")).toBe("Retainer")
    expect(toCsvCell(-5)).toBe("-5")
    expect(toCsvCell(true)).toBe("true")
    expect(toCsvCell(null)).toBe("")
    expect(toCsvCell(undefined)).toBe("")
  })

  it("quotes commas, quotes and line breaks", () => {
    expect(toCsvCell("Dhaka, Bangladesh")).toBe('"Dhaka, Bangladesh"')
    expect(toCsvCell('say "hi"')).toBe('"say ""hi"""')
    expect(toCsvCell("two\nlines")).toBe('"two\nlines"')
  })

  it("defuses text a spreadsheet would run as a formula", () => {
    expect(toCsvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)")
    expect(toCsvCell("+1")).toBe("'+1")
    expect(toCsvCell("-2")).toBe("'-2")
    expect(toCsvCell("@SUM(A1)")).toBe("'@SUM(A1)")
  })

  it("writes dates as ISO strings", () => {
    expect(toCsvCell(new Date("2026-10-11T00:00:00.000Z"))).toBe("2026-10-11T00:00:00.000Z")
  })
})

describe("toCsv", () => {
  it("joins the header and rows with CRLF", () => {
    expect(toCsv(["Name", "Amount"], [["Rina", 499], ["Karim, Jr.", 0]])).toBe('Name,Amount\r\nRina,499\r\n"Karim, Jr.",0')
  })
})
