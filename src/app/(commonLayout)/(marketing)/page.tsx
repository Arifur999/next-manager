import Hero from "@/components/modules/Home/Hero/Hero"
import LedgerTrace from "@/components/modules/Home/LedgerTrace/LedgerTrace"

// Composes the landing sections in page order. Copy lives in src/data/home.
const HomePage = () => (
  <>
    <Hero trialDays={null} />
    <LedgerTrace />
  </>
)

export default HomePage
