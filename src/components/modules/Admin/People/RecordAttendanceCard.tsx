"use client"

import { recordAttendanceAction } from "@/app/(dashboardLayout)/dashboard/attendance/_action"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllUsers } from "@/services/user.services"
import type { IUser } from "@/types/user.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

/**
 * Writing down somebody else's day.
 *
 * Somebody forgets to clock in, or was on a client's site all morning. The row
 * this writes is marked `admin` rather than `self`, and the board labels it
 * "recorded for them" — "they clocked in" and "somebody wrote it down" are
 * different claims, and a record that blurred them would be worth less than no
 * record.
 *
 * Both times are optional on purpose. Absent is "not recorded", which has to
 * stay different from midnight, and a morning somebody arrived with no leaving
 * time yet is a real half-answer.
 */
const RecordAttendanceCard = () => {
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")

  const { data } = useQuery({ queryKey: ["users"], queryFn: () => getAllUsers() })
  const members = ((data?.data ?? []) as IUser[]).filter((member) => member.status === "active")

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      recordAttendanceAction({
        user_id: userId,
        date,
        // Empty is "not recorded", so it is left out rather than sent as "".
        ...(checkIn ? { check_in: checkIn } : {}),
        ...(checkOut ? { check_out: checkOut } : {}),
      }),
    onSuccess: (result) => {
      if (!result.success) {
        // "Check-out has to be after check-in" arrives here.
        toast.error(result.message || "Could not record it")
        return
      }
      toast.success("Recorded")
      setCheckIn("")
      setCheckOut("")
      void queryClient.invalidateQueries({ queryKey: ["attendance"] })
    },
  })

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Record it for somebody</CardTitle>
        <p className="text-sm text-muted-foreground">
          For the morning somebody forgot, or was at a client&apos;s. It is filed as
          recorded by you, not as them clocking in.
        </p>
      </CardHeader>

      <form
        className="space-y-4 px-6 pb-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (!userId || !date) return
          save()
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="attendance-user">Who</Label>
          <Select value={userId} onValueChange={setUserId} disabled={isPending}>
            <SelectTrigger id="attendance-user" className="w-full">
              <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="attendance-date">Day</Label>
          <Input
            id="attendance-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="attendance-in">In</Label>
            <Input
              id="attendance-in"
              type="time"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="attendance-out">Out</Label>
            <Input
              id="attendance-out"
              type="time"
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Leave a time empty for one that is genuinely not known — blank stays &ldquo;not
          recorded&rdquo; rather than becoming midnight.
        </p>

        <Button type="submit" disabled={isPending || !userId || !date} className="w-full">
          Record
        </Button>
      </form>
    </Card>
  )
}

export default RecordAttendanceCard
