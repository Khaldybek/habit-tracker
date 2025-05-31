"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface StreakChartProps {
  streaks?: any[]
}

export function StreakChart({ streaks = [] }: StreakChartProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const processStreakData = () => {
      if (streaks.length > 0) {
        const chartData = streaks.map((streak) => ({
          habit: streak.title.length > 15 ? streak.title.substring(0, 15) + "..." : streak.title,
          fullTitle: streak.title,
          currentStreak: streak.currentStreak || 0,
          habitId: streak.habitId,
        }))
        setData(chartData)
      } else {
        // Mock data for demonstration
        setData([
          { habit: "Morning Exercise", currentStreak: 7, fullTitle: "Morning Exercise" },
          { habit: "Read Books", currentStreak: 12, fullTitle: "Read Books" },
          { habit: "Meditation", currentStreak: 5, fullTitle: "Meditation" },
          { habit: "Drink Water", currentStreak: 3, fullTitle: "Drink Water" },
        ])
      }
      setIsLoading(false)
    }

    processStreakData()
  }, [streaks])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-muted-foreground">No streak data available</p>
        <p className="text-sm text-muted-foreground mt-1">Start completing habits to build streaks</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="habit"
          className="text-muted-foreground"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis className="text-muted-foreground" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
          }}
          formatter={(value, name, props) => [`${value} days`, "Current Streak"]}
          labelFormatter={(label, payload) => {
            const item = payload?.[0]?.payload
            return item?.fullTitle || label
          }}
        />
        <Legend />
        <Bar dataKey="currentStreak" fill="hsl(var(--primary))" name="Current Streak (days)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
