"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    browser: true,
    email: true,
    telegram: false,
    telegramUsername: "",
    reminderTime: "08:00",
    dailySummary: true,
    weeklyReport: true,
    achievements: true,
    friendActivity: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch notification settings")
        }

        const data = await response.json()
        setSettings(data.data)
      } catch (error) {
        console.error("Error fetching notification settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to update notification settings")
      }

      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification settings",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Channels</h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="browser">Browser Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
          </div>
          <Switch
            id="browser"
            checked={settings.browser}
            onCheckedChange={(checked) => handleChange("browser", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
          </div>
          <Switch id="email" checked={settings.email} onCheckedChange={(checked) => handleChange("email", checked)} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="telegram">Telegram Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications via Telegram</p>
          </div>
          <Switch
            id="telegram"
            checked={settings.telegram}
            onCheckedChange={(checked) => handleChange("telegram", checked)}
          />
        </div>

        {settings.telegram && (
          <div className="space-y-2 pl-6">
            <Label htmlFor="telegramUsername">Telegram Username</Label>
            <Input
              id="telegramUsername"
              value={settings.telegramUsername}
              onChange={(e) => handleChange("telegramUsername", e.target.value)}
              placeholder="@username"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Preferences</h3>

        <div className="space-y-2">
          <Label htmlFor="reminderTime">Default Reminder Time</Label>
          <Input
            id="reminderTime"
            type="time"
            value={settings.reminderTime}
            onChange={(e) => handleChange("reminderTime", e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="dailySummary">Daily Summary</Label>
            <p className="text-sm text-muted-foreground">Receive a daily summary of your habits</p>
          </div>
          <Switch
            id="dailySummary"
            checked={settings.dailySummary}
            onCheckedChange={(checked) => handleChange("dailySummary", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="weeklyReport">Weekly Report</Label>
            <p className="text-sm text-muted-foreground">Receive a weekly report of your progress</p>
          </div>
          <Switch
            id="weeklyReport"
            checked={settings.weeklyReport}
            onCheckedChange={(checked) => handleChange("weeklyReport", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="achievements">Achievement Notifications</Label>
            <p className="text-sm text-muted-foreground">Get notified when you reach milestones</p>
          </div>
          <Switch
            id="achievements"
            checked={settings.achievements}
            onCheckedChange={(checked) => handleChange("achievements", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="friendActivity">Friend Activity</Label>
            <p className="text-sm text-muted-foreground">Get notified about your friends' activities</p>
          </div>
          <Switch
            id="friendActivity"
            checked={settings.friendActivity}
            onCheckedChange={(checked) => handleChange("friendActivity", checked)}
          />
        </div>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  )
}
