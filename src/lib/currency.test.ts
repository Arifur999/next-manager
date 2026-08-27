import { describe, expect, it } from "vitest";
import { formatBdt, formatMoney, formatPercent, formatRate, formatUsd } from "./currency";

describe("currency formatting", () => {
  it("formats USD with two decimals", () => {
    expect(formatUsd(1234.5)).toContain("1,234.50");
  });

  it("formats BDT with two decimals", () => {
    expect(formatBdt(34810)).toContain("34,810.00");
  });

  it("routes through formatMoney by currency", () => {
    expect(formatMoney(100, "USD")).toEqual(formatUsd(100));
    expect(formatMoney(100, "BDT")).toEqual(formatBdt(100));
  });

  it("compacts large figures", () => {
    expect(formatUsd(1_500_000, { compact: true })).toMatch(/1\.5M/);
  });

  it("trims a four-decimal rate to two", () => {
    expect(formatRate(122.8301)).toBe("122.83");
  });

  it("shows one decimal on a percentage", () => {
    expect(formatPercent(42.567)).toBe("42.6%");
  });

  it("keeps a negative amount negative", () => {
    // A DP balance can legitimately be negative - it must not be shown as
    // though the agency were owed money it owes.
    expect(formatBdt(-500)).toMatch(/-|\(/);
  });
});
