import { site } from "@/data/site"

// The name the server ships with (its database default), from before the product
// was renamed. A saved name equal to it was never chosen, so the form offers the site's name.
const SERVER_DEFAULT_PRODUCT_NAME = "AGENCIO"

export const isUnchosenProductName = (saved: string) => saved.trim() === "" || saved === SERVER_DEFAULT_PRODUCT_NAME

export const initialProductName = (saved: string) => (isUnchosenProductName(saved) ? site.name : saved)

/** One real subject line the server sends, so the name is judged where it is read. */
export const subjectPreview = (productName: string) => `Reset your ${productName.trim() || site.name} password`
