/**
 * Money formatting.
 *
 * One place, so no screen invents its own. Two rules that matter:
 *
 *   - USD and BDT are never added together anywhere in this app. They are
 *     different things, and combining them needs a rate that would then be
 *     baked invisibly into whatever figure was shown.
 *   - BDT figures that came from a payment are REPORTING values, frozen at the
 *     rate saved with that payment. They are not what the money is worth today,
 *     and labelling them as though they were would be a lie the UI tells.
 */

export const formatUsd = (amount: number, options: { compact?: boolean } = {}) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: options.compact ? "compact" : "standard",
        maximumFractionDigits: options.compact ? 1 : 2,
        minimumFractionDigits: options.compact ? 0 : 2,
    }).format(amount);

export const formatBdt = (amount: number, options: { compact?: boolean } = {}) =>
    new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        notation: options.compact ? "compact" : "standard",
        maximumFractionDigits: options.compact ? 1 : 2,
        minimumFractionDigits: options.compact ? 0 : 2,
    }).format(amount);

export const formatMoney = (
    amount: number,
    currency: "USD" | "BDT",
    options: { compact?: boolean } = {},
) => (currency === "USD" ? formatUsd(amount, options) : formatBdt(amount, options));

/** Rates carry four decimals on the server; showing all four is noise. */
export const formatRate = (rate: number) => rate.toFixed(2);

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;
