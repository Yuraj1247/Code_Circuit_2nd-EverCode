"use client"

import type React from "react"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "@/components/ui/toaster"
import { GameDataProvider } from "@/components/game-data-provider"

import "@/app/globals.css"

// Add a MicPermissionProvider to manage microphone permissions at the app level

// First, import the useState and useEffect hooks at the top of the file:
import { useState, useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

// Add a MicPermissionProvider component to the layout
// Replace the existing layout function with:

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [micPermissionStatus, setMicPermissionStatus] = useState<string | null>(null)
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)

  // Check for saved permission status on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPermission = localStorage.getItem("micPermissionStatus")
      setMicPermissionStatus(savedPermission)

      // Show permission dialog if no saved preference and not on settings page
      if (!savedPermission && !window.location.pathname.includes("/settings")) {
        setShowPermissionDialog(true)
      }
    }
  }, [])

  const handlePermissionChange = (status: string) => {
    localStorage.setItem("micPermissionStatus", status)
    setMicPermissionStatus(status)
    setShowPermissionDialog(false)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <GameDataProvider>
            <SiteHeader permissionStatus={micPermissionStatus} onPermissionChange={handlePermissionChange} />
            <div className="flex-1">{children}</div>
            <SiteFooter />
            <Toaster />
          </GameDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
