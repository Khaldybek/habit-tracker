"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { StatsCard } from "@/components/analytics/stats-card"
import { ProgressChart } from "@/components/analytics/progress-chart"
import { HeatMap } from "@/components/analytics/heat-map"
import { StreakChart } from "@/components/analytics/streak-chart"
import { CategoryBreakdown } from "@/components/analytics/category-breakdown"
import { Calendar, TrendingUp, Award, BarChart3, Download } from "lucide-react"

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHabits: 0,
    totalCheckIns: 0,
    completedCheckIns: 0,
    completionRate: 0,
    productivityScore: 0,
    categories: {},
    streaks: [],
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const token = localStorage.getItem("token")

        // Fetch user stats
        const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch stats")
        }

        const statsData = await statsResponse.json()
        const data = statsData.data

        // Process stats data according to actual API response
        setStats({
          totalHabits: data.overall.totalHabits || 0,
          totalCheckIns: data.overall.totalCheckIns || 0,
          completedCheckIns: data.overall.completedCheckIns || 0,
          completionRate: data.overall.completionRate || 0,
          productivityScore: data.productivityScore || 0,
          categories: data.categories || {},
          streaks: data.streaks || [],
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load analytics data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [toast])

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/export?format=json`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to export data")
      }

      const data = await response.json()

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `habit-tracker-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Data exported successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export data",
      })
    }
  }

  const getBestStreak = () => {
    if (stats.streaks.length === 0) return 0
    return Math.max(...stats.streaks.map((streak: any) => streak.currentStreak))
  }

  const getCurrentStreak = () => {
    if (stats.streaks.length === 0) return 0
    // Get the average current streak
    const totalStreak = stats.streaks.reduce((sum: number, streak: any) => sum + streak.currentStreak, 0)
    return Math.round(totalStreak / stats.streaks.length)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <Button onClick={handleExportData} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Habits"
          value={stats.totalHabits}
          description="Active habits"
          icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Check-ins"
          value={stats.totalCheckIns}
          description="All time check-ins"
          icon={<Award className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Completed Check-ins"
          value={stats.completedCheckIns}
          description="Successfully completed"
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          description="Overall success rate"
          icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Current Streak"
          value={getCurrentStreak()}
          description="Average current streak"
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Productivity Score"
          value={stats.productivityScore}
          description="Your overall score"
          icon={<Award className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>Your habit completion over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ProgressChart />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Performance by habit category</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBreakdown categories={stats.categories} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Streak Analysis</CardTitle>
              <CardDescription>Your consistency over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <StreakChart streaks={stats.streaks} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Heatmap</CardTitle>
              <CardDescription>Your daily activity over the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <HeatMap />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
