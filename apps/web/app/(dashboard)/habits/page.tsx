"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { HabitList } from "@/components/habits/habit-list"
import { Plus, Search, Filter } from "lucide-react"

export default function HabitsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [habits, setHabits] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("all") // Updated default value
  const [status, setStatus] = useState("all") // Updated default value
  const { toast } = useToast()

  const fetchHabits = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/habits?limit=50`

      if (category !== "all") {
        url += `&category=${category}`
      }

      if (status !== "all") {
        url += `&status=${status}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch habits")
      }

      const data = await response.json()

      // Filter by search term if provided
      let filteredHabits = data.data.items
      if (searchTerm) {
        filteredHabits = filteredHabits.filter(
          (habit: any) =>
            habit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (habit.description && habit.description.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      }

      setHabits(filteredHabits)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load habits",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [category, status, toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchHabits()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
        <Link href="/habits/create">
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> New Habit
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search habits..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
        <div className="flex gap-2">
          <div className="w-[180px]">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="fitness">Fitness</SelectItem>
                <SelectItem value="learning">Learning</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
                <SelectItem value="mindfulness">Mindfulness</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {habits.length > 0 ? (
            <HabitList habits={habits} showActions={true} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="text-lg font-medium">No habits found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || category !== "all" || status !== "all"
                  ? "Try changing your search or filters"
                  : "Get started by creating a new habit"}
              </p>
              {searchTerm === "" && category === "all" && status === "all" && (
                <Link href="/habits/create">
                  <Button className="mt-4 gap-1">
                    <Plus className="h-4 w-4" /> New Habit
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
