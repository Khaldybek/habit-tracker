"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { HabitList } from "@/components/habits/habit-list"
import { StatsCard } from "@/components/analytics/stats-card"
import { ProgressChart } from "@/components/analytics/progress-chart"
import { Plus, Calendar, TrendingUp, Award } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [habits, setHabits] = useState([])
  const [stats, setStats] = useState({
    totalHabits: 0,
    totalCheckIns: 0,
    completedCheckIns: 0,
    completionRate: 0,
    productivityScore: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")

        // Fetch habits
        const habitsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/habits?limit=5`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!habitsResponse.ok) {
          throw new Error("Failed to fetch habits")
        }

        const habitsData = await habitsResponse.json()
        setHabits(habitsData.data.items)

        // Fetch analytics data
        const analyticsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          const data = analyticsData.data

          setStats({
            totalHabits: data.overall.totalHabits || 0,
            totalCheckIns: data.overall.totalCheckIns || 0,
            completedCheckIns: data.overall.completedCheckIns || 0,
            completionRate: data.overall.completionRate || 0,
            productivityScore: data.productivityScore || 0,
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link href="/habits/create">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> New Habit
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          description="Overall success rate"
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Productivity Score"
          value={stats.productivityScore}
          description="Your overall score"
          icon={<Award className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Habits</CardTitle>
            <CardDescription>Manage and track your habits</CardDescription>
          </CardHeader>
          <CardContent>
            <HabitList habits={habits} />
            {habits.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">You don&apos;t have any habits yet</p>
                <Link href="/habits/create">
                  <Button variant="link" className="mt-2">
                    Create your first habit
                  </Button>
                </Link>
              </div>
            )}
            {habits.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/habits">
                  <Button variant="outline">View all habits</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your habit completion over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ProgressChart />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
