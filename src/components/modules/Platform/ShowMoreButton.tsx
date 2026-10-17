import { Button } from "@/components/ui/button"

// Under a list cut to a page: how many are left, and the way to see them.
const ShowMoreButton = ({ remaining, onClick }: { remaining: number; onClick: () => void }) => {
  if (remaining === 0) return null

  return (
    <div className="border-t px-5 py-3 text-center">
      <Button type="button" variant="outline" size="sm" onClick={onClick}>
        Show more ({remaining} left)
      </Button>
    </div>
  )
}

export default ShowMoreButton
