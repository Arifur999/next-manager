import { FEATURES, FEATURES_INTRO, type FeatureId } from "@/data/home/features"
import type { ReactNode } from "react"
import SectionShell from "../Shell/SectionShell"
import DeliveryCrop from "./crops/DeliveryCrop"
import MoneyCrop from "./crops/MoneyCrop"
import PeopleCrop from "./crops/PeopleCrop"
import PipelineCrop from "./crops/PipelineCrop"
import TimeCrop from "./crops/TimeCrop"
import FeatureBlock, { type FeatureLayout } from "./FeatureBlock"

const BLOCKS: Record<FeatureId, { layout: FeatureLayout; crop: ReactNode }> = {
  pipeline: { layout: "wide", crop: <PipelineCrop /> },
  delivery: { layout: "crop-left", crop: <DeliveryCrop /> },
  time: { layout: "stacked", crop: <TimeCrop /> },
  money: { layout: "crop-right", crop: <MoneyCrop /> },
  people: { layout: "stacked", crop: <PeopleCrop /> },
}

const Features = () => (
  <SectionShell labelledBy="features-title" className="border-b">
    <div className="max-w-2xl">
      <h2 id="features-title" className="text-display">
        {FEATURES_INTRO.title}
      </h2>
      <p className="mt-4 text-lg text-muted-foreground">{FEATURES_INTRO.body}</p>
    </div>
    <div className="mt-16 space-y-20 md:space-y-28">
      {FEATURES.map((feature) => (
        <FeatureBlock key={feature.id} feature={feature} {...BLOCKS[feature.id]} />
      ))}
    </div>
  </SectionShell>
)

export default Features
