"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send, Mic, MicOff, Volume2, VolumeX, Bot, Info } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Add this type definition for browser compatibility
type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatbotProps {
  onClose?: () => void
  permissionStatus?: string | null
  onPermissionChange?: (status: string) => void
}

export function Chatbot({ onClose, permissionStatus, onPermissionChange }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your GameVerse Buddy. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [restartTimeout, setRestartTimeout] = useState<NodeJS.Timeout | null>(null)

  // Background listening for "Hey Buddy"
  const [backgroundListening, setBackgroundListening] = useState(false)
  const [backgroundRecognition, setBackgroundRecognition] = useState<SpeechRecognitionType | null>(null)
  const [waitingForCommand, setWaitingForCommand] = useState(false)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && permissionStatus === "granted") {
      // Speech Recognition setup
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        try {
          // Main recognition for commands
          const recognitionInstance = new SpeechRecognition()
          recognitionInstance.continuous = false
          recognitionInstance.lang = "en-US"
          recognitionInstance.interimResults = false
          recognitionInstance.maxAlternatives = 1

          recognitionInstance.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setInput(transcript)

            if (waitingForCommand) {
              // If we're waiting for a command after "Hey Buddy"
              handleVoiceCommand(transcript)
              setWaitingForCommand(false)
            } else {
              // Normal command processing
              handleVoiceCommand(transcript)
            }
          }

          recognitionInstance.onerror = (event) => {
            console.error("Speech recognition error", event.error)
            setIsListening(false)
            setWaitingForCommand(false)
          }

          recognitionInstance.onend = () => {
            setIsListening(false)
          }

          setRecognition(recognitionInstance)

          // Background recognition for "Hey Buddy"
          const backgroundRecognitionInstance = new SpeechRecognition()
          backgroundRecognitionInstance.continuous = true
          backgroundRecognitionInstance.lang = "en-US"
          backgroundRecognitionInstance.interimResults = false
          backgroundRecognitionInstance.maxAlternatives = 1

          // Track consecutive errors to prevent infinite restart loops
          let consecutiveErrors = 0
          const MAX_CONSECUTIVE_ERRORS = 3

          backgroundRecognitionInstance.onresult = (event) => {
            consecutiveErrors = 0 // Reset error counter on successful result
            const results = Array.from(event.results)
            for (let i = event.resultIndex; i < results.length; i++) {
              const transcript = results[i][0].transcript.toLowerCase()
              console.log("Background heard:", transcript)

              if (
                transcript.includes("hey buddy") ||
                transcript.includes("hey body") ||
                transcript.includes("hay buddy") ||
                transcript.includes("hey but") ||
                transcript.includes("hey bud")
              ) {
                // Stop background listening and activate main listening
                try {
                  backgroundRecognitionInstance.stop()
                } catch (error) {
                  console.error("Error stopping background recognition:", error)
                }
                setBackgroundListening(false)

                // Extract command after "hey buddy"
                const commandMatch = transcript.match(/hey\s+bud(?:dy|y|ie)(?:,|\s+)(.+)/i)
                const command = commandMatch ? commandMatch[1].trim() : ""

                if (command) {
                  // Add user message
                  const userMessage: Message = {
                    role: "user",
                    content: `Hey Buddy, ${command}`,
                    timestamp: new Date(),
                  }
                  setMessages((prev) => [...prev, userMessage])

                  // Process command
                  handleVoiceCommand(command)
                } else {
                  // Just acknowledge the wake word and wait for command
                  respondToUser("How can I help you?")
                  setWaitingForCommand(true)

                  // Start listening for the command
                  setTimeout(() => {
                    try {
                      recognitionInstance.start()
                      setIsListening(true)
                    } catch (error) {
                      console.error("Error starting command recognition:", error)
                    }
                  }, 1000)
                }

                // Restart background listening after a delay
                if (restartTimeout) clearTimeout(restartTimeout)
                setRestartTimeout(
                  setTimeout(() => {
                    try {
                      if (permissionStatus === "granted") {
                        backgroundRecognitionInstance.start()
                        setBackgroundListening(true)
                      }
                    } catch (error) {
                      console.error("Error restarting background recognition:", error)
                    }
                  }, 5000),
                )

                break
              }
            }
          }

          backgroundRecognitionInstance.onerror = (event) => {
            console.error("Background recognition error:", event.error)
            setBackgroundListening(false)

            // Increment error counter
            consecutiveErrors++

            // Only try to restart if we haven't had too many consecutive errors
            if (consecutiveErrors < MAX_CONSECUTIVE_ERRORS) {
              // Try to restart after error with increasing delay
              if (restartTimeout) clearTimeout(restartTimeout)
              setRestartTimeout(
                setTimeout(() => {
                  try {
                    if (permissionStatus === "granted") {
                      backgroundRecognitionInstance.start()
                      setBackgroundListening(true)
                      console.log("Background recognition restarted after error")
                    }
                  } catch (error) {
                    console.error("Error restarting background recognition after error:", error)
                  }
                }, 3000 * consecutiveErrors),
              ) // Increasing backoff delay
            } else {
              console.warn("Too many consecutive errors, stopping background recognition restart attempts")
              // Provide feedback to user that voice recognition is having issues
              toast({
                title: "Voice Recognition Issue",
                description: "Background listening has been paused. Click the microphone button to use voice commands.",
                duration: 5000,
              })
            }
          }

          backgroundRecognitionInstance.onend = () => {
            // Only try to restart if it was supposed to be listening
            if (backgroundListening && permissionStatus === "granted" && consecutiveErrors < MAX_CONSECUTIVE_ERRORS) {
              try {
                // Add a small delay before restarting to prevent rapid restart loops
                if (restartTimeout) clearTimeout(restartTimeout)
                setRestartTimeout(
                  setTimeout(() => {
                    backgroundRecognitionInstance.start()
                    console.log("Background recognition restarted after end")
                  }, 1000),
                )
              } catch (error) {
                console.error("Error restarting background recognition after end:", error)
                setBackgroundListening(false)
              }
            }
          }

          setBackgroundRecognition(backgroundRecognitionInstance)

          // Start background listening only if permission is granted
          if (permissionStatus === "granted") {
            try {
              backgroundRecognitionInstance.start()
              setBackgroundListening(true)
              console.log("Background listening started")
            } catch (error) {
              console.error("Error starting background recognition:", error)
            }
          }
        } catch (error) {
          console.error("Error initializing speech recognition:", error)
        }
      }
    }

    return () => {
      if (recognition) {
        try {
          recognition.abort()
        } catch (error) {
          console.error("Error aborting recognition:", error)
        }
      }

      if (backgroundRecognition) {
        try {
          backgroundRecognition.abort()
        } catch (error) {
          console.error("Error aborting background recognition:", error)
        }
        setBackgroundListening(false)
      }

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }

      if (restartTimeout) {
        clearTimeout(restartTimeout)
      }
    }
  }, [permissionStatus, waitingForCommand])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Stop all tracks to release the microphone
      stream.getTracks().forEach((track) => track.stop())

      if (onPermissionChange) {
        onPermissionChange("granted")
      }

      toast({
        title: "Microphone Access Granted",
        description: "You can now use voice commands with GameVerse Buddy.",
      })

      // Reload the component to initialize speech recognition
      window.location.reload()
    } catch (err) {
      console.error("Error requesting microphone permission:", err)

      if (onPermissionChange) {
        onPermissionChange("denied")
      }

      toast({
        title: "Microphone Access Denied",
        description: "Voice commands won't be available. You can change this in your browser settings.",
        variant: "destructive",
      })
    }
  }

  const toggleListening = () => {
    if (permissionStatus !== "granted") {
      requestMicPermission()
      return
    }

    if (!recognition) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      try {
        recognition.abort()
      } catch (error) {
        console.error("Error stopping recognition:", error)
      }
      setIsListening(false)
      setWaitingForCommand(false)
    } else {
      try {
        recognition.start()
        setIsListening(true)
        setInput("")
      } catch (error) {
        console.error("Error starting recognition:", error)
        toast({
          title: "Voice Recognition Error",
          description: "Could not start voice recognition. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      })
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Error with speech synthesis:", error)
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === "" || isProcessing) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    // Process the user's message
    handleUserMessage(input)
  }

  const handleUserMessage = (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Check for wake word "hey buddy"
    if (lowerMessage.includes("hey buddy")) {
      const command = lowerMessage.replace(/hey\s+bud(?:dy|y|ie)(?:,|\s+)/i, "").trim()
      if (command) {
        handleVoiceCommand(command)
      } else {
        respondToUser("How can I help you?")
        setWaitingForCommand(true)

        // Start listening for the command
        if (recognition) {
          setTimeout(() => {
            try {
              recognition.start()
              setIsListening(true)
            } catch (error) {
              console.error("Error starting command recognition:", error)
            }
          }, 1000)
        }
      }
      return
    }

    // Process the command
    handleVoiceCommand(lowerMessage)
  }

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase()

    // Navigation commands
    if (
      lowerCommand.includes("go to") ||
      lowerCommand.includes("open") ||
      lowerCommand.includes("navigate to") ||
      lowerCommand.includes("take me to")
    ) {
      const destination = extractDestination(lowerCommand)
      if (destination) {
        navigateTo(destination)
        return
      }
    }

    // Game-specific commands
    if (lowerCommand.includes("play") || lowerCommand.includes("start game") || lowerCommand.includes("launch game")) {
      const game = extractGame(lowerCommand)
      if (game) {
        navigateToGame(game)
        return
      }
    }

    // Help commands
    if (
      lowerCommand.includes("help") ||
      lowerCommand.includes("what can you do") ||
      lowerCommand.includes("commands") ||
      lowerCommand.includes("how to use")
    ) {
      showHelp()
      return
    }

    // Stats commands
    if (
      lowerCommand.includes("stats") ||
      lowerCommand.includes("statistics") ||
      lowerCommand.includes("progress") ||
      lowerCommand.includes("my performance")
    ) {
      navigateTo("dashboard")
      return
    }

    // Badges commands
    if (
      lowerCommand.includes("badges") ||
      lowerCommand.includes("achievements") ||
      lowerCommand.includes("trophies") ||
      lowerCommand.includes("awards")
    ) {
      navigateTo("badges")
      return
    }

    // Challenges commands
    if (
      lowerCommand.includes("challenges") ||
      lowerCommand.includes("daily challenges") ||
      lowerCommand.includes("tasks") ||
      lowerCommand.includes("missions")
    ) {
      navigateTo("daily-challenges")
      return
    }

    // Close commands
    if (
      lowerCommand.includes("close") ||
      lowerCommand.includes("exit") ||
      lowerCommand.includes("bye") ||
      lowerCommand.includes("goodbye")
    ) {
      respondToUser("Goodbye! Closing the chat window.")
      setTimeout(() => {
        if (onClose) onClose()
      }, 1500)
      return
    }

    // Theme commands
    if (
      lowerCommand.includes("dark mode") ||
      lowerCommand.includes("light mode") ||
      lowerCommand.includes("theme") ||
      lowerCommand.includes("change color")
    ) {
      if (lowerCommand.includes("dark")) {
        respondToUser("Switching to dark mode.")
        document.documentElement.classList.add("dark")
      } else if (lowerCommand.includes("light")) {
        respondToUser("Switching to light mode.")
        document.documentElement.classList.remove("dark")
      } else {
        respondToUser("You can say 'dark mode' or 'light mode' to change the theme.")
      }
      return
    }

    // Time commands
    if (
      lowerCommand.includes("time") ||
      lowerCommand.includes("date") ||
      lowerCommand.includes("day") ||
      lowerCommand.includes("today")
    ) {
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      const dateString = now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      respondToUser(`The current time is ${timeString} and today is ${dateString}.`)
      return
    }

    // Game information commands
    if (
      lowerCommand.includes("tell me about") ||
      lowerCommand.includes("what is") ||
      lowerCommand.includes("how to play")
    ) {
      const game = extractGame(lowerCommand)
      if (game) {
        respondToUser(getGameInfo(game))
        return
      }
    }

    // Settings commands
    if (lowerCommand.includes("settings") || lowerCommand.includes("preferences") || lowerCommand.includes("options")) {
      navigateTo("settings")
      return
    }

    // About commands
    if (lowerCommand.includes("about") || lowerCommand.includes("information") || lowerCommand.includes("info")) {
      navigateTo("about")
      return
    }

    // Refresh commands
    if (lowerCommand.includes("refresh") || lowerCommand.includes("reload") || lowerCommand.includes("update")) {
      respondToUser("Refreshing the page...")
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      return
    }

    // Home commands
    if (lowerCommand.includes("home") || lowerCommand.includes("main page") || lowerCommand.includes("start page")) {
      navigateTo("home")
      return
    }

    // Games list commands
    if (
      lowerCommand.includes("games list") ||
      lowerCommand.includes("all games") ||
      lowerCommand.includes("show games")
    ) {
      navigateTo("games")
      return
    }

    // Popular games commands
    if (
      lowerCommand.includes("popular games") ||
      lowerCommand.includes("best games") ||
      lowerCommand.includes("recommended games")
    ) {
      respondToUser(
        "Our most popular games are Rock Paper Scissors, Memory Match, and Trivia Quiz. Would you like to play one of these?",
      )
      return
    }

    // Coin commands
    if (
      lowerCommand.includes("coins") ||
      lowerCommand.includes("how many coins") ||
      lowerCommand.includes("my coins")
    ) {
      navigateTo("dashboard")
      return
    }

    // Clear chat commands
    if (
      lowerCommand.includes("clear chat") ||
      lowerCommand.includes("clear messages") ||
      lowerCommand.includes("reset chat")
    ) {
      setMessages([
        {
          role: "assistant",
          content: "Chat history cleared. How can I help you?",
          timestamp: new Date(),
        },
      ])
      return
    }

    // Volume commands
    if (
      lowerCommand.includes("volume up") ||
      lowerCommand.includes("louder") ||
      lowerCommand.includes("increase volume")
    ) {
      respondToUser("I've increased the volume.")
      return
    }

    if (
      lowerCommand.includes("volume down") ||
      lowerCommand.includes("quieter") ||
      lowerCommand.includes("decrease volume")
    ) {
      respondToUser("I've decreased the volume.")
      return
    }

    if (lowerCommand.includes("mute") || lowerCommand.includes("silent") || lowerCommand.includes("stop speaking")) {
      stopSpeaking()
      respondToUser("I've muted the audio.")
      return
    }

    // Fallback response
    respondToUser(generateResponse(lowerCommand))
  }

  // Add a new function to manually restart background listening when needed

  // Add this function after the handleVoiceCommand function:

  const restartBackgroundListening = () => {
    if (!backgroundRecognition || permissionStatus !== "granted") return

    try {
      // First stop any existing instance
      backgroundRecognition.abort()

      // Short delay before restarting
      setTimeout(() => {
        try {
          backgroundRecognition.start()
          setBackgroundListening(true)
          console.log("Background listening manually restarted")
        } catch (error) {
          console.error("Error manually restarting background recognition:", error)
        }
      }, 500)
    } catch (error) {
      console.error("Error stopping background recognition before restart:", error)
    }
  }

  const extractDestination = (command: string): string | null => {
    const destinations = {
      home: ["home", "main page", "start", "landing page", "homepage", "front page", "welcome page"],
      games: ["games", "game list", "all games", "play games", "game library", "games page", "game collection"],
      "daily-challenges": [
        "daily challenges",
        "challenges",
        "daily",
        "challenge",
        "tasks",
        "missions",
        "quests",
        "daily tasks",
        "daily missions",
      ],
      dashboard: [
        "dashboard",
        "stats",
        "statistics",
        "progress",
        "analytics",
        "data",
        "performance",
        "my stats",
        "my progress",
        "my dashboard",
      ],
      badges: [
        "badges",
        "achievements",
        "trophies",
        "awards",
        "medals",
        "accomplishments",
        "my badges",
        "my achievements",
        "my trophies",
      ],
      about: ["about", "info", "information", "details", "learn more", "about page", "about us", "about gameverse"],
      settings: [
        "settings",
        "preferences",
        "options",
        "configuration",
        "setup",
        "settings page",
        "my settings",
        "game settings",
      ],
    }

    for (const [route, keywords] of Object.entries(destinations)) {
      if (keywords.some((keyword) => command.includes(keyword))) {
        return route
      }
    }

    return null
  }

  const extractGame = (command: string): string | null => {
    const games = {
      "rock-paper-scissors": [
        "rock paper scissors",
        "rock paper",
        "rps",
        "rock",
        "scissors",
        "paper game",
        "rock paper scissor",
      ],
      "number-guess": [
        "number guess",
        "guess number",
        "number guessing",
        "number game",
        "guessing game",
        "guess the number",
        "number guessing game",
      ],
      "dice-roller": ["dice roller", "dice", "roll dice", "dice game", "rolling dice", "dice rolling", "roll the dice"],
      "memory-match": [
        "memory match",
        "memory game",
        "matching game",
        "match cards",
        "memory cards",
        "card matching",
        "memory matching",
      ],
      "trivia-quiz": [
        "trivia quiz",
        "trivia",
        "quiz",
        "questions",
        "trivia game",
        "quiz game",
        "question game",
        "trivia questions",
      ],
      "word-unscramble": [
        "word unscramble",
        "unscramble",
        "word game",
        "scramble",
        "word puzzle",
        "unscramble words",
        "word scramble",
      ],
      "grid-puzzle": [
        "grid puzzle",
        "puzzle",
        "sliding puzzle",
        "tile puzzle",
        "grid game",
        "sliding tiles",
        "puzzle game",
      ],
      "idle-clicker": [
        "idle clicker",
        "clicker",
        "clicking game",
        "idle game",
        "click game",
        "clicker game",
        "idle clicking",
      ],
      "card-battle": [
        "card battle",
        "battle",
        "card game",
        "battle cards",
        "card fight",
        "card wars",
        "battle card game",
      ],
      "reaction-speed": [
        "reaction speed",
        "reaction",
        "speed test",
        "reaction test",
        "reflex test",
        "reaction time",
        "speed reaction",
      ],
    }

    for (const [route, keywords] of Object.entries(games)) {
      if (keywords.some((keyword) => command.includes(keyword))) {
        return route
      }
    }

    return null
  }

  const navigateTo = (destination: string) => {
    respondToUser(`Taking you to ${formatDestination(destination)}...`)
    setTimeout(() => {
      if (onClose) onClose()
      router.push(`/${destination === "home" ? "" : destination}`)
    }, 1000)
  }

  const navigateToGame = (game: string) => {
    respondToUser(`Opening ${formatDestination(game)}...`)
    setTimeout(() => {
      if (onClose) onClose()
      router.push(`/games/${game}`)
    }, 1000)
  }

  const formatDestination = (destination: string): string => {
    return destination
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getGameInfo = (game: string): string => {
    const gameInfo: Record<string, string> = {
      "rock-paper-scissors":
        "Rock Paper Scissors is a classic game where you choose rock, paper, or scissors. Rock beats scissors, scissors beats paper, and paper beats rock. Try to predict your opponent's move to win!",
      "number-guess":
        "In Number Guess, you try to guess a number between 1 and 100. After each guess, you'll get a hint whether the target number is higher or lower.",
      "memory-match":
        "Memory Match tests your memory skills. Flip cards to find matching pairs. The fewer moves you make, the better your score!",
      "trivia-quiz":
        "Trivia Quiz challenges your knowledge with questions across various topics. Answer correctly before the timer runs out!",
      "word-unscramble":
        "In Word Unscramble, you're given jumbled letters and need to rearrange them to form a valid word. You can use hints if you get stuck.",
      "grid-puzzle":
        "Grid Puzzle is a sliding tile puzzle where you rearrange tiles to form the correct sequence. The fewer moves, the better!",
      "idle-clicker":
        "Idle Clicker is a game where you click to earn coins and buy upgrades that automatically generate more coins for you.",
      "card-battle":
        "Card Battle is a strategic card game where you battle against the computer. Choose your actions wisely to defeat your opponent!",
      "reaction-speed":
        "Reaction Speed tests how quickly you can respond. Wait for the green light, then click as fast as you can!",
      "dice-roller":
        "Dice Roller lets you roll virtual dice. It's a simple game of chance - see what numbers you can roll!",
    }

    return gameInfo[game] || `${formatDestination(game)} is one of our fun mini-games. Try it out to learn more!`
  }

  const showHelp = () => {
    const helpMessage = `
      I can help you navigate GameVerse and provide information. Here are some commands you can try:
      
      Navigation:
      - "Open Games" to see all games
      - "Go to Dashboard" to see your stats
      - "Show my badges" to view your achievements
      - "Open daily challenges" to see today's challenges
      - "Take me to settings" to access settings
      
      Games:
      - "Play Rock Paper Scissors" to start a specific game
      - "Tell me about Memory Match" to learn about a game
      - "What are the popular games?" to get recommendations
      
      Other Commands:
      - "Dark mode" or "Light mode" to change theme
      - "What time is it?" to check the current time
      - "Clear chat" to reset our conversation
      - "Close" or "Exit" to close this chat
      
      You can activate me anytime by saying "Hey Buddy" followed by a command.
    `
    respondToUser(helpMessage)
  }

  const generateResponse = (message: string): string => {
    // Simple response generation based on keywords
    if (message.includes("hello") || message.includes("hi ")) {
      return "Hello! How can I help you with GameVerse today?"
    }

    if (message.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?"
    }

    if (message.includes("who are you") || message.includes("what are you")) {
      return "I'm GameVerse Buddy, your virtual assistant for the GameVerse platform. I can help you navigate the site, play games, and check your progress."
    }

    if (message.includes("how do i play") || message.includes("how to play")) {
      return "You can browse our games by saying 'Open Games' or directly start a specific game by saying 'Play' followed by the game name, like 'Play Rock Paper Scissors'."
    }

    if (message.includes("best game") || message.includes("recommend") || message.includes("suggestion")) {
      return "I'd recommend trying Memory Match or Trivia Quiz if you're new. Rock Paper Scissors is also a classic favorite!"
    }

    // Default response
    return "I'm not sure how to help with that. Try asking me to open a game, show your stats, or navigate to a specific page. Say 'help' for more options."
  }

  const respondToUser = (response: string) => {
    const botMessage: Message = {
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage])
      setIsProcessing(false)
      speakResponse(response)
    }, 500)
  }

  return (
    <div className="flex h-full flex-col" ref={chatContainerRef}>
      {permissionStatus === "denied" && (
        <Alert variant="destructive" className="m-2 mb-0">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Microphone access denied. Voice commands are disabled.
            <Button variant="link" className="h-auto p-0 pl-1" onClick={requestMicPermission}>
              Grant permission
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-y-auto p-4" style={{ overscrollBehavior: "contain" }}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-line text-sm">{message.content}</p>
                <p className="mt-1 text-right text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={isListening ? "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300" : ""}
            onClick={toggleListening}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening ? "Listening..." : waitingForCommand ? "Waiting for command..." : "Type a message..."
            }
            className="flex-1"
            disabled={isListening || waitingForCommand}
          />
          <Button type="submit" size="icon" disabled={input.trim() === "" || isProcessing || waitingForCommand}>
            <Send className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={isSpeaking ? stopSpeaking : () => speakResponse(messages[messages.length - 1].content)}
            className={isSpeaking ? "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300" : ""}
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </form>
        {/* Add a button in the UI to manually restart listening */}
        {/* Find the div with the Bot icon and "Listening for 'Hey Buddy'" text and replace it with: */}

        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Bot className="h-3 w-3" />
          {waitingForCommand ? (
            "Listening for your command..."
          ) : permissionStatus === "granted" ? (
            backgroundListening ? (
              "Listening for 'Hey Buddy'"
            ) : (
              <button onClick={restartBackgroundListening} className="underline hover:text-primary">
                Restart voice detection
              </button>
            )
          ) : (
            "Microphone access needed for voice commands"
          )}
        </div>
      </div>
    </div>
  )
}
