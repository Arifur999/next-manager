import Hero from "@/components/modules/Home/Hero/Hero"
import LedgerTrace from "@/components/modules/Home/LedgerTrace/LedgerTrace"
import ModuleBand from "@/components/modules/Home/ModuleBand/ModuleBand"
import Problem from "@/components/modules/Home/Problem/Problem"

// Composes the landing sections in page order. Copy lives in src/data/home.
const HomePage = () => (
  <>
    <Hero trialDays={null} />
    <LedgerTrace />
    <Problem />
    <ModuleBand />
  </>
)

export default HomePage
