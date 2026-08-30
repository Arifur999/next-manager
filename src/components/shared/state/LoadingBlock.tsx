/**
 * The placeholder a panel shows while its first fetch is in flight.
 *
 * Written out in forty-three places with four different heights and two
 * different tints. A skeleton is a promise about what is coming, so the same
 * promise should look the same everywhere.
 *
 * `rounded` is off inside a Card, whose own border already provides the shape,
 * and on when the block stands alone.
 */
const LoadingBlock = ({
  height = "h-40",
  rounded = false,
}: {
  height?: string
  rounded?: boolean
}) => (
  <div
    className={`animate-pulse bg-muted/40 ${height} ${rounded ? "rounded-xl" : ""}`}
    // Announced rather than silent: a screen reader otherwise reaches an empty
    // region and is told nothing is happening.
    role="status"
    aria-label="Loading"
  />
)

export default LoadingBlock
