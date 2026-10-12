import type { IFeature } from "@/data/home/features"
import { cn } from "@/lib/utils"
import { FadeIn } from "@/components/motion/FadeIn"
import type { ReactNode } from "react"

export type FeatureLayout = "wide" | "crop-left" | "crop-right" | "stacked"

interface IFeatureBlockProps {
  feature: IFeature
  layout: FeatureLayout
  crop: ReactNode
}

const Copy = ({ feature, className }: { feature: IFeature; className?: string }) => (
  <div className={cn("min-w-0", className)}>
    <p className="text-sm font-medium text-primary-strong">{feature.area}</p>
    <h3 className="mt-2 text-heading">{feature.benefit}</h3>
    <p className="mt-4 max-w-[60ch] text-base text-muted-foreground">{feature.body}</p>
  </div>
)

// The layouts differ on purpose, so five blocks do not read as one template
// repeated five times.
const FeatureBlock = ({ feature, layout, crop: rawCrop }: IFeatureBlockProps) => {
  const crop = <FadeIn>{rawCrop}</FadeIn>

  if (layout === "wide") {
    return (
      <article className="grid gap-8 lg:grid-cols-12">
        <Copy feature={feature} className="lg:col-span-7" />
        <div className="min-w-0 lg:col-span-12">{crop}</div>
      </article>
    )
  }

  if (layout === "stacked") {
    return (
      <article className="grid gap-8 border-t pt-12 lg:grid-cols-12">
        <Copy feature={feature} className="lg:col-span-4" />
        <div className="min-w-0 lg:col-span-7 lg:col-start-6">{crop}</div>
      </article>
    )
  }

  const cropFirst = layout === "crop-left"
  return (
    <article className="grid items-center gap-8 lg:grid-cols-12">
      <div className={cn("min-w-0 lg:col-span-8", cropFirst ? "lg:order-1" : "lg:order-2")}>{crop}</div>
      <Copy feature={feature} className={cn("lg:col-span-4", cropFirst ? "lg:order-2" : "lg:order-1")} />
    </article>
  )
}

export default FeatureBlock
