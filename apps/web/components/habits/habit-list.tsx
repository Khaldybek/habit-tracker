"use client"

import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Edit, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitListProps {
  habits: any[]
  showActions?: boolean
}

export function HabitList({ habits, showActions = false }: HabitListProps) {
  const [localHabits, setLocalHabits] = useState(habits)
  const { toast } = useToast()

  const toggleHabitCompletion = async (habitId: string) => {
    try {
      const token = localStorage.getItem("token")
      const habit = localHabits.find((h) => h._id === habitId)

      if (!habit) return

      // Create a check-in for today
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          habitId,
          date: today,
          status: !habit.completedToday,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update habit status")
      }

      // Update local state
      setLocalHabits((prev) => prev.map((h) => (h._id === habitId ? { ...h, completedToday: !h.completedToday } : h)))

      toast({
        title: habit.completedToday ? "Habit marked as incomplete" : "Habit completed",
        description: habit.completedToday ? "Keep working on it!" : "Great job! Keep up the good work!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update habit status",
      })
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "fitness":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "learning":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "productivity":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "mindfulness":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-4">
      {localHabits.map((habit) => (
        <Card
          key={habit._id}
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            habit.completedToday && "ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-950/20",
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${habit.color}20` }}
                >
                  {habit.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{habit.title}</h3>
                    <Badge variant="outline" className={cn("text-xs", getCategoryColor(habit.category))}>
                      {habit.category}
                    </Badge>
                  </div>
                  {habit.description && <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>}

                  {habit.frequency && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>
                        {habit.frequency.type.charAt(0).toUpperCase() + habit.frequency.type.slice(1)}
                        {habit.frequency.times > 1 && ` (${habit.frequency.times}x)`}
                      </span>
                      {habit.target && (
                        <>
                          <span>•</span>
                          <span>
                            {habit.target.value} {habit.target.unit}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {habit.streak > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="font-medium">Current streak:</span> {habit.streak} days
                    </div>
                  )}

                  {habit.frequency && habit.frequency.times > 1 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>
                          {habit.completedCount || 0}/{habit.frequency.times}
                        </span>
                      </div>
                      <Progress value={((habit.completedCount || 0) / habit.frequency.times) * 100} className="h-1" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleHabitCompletion(habit._id)}
                  className={cn("h-8 w-8 p-0", habit.completedToday && "text-green-600 hover:text-green-700")}
                >
                  {habit.completedToday ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </Button>

                {showActions && (
                  <Link href={`/habits/${habit._id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {showActions && (
                  <Link href={`/habits/${habit._id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {localHabits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">No habits found</p>
        </div>
      )}
    </div>
  )
}
