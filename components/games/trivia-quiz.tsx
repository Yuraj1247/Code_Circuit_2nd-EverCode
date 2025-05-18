"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useGameData } from "@/components/game-data-provider"

type Question = {
  question: string
  options: string[]
  correctAnswer: number
}

export function TriviaQuiz() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [gameOver, setGameOver] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const { gameData, updateGameProgress, checkAndUnlockBadges, incrementGamePlays } = useGameData()

  const gameStats = gameData.gameProgress["trivia-quiz"]

  useEffect(() => {
    startGame()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timerActive && timeLeft === 0) {
      handleTimeout()
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timeLeft, timerActive])

  const sampleQuestions: Question[] = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2,
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1,
    },
    {
      question: "What is the largest mammal?",
      options: ["Elephant", "Giraffe", "Blue Whale", "Hippopotamus"],
      correctAnswer: 2,
    },
    {
      question: "Which of these is not a programming language?",
      options: ["Java", "Python", "Cobra", "Banana"],
      correctAnswer: 3,
    },
    {
      question: "What year was the first iPhone released?",
      options: ["2005", "2006", "2007", "2008"],
      correctAnswer: 2,
    },
    {
      question: "Which element has the chemical symbol 'O'?",
      options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
      correctAnswer: 1,
    },
    {
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correctAnswer: 2,
    },
    {
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      correctAnswer: 3,
    },
    {
      question: "How many sides does a hexagon have?",
      options: ["5", "6", "7", "8"],
      correctAnswer: 1,
    },
    {
      question: "Which country is home to the kangaroo?",
      options: ["New Zealand", "South Africa", "Australia", "Brazil"],
      correctAnswer: 2,
    },
  ]

  const startGame = () => {
    // Shuffle questions and take 5
    const shuffledQuestions = [...sampleQuestions].sort(() => Math.random() - 0.5).slice(0, 5)
    setQuestions(shuffledQuestions)
    setCurrentQuestion(0)
    setScore(0)
    setSelectedOption(null)
    setTimeLeft(10)
    setGameOver(false)
    setTimerActive(true)

    // Increment play count
    incrementGamePlays("trivia-quiz")
  }

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOption !== null || !timerActive) return

    setSelectedOption(optionIndex)
    setTimerActive(false)

    const isCorrect = optionIndex === questions[currentQuestion].correctAnswer

    if (isCorrect) {
      setScore(score + 1)
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOption(null)
        setTimeLeft(10)
        setTimerActive(true)
      } else {
        endGame()
      }
    }, 1500)
  }

  const handleTimeout = () => {
    setTimerActive(false)

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOption(null)
        setTimeLeft(10)
        setTimerActive(true)
      } else {
        endGame()
      }
    }, 1500)
  }

  const endGame = () => {
    setGameOver(true)

    // Update best score if this is better
    const currentBest = gameStats.bestScore || 0
    if (score > currentBest) {
      updateGameProgress("trivia-quiz", {
        bestScore: score,
        score: score,
      })
    } else {
      updateGameProgress("trivia-quiz", { score: score })
    }

    checkAndUnlockBadges()

    // Trigger confetti if score is good
    if (score >= 4 && typeof window !== "undefined") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }

  const getOptionClass = (optionIndex: number) => {
    if (selectedOption === null) return ""

    const correctAnswer = questions[currentQuestion].correctAnswer

    if (optionIndex === correctAnswer) {
      return "bg-green-500/20 border-green-500"
    }

    if (optionIndex === selectedOption && optionIndex !== correctAnswer) {
      return "bg-red-500/20 border-red-500"
    }

    return "opacity-50"
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {!gameOver ? (
        <Card className="w-full p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium">
              Question {currentQuestion + 1}/{questions.length}
            </div>
            <div className="text-sm font-medium">Score: {score}</div>
          </div>

          <div className="mb-4">
            <Progress value={(timeLeft / 10) * 100} className="h-2" />
          </div>

          {questions.length > 0 && (
            <>
              <h3 className="mb-6 text-xl font-semibold">{questions[currentQuestion].question}</h3>

              <div className="grid gap-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    className={`rounded-lg border border-border p-4 text-left transition-all hover:bg-muted/50 ${getOptionClass(index)}`}
                    onClick={() => handleOptionSelect(index)}
                    whileHover={{ scale: selectedOption === null ? 1.02 : 1 }}
                    disabled={selectedOption !== null}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </Card>
      ) : (
        <Card className="w-full p-6 text-center">
          <h3 className="mb-2 text-2xl font-semibold">Quiz Complete!</h3>
          <p className="mb-6 text-xl">
            Your score: {score}/{questions.length}
          </p>

          <div className="mb-6">
            {score === questions.length ? (
              <div className="text-green-500">Perfect score! Amazing job! 🎉</div>
            ) : score >= questions.length * 0.7 ? (
              <div className="text-green-500">Great job! 👏</div>
            ) : score >= questions.length * 0.5 ? (
              <div className="text-yellow-500">Good effort! 👍</div>
            ) : (
              <div className="text-muted-foreground">Better luck next time! 🙂</div>
            )}
          </div>

          <Button onClick={startGame}>Play Again</Button>
        </Card>
      )}

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Games Played</div>
          <div className="text-2xl font-bold">{gameStats.plays || 0}</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-sm font-medium text-muted-foreground">Best Score</div>
          <div className="text-2xl font-bold">{gameStats.bestScore || 0}</div>
        </Card>
      </div>
    </div>
  )
}
