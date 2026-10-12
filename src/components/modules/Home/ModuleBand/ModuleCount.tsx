// A number set into the sentence. Plain server text for now; C66 lets it count.
const ModuleCount = ({ value }: { value: number }) => (
  <span className="font-semibold tabular-nums text-foreground">{value}</span>
)

export default ModuleCount
