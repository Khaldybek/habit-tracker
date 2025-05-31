"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export function HeatMap() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data for heatmap - replace with actual API call when available
        const mockData = generateMockHeatmapData()
        setData(mockData)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load heatmap data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const generateMockHeatmapData = () => {
    const data = []
    const today = new Date()
    const startDate = new Date(today.getFullYear(), 0, 1) // Start of year

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      data.push({
        date: new Date(d).toISOString().split("T")[0],
        count: Math.floor(Math.random() * 5), // Random completion count 0-4
      })
    }

    return data
  }

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted"
    if (count === 1) return "bg-green-200 dark:bg-green-900"
    if (count === 2) return "bg-green-300 dark:bg-green-800"
    if (count === 3) return "bg-green-400 dark:bg-green-700"
    return "bg-green-500 dark:bg-green-600"
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-53 gap-1 text-xs">
        {data.map((day) => (
          <div
            key={day.date}
            className={`w-3 h-3 rounded-sm ${getIntensityClass(day.count)}`}
            title={`${day.date}: ${day.count} habits completed`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
          <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
          <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
