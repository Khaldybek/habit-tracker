"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitCalendarProps {
  habit: any
  checkins: any[]
}

export function HabitCalendar({ habit, checkins }: HabitCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Create a map of dates to check-in status
  const checkinMap = checkins.reduce((acc: Record<string, any>, checkin) => {
    const date = checkin.date.split("T")[0]
    acc[date] = checkin
    return acc
  }, {})

  const isDateCheckedIn = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return checkinMap[dateString]?.status || false
  }

  const handleToggleDate = async () => {
    if (!selectedDate) return

    const dateString = selectedDate.toISOString().split("T")[0]
    const isCheckedIn = isDateCheckedIn(selectedDate)

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const existingCheckin = checkinMap[dateString]

      if (existingCheckin) {
        // Update existing check-in
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkins/${existingCheckin._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: !isCheckedIn,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update check-in")
        }

        // Update local state
        checkinMap[dateString].status = !isCheckedIn
      } else {
        // Create new check-in
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkins`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            habitId: habit._id, // Updated to use _id
            date: dateString,
            status: true,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create check-in")
        }

        const data = await response.json()
        checkinMap[dateString] = data.data.checkIn // Updated to match API response structure
      }

      toast({
        title: isCheckedIn ? "Check-in removed" : "Check-in added",
        description: `${habit.title} marked as ${isCheckedIn ? "incomplete" : "complete"} for ${selectedDate.toLocaleDateString()}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update check-in",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
        modifiers={{
          completed: (date) => isDateCheckedIn(date),
        }}
        modifiersClassNames={{
          completed: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-50",
        }}
        components={{
          DayContent: ({ day }) => (
            <div className="flex h-full w-full items-center justify-center">
              {day.date.getDate()}
              {isDateCheckedIn(day.date) && (
                <div className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-green-500" />
              )}
            </div>
          ),
        }}
      />

      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isDateCheckedIn(selectedDate) ? "Completed" : "Not completed"}
                </p>
              </div>
              <Button
                onClick={handleToggleDate}
                disabled={isSubmitting}
                variant={isDateCheckedIn(selectedDate) ? "outline" : "default"}
                className={cn("gap-2", isDateCheckedIn(selectedDate) && "text-green-600 hover:text-green-700")}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isDateCheckedIn(selectedDate) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                {isDateCheckedIn(selectedDate) ? "Mark as incomplete" : "Mark as complete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
