"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface HabitDetailsProps {
  habit: any
}

export function HabitDetails({ habit }: HabitDetailsProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            {habit.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold">{habit.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-xs", getCategoryColor(habit.category))}>
                {habit.category}
              </Badge>
              {habit.priority && (
                <Badge variant="outline" className={cn("text-xs", getPriorityColor(habit.priority))}>
                  {habit.priority} priority
                </Badge>
              )}
            </div>
          </div>
        </div>
        {habit.description && <p className="mt-2 text-muted-foreground">{habit.description}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm font-medium">Frequency</p>
          <p className="text-sm text-muted-foreground">
            {habit.frequency?.type.charAt(0).toUpperCase() + habit.frequency?.type.slice(1)}
            {habit.frequency?.times > 1 && ` (${habit.frequency.times}x)`}
            {habit.frequency?.days && habit.frequency.days.length > 0 && (
              <span> on {habit.frequency.days.join(", ")}</span>
            )}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Target</p>
          <p className="text-sm text-muted-foreground">
            {habit.target?.type === "boolean" ? "Completion" : `${habit.target?.value} ${habit.target?.unit}`}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Start Date</p>
          <p className="text-sm text-muted-foreground">{formatDate(habit.startDate)}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">End Date</p>
          <p className="text-sm text-muted-foreground">{habit.endDate ? formatDate(habit.endDate) : "No end date"}</p>
        </div>

        {habit.reminderEnabled && (
          <>
            <div className="space-y-1">
              <p className="text-sm font-medium">Reminder</p>
              <p className="text-sm text-muted-foreground">
                {habit.reminderTime ? `Daily at ${habit.reminderTime}` : "Enabled"}
              </p>
            </div>
          </>
        )}

        {habit.tags && habit.tags.length > 0 && (
          <div className="space-y-1 md:col-span-2">
            <p className="text-sm font-medium">Tags</p>
            <div className="flex flex-wrap gap-1">
              {habit.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium">Statistics</p>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Current Streak</p>
            <p className="text-lg font-bold">{habit.streak || 0} days</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Best Streak</p>
            <p className="text-lg font-bold">{habit.bestStreak || 0} days</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-lg font-bold">{habit.completionRate || 0}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
