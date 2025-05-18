"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Trash2, Mic } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useGameData } from "@/components/game-data-provider"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { gameData, resetGameData } = useGameData()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [isConfirmationChecked, setIsConfirmationChecked] = useState(false)
  const [micPermission, setMicPermission] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Calculate stats
  const totalGamesPlayed = gameData.sessionStats.totalPlays
  const badgesUnlocked = gameData.badges.filter((badge) => badge.unlocked).length

  useEffect(() => {
    setMounted(true)
    // Load mic permission status from localStorage
    const savedPermission = localStorage.getItem("micPermissionStatus")
    setMicPermission(savedPermission)
  }, [])

  const handleReset = () => {
    resetGameData()
    setIsResetDialogOpen(false)
    setIsConfirmationChecked(false)

    toast({
      title: "Data Reset",
      description: "All game progress and badges have been reset.",
      duration: 3000,
    })
  }

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify(gameData, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const exportFileDefaultName = `gameverse-data-${new Date().toISOString().split("T")[0]}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Data Exported",
        description: "Your game data has been exported successfully.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const resetMicPermission = () => {
    localStorage.removeItem("micPermissionStatus")
    setMicPermission(null)

    toast({
      title: "Microphone Permission Reset",
      description: "You'll be asked for microphone permission next time you use voice commands.",
      duration: 3000,
    })
  }

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Stop all tracks to release the microphone
      stream.getTracks().forEach((track) => track.stop())

      localStorage.setItem("micPermissionStatus", "granted")
      setMicPermission("granted")

      toast({
        title: "Microphone Access Granted",
        description: "You can now use voice commands with GameVerse Buddy.",
      })
    } catch (err) {
      console.error("Error requesting microphone permission:", err)

      localStorage.setItem("micPermissionStatus", "denied")
      setMicPermission("denied")

      toast({
        title: "Microphone Access Denied",
        description: "Voice commands won't be available. You can change this in your browser settings.",
        variant: "destructive",
      })
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="container py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and game data.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how GameVerse looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-mode">Dark Mode</Label>
                <div className="text-sm text-muted-foreground">Switch between light and dark themes</div>
              </div>
              <Switch
                id="theme-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Commands</CardTitle>
            <CardDescription>Manage microphone access for voice commands</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mic-permission">Microphone Access</Label>
                <div className="text-sm text-muted-foreground">Required for "Hey Buddy" voice commands</div>
              </div>
              <div className="flex items-center gap-2">
                {micPermission === "granted" ? (
                  <Button variant="outline" onClick={resetMicPermission}>
                    Reset Permission
                  </Button>
                ) : (
                  <Button onClick={requestMicPermission}>
                    <Mic className="mr-2 h-4 w-4" />
                    Grant Access
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="mb-2 font-medium">Voice Command Status</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Microphone Permission:</span>
                  <span
                    className={
                      micPermission === "granted"
                        ? "text-green-500"
                        : micPermission === "denied"
                          ? "text-red-500"
                          : "text-yellow-500"
                    }
                  >
                    {micPermission === "granted" ? "Granted" : micPermission === "denied" ? "Denied" : "Not Set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>"Hey Buddy" Wake Word:</span>
                  <span className={micPermission === "granted" ? "text-green-500" : "text-red-500"}>
                    {micPermission === "granted" ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="voice-feedback">Voice Feedback</Label>
                <div className="text-sm text-muted-foreground">Enable spoken responses from GameVerse Buddy</div>
              </div>
              <Switch id="voice-feedback" defaultChecked={true} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Data</CardTitle>
            <CardDescription>Manage your saved game progress and badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="mb-2 font-medium">Current Data Summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Games Played:</span>
                  <span>{totalGamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Badges Unlocked:</span>
                  <span>{badgesUnlocked}</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Used:</span>
                  <span>~{Math.round(JSON.stringify(gameData).length / 1024)} KB</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleExportData}>
              Export Data
            </Button>

            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Reset All Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Game Data</DialogTitle>
                  <DialogDescription>
                    This will permanently delete all your game progress, badges, and statistics. This action cannot be
                    undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="my-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <div className="font-medium">Warning</div>
                      <div className="text-sm">
                        You will lose all your progress, including:
                        <ul className="ml-5 mt-1 list-disc">
                          <li>Game statistics and high scores</li>
                          <li>All {badgesUnlocked} unlocked badges</li>
                          <li>Game preferences and settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="confirm-reset"
                    checked={isConfirmationChecked}
                    onCheckedChange={setIsConfirmationChecked}
                  />
                  <Label htmlFor="confirm-reset">I understand this will delete all my data</Label>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReset} disabled={!isConfirmationChecked}>
                    Reset All Data
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About GameVerse</CardTitle>
            <CardDescription>Information about the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="mb-2 font-medium">Version</div>
              <div className="text-sm">GameVerse v1.0.0</div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="mb-2 font-medium">How Data is Stored</div>
              <div className="text-sm">
                <p>
                  GameVerse uses your browser's localStorage to save all game data locally on your device. No data is
                  sent to any server, and no account is required.
                </p>
                <p className="mt-2">
                  This means your data stays private, but it also means your progress is tied to this browser and
                  device. Use the Export Data option to back up your progress.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="mb-2 font-medium">Credits</div>
              <div className="text-sm">
                <p>Built with Next.js, Tailwind CSS, and Framer Motion.</p>
                <p className="mt-2">Icons by Lucide React.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
