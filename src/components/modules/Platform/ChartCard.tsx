"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, Table2, TrendingUp } from "lucide-react"
import { useState } from "react"

/** A chart and its table view, so neither has to be built twice. */
const ChartCard = ({
  title,
  note,
  empty,
  columns,
  rows,
  children,
}: {
  title: string
  note: string
  empty?: string
  columns: string[]
  rows: Array<{ key: string; cells: string[] }>
  children: React.ReactNode
}) => {
  const [asTable, setAsTable] = useState(false)

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{note}</p>
        </div>

        {rows.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAsTable((shown) => !shown)}
            aria-pressed={asTable}
          >
            {asTable ? <TrendingUp className="size-4" /> : <Table2 className="size-4" />}
            {asTable ? "Chart" : "Table"}
          </Button>
        )}
      </CardHeader>

      {rows.length === 0 ? (
        <p className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
          <CalendarClock className="size-7" aria-hidden="true" />
          {empty ?? "Nothing to show yet."}
        </p>
      ) : asTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                {columns.map((column, index) => (
                  <th
                    key={column}
                    className={`px-5 py-2.5 font-medium ${index > 0 ? "text-right" : ""}`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.key}>
                  {row.cells.map((cell, index) => (
                    <td
                      key={index}
                      className={`px-5 py-2.5 ${index > 0 ? "text-right tabular-nums" : ""}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-64 p-4">{children}</div>
      )}
    </Card>
  )
}

export default ChartCard
