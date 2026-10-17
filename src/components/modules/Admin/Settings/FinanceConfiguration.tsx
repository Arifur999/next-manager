"use client"

import ExchangeRateSettings from "@/components/modules/Admin/Settings/ExchangeRateSettings"
import ExpenseCategorySettings from "@/components/modules/Admin/Settings/ExpenseCategorySettings"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * The two settings that change what every money figure means.
 *
 * They were separate tabs, which hid the fact that they answer the same
 * question — how this agency counts money. The rate decides what a dollar is
 * worth in the reports; the categories decide what a cost is counted as.
 */
const FinanceConfiguration = () => (
  <div className="space-y-6">
    <ExchangeRateSettings />

    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b px-5 py-4">
        <CardTitle className="text-base">Expense categories</CardTitle>
        <p className="text-sm text-muted-foreground">
          What a cost gets counted as, and therefore which report it lands in.
        </p>
      </CardHeader>
      <ExpenseCategorySettings />
    </Card>
  </div>
)

export default FinanceConfiguration
