"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface CategoryBreakdownProps {
  categories: Record<string, any>
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health":
        return "🏥"
      case "fitness":
        return "💪"
      case "learning":
        return "📚"
      case "productivity":
        return "⚡"
      case "mindfulness":
        return "🧘"
      default:
        return "📝"
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

  if (Object.keys(categories).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground">No category data available</p>
        <p className="text-sm text-muted-foreground mt-1">Start creating habits to see category breakdown</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(categories).map(([category, data]: [string, any]) => {
        const completionRate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <span className="capitalize">{category}</span>
                <Badge variant="outline" className={getCategoryColor(category)}>
                  {data.habits?.length || 0} habits
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="text-lg font-bold">{data.completed || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{data.total || 0}</p>
                </div>
              </div>

              {data.habits && data.habits.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Habits in this category:</p>
                  <div className="space-y-1">
                    {data.habits.map((habit: any) => (
                      <div key={habit.id} className="text-xs text-muted-foreground">
                        • {habit.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
