"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mic, Info, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface MicPermissionDialogProps {
  onGranted: () => void
  onDenied: () => void
  onClose: () => void
}

export function MicPermissionDialog({ onGranted, onDenied, onClose }: MicPermissionDialogProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestMicPermission = async () => {
    setIsRequesting(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Stop all tracks to release the microphone
      stream.getTracks().forEach((track) => track.stop())

      onGranted()
    } catch (err) {
      console.error("Error requesting microphone permission:", err)

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Microphone permission was denied. Voice commands won't be available.")
          onDenied()
        } else if (err.name === "NotFoundError") {
          setError("No microphone found. Please connect a microphone and try again.")
          onDenied()
        } else {
          setError(`Error accessing microphone: ${err.message}`)
          onDenied()
        }
      } else {
        setError("An unknown error occurred while accessing the microphone.")
        onDenied()
      }
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Microphone Permission</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>GameVerse Buddy needs microphone access for voice commands</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Mic className="h-12 w-12 text-primary" />
              </div>
            </div>

            <div className="text-center text-sm">
              <p>
                With microphone access, you can use voice commands like "Hey Buddy, open Rock Paper Scissors" to
                navigate GameVerse hands-free.
              </p>

              {error && (
                <div className="mt-4 rounded-md bg-destructive/10 p-3 text-left text-destructive">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onDenied}>
              No Thanks
            </Button>
            <Button onClick={requestMicPermission} disabled={isRequesting}>
              {isRequesting ? "Requesting..." : "Allow Microphone"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
