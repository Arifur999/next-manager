"use client"

import CompaniesBoard from "@/components/modules/Platform/CompaniesBoard"
import PlansBoard from "@/components/modules/Platform/PlansBoard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { plansPageTab } from "@/components/modules/Platform/plansPageTab"
import { usePathname, useSearchParams } from "next/navigation"

// The open tab lives in the URL (?tab=assignments), so a link can land on it and Back returns to it.
const PlansTabs = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const tab = plansPageTab(searchParams.get("tab"))

  const selectTab = (next: string) => {
    const params = new URLSearchParams(window.location.search)
    if (next === "assignments") params.set("tab", next)
    else params.delete("tab")
    const query = params.toString()
    window.history.pushState(null, "", query ? `${pathname}?${query}` : pathname)
  }

  return (
    <Tabs value={tab} onValueChange={selectTab}>
      <TabsList>
        <TabsTrigger value="plans">Plans</TabsTrigger>
        <TabsTrigger value="assignments">Who is on what</TabsTrigger>
      </TabsList>

      <TabsContent value="plans" className="mt-4">
        <PlansBoard />
      </TabsContent>

      <TabsContent value="assignments" className="mt-4">
        <CompaniesBoard />
      </TabsContent>
    </Tabs>
  )
}

export default PlansTabs
