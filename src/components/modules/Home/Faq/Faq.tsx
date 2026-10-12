import { FAQ_ITEMS, FAQ_TITLE } from "@/data/home/faq"
import SectionShell from "../Shell/SectionShell"
import FaqList from "./FaqList"

const Faq = () => (
  <SectionShell id="faq" labelledBy="faq-title" className="border-b">
    <div className="grid gap-10 lg:grid-cols-12">
      <h2 id="faq-title" className="text-display lg:col-span-4">
        {FAQ_TITLE}
      </h2>
      <FaqList items={FAQ_ITEMS} />
    </div>
  </SectionShell>
)

export default Faq
