import { Counter } from "@/components/motion/Counter"

// A number set into the sentence; counts up once on scroll.
const ModuleCount = ({ value }: { value: number }) => <Counter to={value} className="font-semibold text-foreground" />

export default ModuleCount
