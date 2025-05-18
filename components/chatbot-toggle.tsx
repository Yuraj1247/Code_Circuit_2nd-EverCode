"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Chatbot } from "@/components/chatbot"
import { Bot } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Update the ChatbotToggle component props:
interface ChatbotToggleProps {
  permissionStatus?: string | null
  onPermissionChange?: (status: string) => void
}

// Then update the ChatbotToggle component to pass these props to Chatbot:
export function ChatbotToggle({ permissionStatus, onPermissionChange }: ChatbotToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chatbot"
      >
        <Bot className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>GameVerse Buddy</DialogTitle>
            <DialogDescription>Your AI assistant for GameVerse</DialogDescription>
          </DialogHeader>
          <div className="h-[60vh]">
            <Chatbot
              onClose={() => setIsOpen(false)}
              permissionStatus={permissionStatus}
              onPermissionChange={onPermissionChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
