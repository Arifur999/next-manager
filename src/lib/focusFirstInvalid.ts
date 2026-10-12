// After a failed submit, move focus to the first field the form marked invalid,
// so keyboard and screen reader users land on what needs fixing. Runs on the
// next frame because the error state renders after the submit handler returns.
export const focusFirstInvalid = (form: HTMLFormElement | null) => {
  requestAnimationFrame(() => {
    form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  })
}
