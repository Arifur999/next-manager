import { CircleAlert } from "lucide-react"

// The server's refusal, shown beside the button that caused it rather than in a
// toast in the far corner of the screen.
const FormErrorAlert = ({ message }: { message: string | null }) => {
  if (!message) return null

  return (
    <div
      role="alert"
      className="flex gap-2.5 rounded-md border border-destructive/30 bg-destructive-subtle px-3 py-2.5 text-sm text-destructive-subtle-foreground"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

export default FormErrorAlert
