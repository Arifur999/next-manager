import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQ_ITEMS, FAQ_TITLE } from "@/data/home/faq"
import SectionShell from "../Shell/SectionShell"

// forceMount keeps every answer in the server HTML. Closed answers are hidden
// only when scripts run, so with JavaScript off every answer is readable.
const Faq = () => (
  <SectionShell id="faq" labelledBy="faq-title" className="border-b">
    <div className="grid gap-10 lg:grid-cols-12">
      <h2 id="faq-title" className="text-display lg:col-span-4">
        {FAQ_TITLE}
      </h2>
      <Accordion
        type="multiple"
        className="border-t lg:col-span-7 lg:col-start-6 [@media(scripting:enabled)]:[&_[data-slot=accordion-content][data-state=closed]]:hidden"
      >
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger className="py-5 text-base hover:no-underline focus-visible:ring-2 focus-visible:ring-ring">{item.question}</AccordionTrigger>
            <AccordionContent forceMount className="max-w-[62ch] pb-5 text-base text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </SectionShell>
)

export default Faq
