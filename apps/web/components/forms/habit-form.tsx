"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface HabitFormProps {
  habit?: any
  onSubmit: (data: any) => void
  isLoading: boolean
}

const categories = [
  { value: "health", label: "Health", icon: "🏥", color: "#06B6D4" },
  { value: "fitness", label: "Fitness", icon: "💪", color: "#10B981" },
  { value: "learning", label: "Learning", icon: "📚", color: "#3B82F6" },
  { value: "productivity", label: "Productivity", icon: "⚡", color: "#F59E0B" },
  { value: "mindfulness", label: "Mindfulness", icon: "🧘", color: "#8B5CF6" },
  { value: "other", label: "Other", icon: "📝", color: "#6B7280" },
]

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

export function HabitForm({ habit, onSubmit, isLoading }: HabitFormProps) {
  const [formData, setFormData] = useState({
    title: habit?.title || "",
    description: habit?.description || "",
    category: habit?.category || "health",
    frequency: {
      type: habit?.frequency?.type || "daily",
      times: habit?.frequency?.times || 1,
      days: habit?.frequency?.days || [],
    },
    target: {
      type: habit?.target?.type || "boolean",
      value: habit?.target?.value || 1,
      unit: habit?.target?.unit || "",
    },
    icon: habit?.icon || "🏥",
    color: habit?.color || "#06B6D4",
    priority: habit?.priority || "medium",
    reminderEnabled: habit?.reminderEnabled || false,
    reminderTime: habit?.reminderTime || "08:00",
    startDate: habit?.startDate || new Date().toISOString().split("T")[0],
    endDate: habit?.endDate || "",
    tags: habit?.tags?.join(", ") || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNestedChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Process tags
    const processedTags = formData.tags
      ? formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : []

    onSubmit({
      ...formData,
      tags: processedTags,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Habit Name *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Morning Exercise"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of your habit..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Category *</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((category) => (
                <Card
                  key={category.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.category === category.value ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      category: category.value,
                      icon: category.icon,
                      color: category.color,
                    }))
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="frequency-type">Frequency Type *</Label>
              <Select
                value={formData.frequency.type}
                onValueChange={(value) => handleNestedChange("frequency", "type", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency-times">Times {formData.frequency.type}</Label>
              <Input
                id="frequency-times"
                type="number"
                min="1"
                value={formData.frequency.times}
                onChange={(e) => handleNestedChange("frequency", "times", Number.parseInt(e.target.value) || 1)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target-type">Target Type *</Label>
              <Select
                value={formData.target.type}
                onValueChange={(value) => handleNestedChange("target", "type", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boolean">Yes/No</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.target.type !== "boolean" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target-value">Target Value *</Label>
                <Input
                  id="target-value"
                  type="number"
                  min="1"
                  value={formData.target.value}
                  onChange={(e) => handleNestedChange("target", "value", Number.parseInt(e.target.value) || 1)}
                  disabled={isLoading}
                  required={formData.target.type !== "boolean"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-unit">Unit</Label>
                <Input
                  id="target-unit"
                  value={formData.target.unit}
                  onChange={(e) => handleNestedChange("target", "unit", e.target.value)}
                  placeholder="e.g., minutes, pages, glasses"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Comma separated)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., health, morning, important"
              disabled={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminderEnabled">Enable Reminders</Label>
              <p className="text-sm text-muted-foreground">Get notified when it's time for your habit</p>
            </div>
            <Switch
              id="reminderEnabled"
              checked={formData.reminderEnabled}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, reminderEnabled: checked }))}
              disabled={isLoading}
            />
          </div>

          {formData.reminderEnabled && (
            <div className="space-y-2">
              <Label htmlFor="reminderTime">Reminder Time</Label>
              <Input
                id="reminderTime"
                name="reminderTime"
                type="time"
                value={formData.reminderTime}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
            </>
          ) : habit ? (
            "Update Habit"
          ) : (
            "Create Habit"
          )}
        </Button>
      </div>
    </form>
  )
}
