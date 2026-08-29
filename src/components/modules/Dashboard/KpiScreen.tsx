"use client"

import DeliveryDashboard from "@/components/modules/Dashboard/DeliveryDashboard"
import MyDashboard from "@/components/modules/Dashboard/MyDashboard"
import SalesDashboard from "@/components/modules/Dashboard/SalesDashboard"
import { KpiRangePicker, useKpiRange } from "@/components/shared/kpi/KpiRange"

/**
 * The range picker and the dashboard under it, as one client boundary.
 *
 * The range is state, and every KPI on the screen has to be computed over the
 * same one — so it is owned here and passed down, rather than each dashboard
 * keeping its own and the tiles quietly disagreeing about which window they
 * are describing.
 */

const SCREENS = {
  sales: SalesDashboard,
  delivery: DeliveryDashboard,
  me: MyDashboard,
} as const

const KpiScreen = ({ scope }: { scope: keyof typeof SCREENS }) => {
  const { preset, setPreset, query, from, to } = useKpiRange()
  const Dashboard = SCREENS[scope]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground tabular-nums">
          {from} → {to}
        </p>
        <KpiRangePicker preset={preset} onChange={setPreset} />
      </div>

      <Dashboard range={query} />
    </div>
  )
}

export default KpiScreen
