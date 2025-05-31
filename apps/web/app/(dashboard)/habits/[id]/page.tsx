"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { HabitDetails } from "@/components/habits/habit-details"
import { HabitCalendar } from "@/components/habits/habit-calendar"
import { ProgressChart } from "@/components/analytics/progress-chart"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function HabitPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [habit, setHabit] = useState<any>(null)
  const [checkins, setCheckins] = useState([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchHabitData = async () => {
      try {
        const token = localStorage.getItem("token")

        // Fetch habit details
        const habitResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/habits/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!habitResponse.ok) {
          throw new Error("Failed to fetch habit details")
        }

        const habitData = await habitResponse.json()
        setHabit(habitData.data.habit) // Updated to match API response structure

        // Fetch check-ins for this habit
        const checkinsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/checkins?habitId=${params.id}&limit=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!checkinsResponse.ok) {
          throw new Error("Failed to fetch check-ins")
        }

        const checkinsData = await checkinsResponse.json()
        setCheckins(checkinsData.data.items)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load habit data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHabitData()
  }, [params.id, toast])

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/habits/${params.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete habit")
      }

      toast({
        title: "Success",
        description: "Habit deleted successfully",
      })

      router.push("/habits")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete habit",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">Habit not found</h2>
        <p className="text-muted-foreground">
          The habit you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link href="/habits">
          <Button className="mt-4">Back to Habits</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Link href="/habits">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{habit.title}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/habits/${params.id}/edit`}>
            <Button variant="outline" className="gap-1">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-1">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the habit and all associated check-ins.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Habit Information</CardTitle>
              <CardDescription>View detailed information about this habit</CardDescription>
            </CardHeader>
            <CardContent>
              <HabitDetails habit={habit} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Check-in Calendar</CardTitle>
              <CardDescription>Track your progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <HabitCalendar habit={habit} checkins={checkins} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View your progress and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ProgressChart habitId={params.id} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
