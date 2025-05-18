"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useGameData } from "@/components/game-data-provider"

export function WordUnscramble() {
  const [currentWord, setCurrentWord] = useState("")
  const [scrambledWord, setScrambledWord] = useState("")
  const [userGuess, setUserGuess] = useState("")
  const [message, setMessage] = useState("")
  const [hintsUsed, setHintsUsed] = useState(0)
  const [solved, setSolved] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const { gameData, updateGameProgress, checkAndUnlockBadges, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["word-unscramble"]

  const words = [
    "APPLE",
    "BANANA",
    "ORANGE",
    "GRAPE",
    "LEMON",
    "MELON",
    "CHERRY",
    "PEACH",
    "MANGO",
    "KIWI",
    "COMPUTER",
    "KEYBOARD",
    "MOUSE",
    "MONITOR",
    "PRINTER",
    "PHONE",
    "TABLET",
    "CAMERA",
    "SPEAKER",
    "HEADPHONE",
    "OCEAN",
    "MOUNTAIN",
    "FOREST",
    "DESERT",
    "RIVER",
    "ISLAND",
    "VALLEY",
    "CANYON",
    "BEACH",
    "LAKE",
  ]

  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    // Pick a random word
    const randomIndex = Math.floor(Math.random() * words.length)
    const word = words[randomIndex]

    // Scramble the word
    const scrambled = scrambleWord(word)

    setCurrentWord(word)
    setScrambledWord(scrambled)
    setUserGuess("")
    setMessage("")
    setHintsUsed(0)
    setIsCorrect(false)

    // Increment play count
    incrementGamePlays("word-unscramble")
  }

  const scrambleWord = (word: string) => {
    const letters = word.split("")
    let scrambled = ""

    // Keep scrambling until we get a different arrangement
    do {
      scrambled = letters.sort(() => 0.5 - Math.random()).join("")
    } while (scrambled === word)

    return scrambled
  }

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserGuess(e.target.value.toUpperCase())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!userGuess) return

    if (userGuess.toUpperCase() === currentWord) {
      setMessage("Correct! You unscrambled the word!")
      setIsCorrect(true)

      // Update stats
      const newSolved = (gameStats.solved || 0) + 1
      updateGameProgress("word-unscramble", {
        solved: newSolved,
        hintsUsed: (gameStats.hintsUsed || 0) + hintsUsed,
      })

      setSolved(newSolved)

      checkAndUnlockBadges()

      // Trigger confetti
      if (typeof window !== "undefined") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    } else {
      setMessage("That's not right. Try again!")

      // Shake animation will be triggered by key change
      setUserGuess("")
    }
  }

  const getHint = () => {
    const newHintsUsed = hintsUsed + 1
    setHintsUsed(newHintsUsed)

    // Update hints used in game stats
    updateGameProgress("word-unscramble", {
      hintsUsed: (gameStats.hintsUsed || 0) + 1,
    })

    // Reveal a portion of the word based on hints used
    const revealCount = Math.min(Math.floor(currentWord.length / 2), newHintsUsed)

    let hint = "Hint: "
    for (let i = 0; i < currentWord.length; i++) {
      if (i < revealCount) {
        hint += currentWord[i] + " "
      } else {
        hint += "_ "
      }
    }

    setMessage(hint)
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <Card className="w-full p-6 text-center">
        <h3 className="mb-6 text-xl font-semibold">Unscramble this word:</h3>

        <div className="mb-8">
          <div className="text-4xl font-bold tracking-widest">
            {scrambledWord.split("").map((letter, index) => (
              <motion.span
                key={index}
                className="inline-block"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              value={userGuess}
              onChange={handleGuessChange}
              placeholder="Type your answer"
              className="text-center text-lg uppercase"
              disabled={isCorrect}
              maxLength={currentWord.length}
            />
            <Button type="submit" disabled={!userGuess || isCorrect}>
              Submit
            </Button>
          </div>
        </form>

        <div className="mb-6 min-h-[24px] text-center">
          {message && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={isCorrect ? "text-green-500" : ""}>
              {message}
            </motion.div>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {isCorrect ? (
            <Button onClick={startNewGame}>Next Word</Button>
          ) : (
            <Button variant="outline" onClick={getHint}>
              Get Hint ({hintsUsed})
            </Button>
          )}
        </div>
      </Card>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Words Solved</div>
          <div className="text-2xl font-bold">{gameStats.solved || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Games Played</div>
          <div className="text-2xl font-bold">{gameStats.plays || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Hints Used</div>
          <div className="text-2xl font-bold">{gameStats.hintsUsed || 0}</div>
        </Card>
      </div>
    </div>
  )
}
