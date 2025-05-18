"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export type GameProgress = {
  [key: string]: {
    wins?: number
    losses?: number
    draws?: number
    plays?: number
    score?: number
    bestScore?: number
    bestTime?: number
    timeSpent?: number
    level?: number
    [key: string]: any
  }
}

export type Badge = {
  id: string
  title: string
  description: string
  game: string
  requirement: string
  unlocked: boolean
  icon: string
  unlockedAt?: string
}

export type Challenge = {
  id: string
  title: string
  description: string
  game: string
  requirement: string
  rewardCoins: number
  completed: boolean
  completedAt?: string
  expiresAt: string
}

export type SessionStats = {
  totalPlays: number
  totalTime: number
  badgesUnlocked: number
  challengesCompleted: number
  totalCoins: number
  dailyLogs: {
    [date: string]: {
      gamesPlayed: number
      timeSpent: number
      coinsEarned: number
    }
  }
}

export type GameData = {
  gameProgress: GameProgress
  badges: Badge[]
  challenges: Challenge[]
  sessionStats: SessionStats
}

// Import all the badge data
import { allBadges } from "@/data/badges"
import { dailyChallenges } from "@/data/challenges"

const defaultGameData: GameData = {
  gameProgress: {
    "rock-paper-scissors": { wins: 0, losses: 0, draws: 0, plays: 0 },
    "number-guess": { plays: 0, bestScore: 0, score: 0 },
    "dice-roller": { plays: 0 },
    "memory-match": { plays: 0, bestScore: 0, level: 1 },
    "trivia-quiz": { plays: 0, score: 0, bestScore: 0 },
    "word-unscramble": { plays: 0, solved: 0, hintsUsed: 0 },
    "grid-puzzle": { plays: 0, bestMoves: 0, bestTime: 0 },
    "idle-clicker": { coins: 0, cps: 0, clicks: 0 },
    "card-battle": { wins: 0, losses: 0, plays: 0 },
    "reaction-speed": { plays: 0, bestTime: 0 },
  },
  badges: allBadges,
  challenges: dailyChallenges,
  sessionStats: {
    totalPlays: 0,
    totalTime: 0,
    badgesUnlocked: 0,
    challengesCompleted: 0,
    totalCoins: 0,
    dailyLogs: {},
  },
}

type GameDataContextType = {
  gameData: GameData
  updateGameProgress: (game: string, data: any) => void
  unlockBadge: (badgeId: string) => void
  completeChallenge: (challengeId: string) => void
  resetGameData: () => void
  checkAndUnlockBadges: () => void
  checkAndCompleteChallenge: () => void
  incrementGamePlays: (game: string) => void
  refreshDailyChallenges: () => void
}

const GameDataContext = createContext<GameDataContextType | undefined>(undefined)

export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const [gameData, setGameData] = useState<GameData>(defaultGameData)
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

  // Load data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("gameverse-data")
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)

          // Ensure all badges from allBadges are present
          const existingBadgeIds = new Set(parsedData.badges.map((b: Badge) => b.id))
          const missingBadges = allBadges.filter((b) => !existingBadgeIds.has(b.id))

          if (missingBadges.length > 0) {
            parsedData.badges = [...parsedData.badges, ...missingBadges]
          }

          // Ensure all challenges are present and refresh if needed
          parsedData.challenges = refreshChallenges(parsedData.challenges || [])

          setGameData(parsedData)
        } catch (error) {
          console.error("Error parsing saved game data:", error)
          setGameData(defaultGameData)
        }
      } else {
        // Initialize with default data
        setGameData(defaultGameData)
      }
      setIsLoaded(true)
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("gameverse-data", JSON.stringify(gameData))
    }
  }, [gameData, isLoaded])

  // Update today's stats
  useEffect(() => {
    if (isLoaded) {
      const today = new Date().toISOString().split("T")[0]
      if (!gameData.sessionStats.dailyLogs[today]) {
        setGameData((prev) => ({
          ...prev,
          sessionStats: {
            ...prev.sessionStats,
            dailyLogs: {
              ...prev.sessionStats.dailyLogs,
              [today]: {
                gamesPlayed: 0,
                timeSpent: 0,
                coinsEarned: 0,
              },
            },
          },
        }))
      }
    }
  }, [gameData.sessionStats.dailyLogs, isLoaded])

  // Function to refresh challenges
  const refreshChallenges = (currentChallenges: Challenge[]): Challenge[] => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if challenges need to be refreshed
    const needsRefresh = currentChallenges.length === 0 || new Date(currentChallenges[0].expiresAt) < today

    if (needsRefresh) {
      // Generate new challenges with tomorrow as expiration
      return dailyChallenges.map((challenge) => ({
        ...challenge,
        completed: false,
        completedAt: undefined,
        expiresAt: tomorrow.toISOString(),
      }))
    }

    return currentChallenges
  }

  const refreshDailyChallenges = () => {
    setGameData((prev) => ({
      ...prev,
      challenges: refreshChallenges([]),
    }))

    toast({
      title: "Challenges Refreshed",
      description: "New daily challenges are now available!",
      duration: 3000,
    })
  }

  const updateGameProgress = (game: string, data: any) => {
    setGameData((prev) => ({
      ...prev,
      gameProgress: {
        ...prev.gameProgress,
        [game]: {
          ...prev.gameProgress[game],
          ...data,
        },
      },
    }))
  }

  const unlockBadge = (badgeId: string) => {
    const badge = gameData.badges.find((b) => b.id === badgeId)
    if (badge && !badge.unlocked) {
      setGameData((prev) => ({
        ...prev,
        badges: prev.badges.map((b) =>
          b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b,
        ),
        sessionStats: {
          ...prev.sessionStats,
          badgesUnlocked: prev.sessionStats.badgesUnlocked + 1,
        },
      }))

      toast({
        title: "Badge Unlocked!",
        description: `You've earned the "${badge.title}" badge!`,
        duration: 5000,
      })
    }
  }

  const completeChallenge = (challengeId: string) => {
    const challenge = gameData.challenges.find((c) => c.id === challengeId)
    if (challenge && !challenge.completed) {
      const rewardCoins = challenge.rewardCoins

      setGameData((prev) => {
        const today = new Date().toISOString().split("T")[0]

        return {
          ...prev,
          challenges: prev.challenges.map((c) =>
            c.id === challengeId ? { ...c, completed: true, completedAt: new Date().toISOString() } : c,
          ),
          sessionStats: {
            ...prev.sessionStats,
            challengesCompleted: prev.sessionStats.challengesCompleted + 1,
            totalCoins: prev.sessionStats.totalCoins + rewardCoins,
            dailyLogs: {
              ...prev.sessionStats.dailyLogs,
              [today]: {
                ...prev.sessionStats.dailyLogs[today],
                coinsEarned: (prev.sessionStats.dailyLogs[today]?.coinsEarned || 0) + rewardCoins,
              },
            },
          },
        }
      })

      toast({
        title: "Challenge Completed!",
        description: `You've completed "${challenge.title}" and earned ${rewardCoins} coins!`,
        duration: 5000,
      })
    }
  }

  const resetGameData = () => {
    setGameData(defaultGameData)
    toast({
      title: "Data Reset",
      description: "All game progress and badges have been reset.",
      duration: 3000,
    })
  }

  const checkAndUnlockBadges = () => {
    // Check all badges against current progress
    gameData.badges.forEach((badge) => {
      if (!badge.unlocked) {
        const game = badge.game
        const stats = gameData.gameProgress[game]

        // Skip if no stats or not a specific game badge
        if (!stats && game !== "all") return

        let shouldUnlock = false

        // Game-specific badge checks
        switch (badge.id) {
          // Rock Paper Scissors badges
          case "rps_novice":
            shouldUnlock = (stats?.wins || 0) >= 3
            break
          case "rps_intermediate":
            shouldUnlock = (stats?.wins || 0) >= 10
            break
          case "rps_advanced":
            shouldUnlock = (stats?.wins || 0) >= 25
            break
          case "rps_expert":
            shouldUnlock = (stats?.wins || 0) >= 50
            break
          case "rps_master":
            shouldUnlock = (stats?.wins || 0) >= 100
            break
          case "rps_streak_3":
            shouldUnlock = localStorage.getItem("rps-streak")
              ? Number.parseInt(localStorage.getItem("rps-streak") || "0") >= 3
              : false
            break
          case "rps_streak_5":
            shouldUnlock = localStorage.getItem("rps-streak")
              ? Number.parseInt(localStorage.getItem("rps-streak") || "0") >= 5
              : false
            break
          case "rps_streak_10":
            shouldUnlock = localStorage.getItem("rps-streak")
              ? Number.parseInt(localStorage.getItem("rps-streak") || "0") >= 10
              : false
            break
          case "rps_plays_50":
            shouldUnlock = (stats?.plays || 0) >= 50
            break
          case "rps_plays_100":
            shouldUnlock = (stats?.plays || 0) >= 100
            break

          // Number Guess badges
          case "guess_novice":
            shouldUnlock = (stats?.plays || 0) >= 3
            break
          case "guess_intermediate":
            shouldUnlock = (stats?.plays || 0) >= 10
            break
          case "guess_advanced":
            shouldUnlock = (stats?.plays || 0) >= 25
            break
          case "guess_expert":
            shouldUnlock = (stats?.bestScore || 999) <= 5
            break
          case "guess_master":
            shouldUnlock = (stats?.bestScore || 999) <= 3
            break
          case "guess_plays_50":
            shouldUnlock = (stats?.plays || 0) >= 50
            break
          case "guess_plays_100":
            shouldUnlock = (stats?.plays || 0) >= 100
            break
          case "guess_perfect":
            shouldUnlock = (stats?.bestScore || 999) === 1
            break
          case "guess_persistent":
            shouldUnlock = (stats?.plays || 0) >= 5 && (stats?.bestScore || 999) <= 7
            break
          case "guess_lucky":
            shouldUnlock = (stats?.bestScore || 999) <= 2
            break

          // Memory Match badges
          case "memory_novice":
            shouldUnlock = (stats?.level || 0) >= 1
            break
          case "memory_intermediate":
            shouldUnlock = (stats?.level || 0) >= 2
            break
          case "memory_advanced":
            shouldUnlock = (stats?.level || 0) >= 3
            break
          case "memory_expert":
            shouldUnlock = (stats?.level || 0) >= 4
            break
          case "memory_master":
            shouldUnlock = (stats?.level || 0) >= 4 && (stats?.bestScore || 999) <= 20
            break
          case "memory_quick":
            shouldUnlock = (stats?.bestScore || 999) <= 15
            break
          case "memory_efficient":
            shouldUnlock = (stats?.bestScore || 999) <= 12
            break
          case "memory_plays_25":
            shouldUnlock = (stats?.plays || 0) >= 25
            break
          case "memory_plays_50":
            shouldUnlock = (stats?.plays || 0) >= 50
            break
          case "memory_perfect":
            shouldUnlock = (stats?.level || 0) >= 4 && (stats?.bestScore || 999) <= 16
            break

          // Trivia Quiz badges
          case "trivia_novice":
            shouldUnlock = (stats?.score || 0) >= 3
            break
          case "trivia_intermediate":
            shouldUnlock = (stats?.score || 0) >= 5
            break
          case "trivia_advanced":
            shouldUnlock = (stats?.bestScore || 0) >= 5
            break
          case "trivia_expert":
            shouldUnlock = (stats?.bestScore || 0) >= 5 && (stats?.plays || 0) >= 10
            break
          case "trivia_master":
            shouldUnlock = (stats?.bestScore || 0) >= 5 && (stats?.plays || 0) >= 25
            break
          case "trivia_perfect":
            shouldUnlock = (stats?.bestScore || 0) >= 5 && (stats?.plays || 0) >= 5
            break
          case "trivia_quick":
            shouldUnlock = (stats?.bestScore || 0) >= 4 && (stats?.plays || 0) >= 3
            break
          case "trivia_plays_25":
            shouldUnlock = (stats?.plays || 0) >= 25
            break
          case "trivia_plays_50":
            shouldUnlock = (stats?.plays || 0) >= 50
            break
          case "trivia_knowledgeable":
            shouldUnlock = (stats?.bestScore || 0) >= 4 && (stats?.plays || 0) >= 15
            break

          // Word Unscramble badges
          case "word_novice":
            shouldUnlock = (stats?.solved || 0) >= 3
            break
          case "word_intermediate":
            shouldUnlock = (stats?.solved || 0) >= 10
            break
          case "word_advanced":
            shouldUnlock = (stats?.solved || 0) >= 25
            break
          case "word_expert":
            shouldUnlock = (stats?.solved || 0) >= 50
            break
          case "word_master":
            shouldUnlock = (stats?.solved || 0) >= 100
            break
          case "word_no_hints":
            shouldUnlock = (stats?.solved || 0) >= 10 && (stats?.hintsUsed || 0) === 0
            break
          case "word_efficient":
            shouldUnlock = (stats?.solved || 0) >= 20 && (stats?.hintsUsed || 0) <= 5
            break
          case "word_plays_25":
            shouldUnlock = (stats?.plays || 0) >= 25
            break
          case "word_plays_50":
            shouldUnlock = (stats?.plays || 0) >= 50
            break
          case "word_vocabulary":
            shouldUnlock = (stats?.solved || 0) >= 30
            break

          // Grid Puzzle badges
          case "puzzle_novice":
            shouldUnlock = (stats?.plays || 0) >= 1
            break
          case "puzzle_intermediate":
            shouldUnlock = (stats?.plays || 0) >= 5
            break
          case "puzzle_advanced":
            shouldUnlock = (stats?.plays || 0) >= 15
            break
          case "puzzle_expert":
            shouldUnlock = (stats?.bestMoves || 999) <= 50
            break
          case "puzzle_master":
            shouldUnlock = (stats?.bestMoves || 999) <= 30
            break
          case "puzzle_quick":
            shouldUnlock = (stats?.bestTime || 9999) <= 60
            break
          case "puzzle_efficient":
            shouldUnlock = (stats?.bestMoves || 999) <= 40
            break
          case "puzzle_plays_25":
            shouldUnlock = (stats?.plays || 0) >= 25
            break
          case "puzzle_plays_50":
            shouldUnlock = (stats?.plays || 0) >= 50
            break
          case "puzzle_speed_demon":
            shouldUnlock = (stats?.bestTime || 9999) <= 45
            break

          // Idle Clicker badges
          case "clicker_novice":
            shouldUnlock = (stats?.coins || 0) >= 100
            break
          case "clicker_intermediate":
            shouldUnlock = (stats?.coins || 0) >= 500
            break
          case "clicker_advanced":
            shouldUnlock = (stats?.coins || 0) >= 1000
            break
          case "clicker_expert":
            shouldUnlock = (stats?.coins || 0) >= 5000
            break
          case "clicker_master":
            shouldUnlock = (stats?.coins || 0) >= 10000
            break
          case "clicker_clicks_100":
            shouldUnlock = (stats?.clicks || 0) >= 100
            break
          case "clicker_clicks_500":
            shouldUnlock = (stats?.clicks || 0) >= 500
            break
          case "clicker_cps_10":
            shouldUnlock = (stats?.cps || 0) >= 10
            break
          case "clicker_cps_50":
            shouldUnlock = (stats?.cps || 0) >= 50
            break
          case "clicker_cps_100":
            shouldUnlock = (stats?.cps || 0) >= 100
            break

          // Card Battle badges
          case "battle_novice":
            shouldUnlock = (stats?.wins || 0) >= 3
            break
          case "battle_intermediate":
            shouldUnlock = (stats?.wins || 0) >= 10
            break
          case "battle_advanced":
            shouldUnlock = (stats?.wins || 0) >= 25
            break
          case "battle_expert":
            shouldUnlock = (stats?.wins || 0) >= 50
            break
          case "battle_master":
            shouldUnlock = (stats?.wins || 0) >= 100
            break
          case "battle_strategist":
            shouldUnlock = (stats?.wins || 0) >= 15 && (stats?.losses || 0) <= 5
            break
          case "battle_comeback":
            shouldUnlock = (stats?.wins || 0) >= 10 && (stats?.losses || 0) >= 10
            break
          case "battle_plays_25":
            shouldUnlock = (stats?.plays || 0) >= 25
            break
          case "battle_plays_50":
            shouldUnlock = (stats?.plays || 0) >= 50
            break
          case "battle_undefeated":
            shouldUnlock = (stats?.wins || 0) >= 5 && (stats?.losses || 0) === 0
            break

          // Reaction Speed badges
          case "reaction_novice":
            shouldUnlock = (stats?.bestTime || 9999) <= 500
            break
          case "reaction_intermediate":
            shouldUnlock = (stats?.bestTime || 9999) <= 400
            break
          case "reaction_advanced":
            shouldUnlock = (stats?.bestTime || 9999) <= 300
            break
          case "reaction_expert":
            shouldUnlock = (stats?.bestTime || 9999) <= 250
            break
          case "reaction_master":
            shouldUnlock = (stats?.bestTime || 9999) <= 200
            break
          case "reaction_lightning":
            shouldUnlock = (stats?.bestTime || 9999) <= 180
            break
          case "reaction_superhuman":
            shouldUnlock = (stats?.bestTime || 9999) <= 150
            break
          case "reaction_plays_25":
            shouldUnlock = (stats?.plays || 0) >= 25
            break
          case "reaction_plays_50":
            shouldUnlock = (stats?.plays || 0) >= 50
            break
          case "reaction_consistent":
            shouldUnlock = (stats?.plays || 0) >= 10 && (stats?.bestTime || 9999) <= 300
            break

          // Special badges (across all games)
          case "gameverse_novice":
            shouldUnlock = Object.values(gameData.gameProgress).filter((g) => g.plays && g.plays > 0).length >= 3
            break
          case "gameverse_intermediate":
            shouldUnlock = Object.values(gameData.gameProgress).filter((g) => g.plays && g.plays > 0).length >= 5
            break
          case "gameverse_advanced":
            shouldUnlock = Object.values(gameData.gameProgress).filter((g) => g.plays && g.plays > 0).length >= 7
            break
          case "gameverse_expert":
            shouldUnlock = Object.values(gameData.gameProgress).filter((g) => g.plays && g.plays > 0).length >= 9
            break
          case "gameverse_master":
            shouldUnlock = Object.values(gameData.gameProgress).filter((g) => g.plays && g.plays > 0).length >= 10
            break
          case "gameverse_addict":
            shouldUnlock = Object.values(gameData.gameProgress).reduce((sum, g) => sum + (g.plays || 0), 0) >= 100
            break
          case "badge_collector_bronze":
            shouldUnlock = gameData.badges.filter((b) => b.unlocked).length >= 10
            break
          case "badge_collector_silver":
            shouldUnlock = gameData.badges.filter((b) => b.unlocked).length >= 25
            break
          case "badge_collector_gold":
            shouldUnlock = gameData.badges.filter((b) => b.unlocked).length >= 50
            break
          case "badge_collector_platinum":
            shouldUnlock = gameData.badges.filter((b) => b.unlocked).length >= 75
            break
          case "challenge_master":
            shouldUnlock = gameData.sessionStats.challengesCompleted >= 25
            break
        }

        if (shouldUnlock) {
          unlockBadge(badge.id)
        }
      }
    })
  }

  const checkAndCompleteChallenge = () => {
    // Check all challenges against current progress
    gameData.challenges.forEach((challenge) => {
      if (!challenge.completed) {
        const game = challenge.game
        const stats = gameData.gameProgress[game]

        // Skip if no stats or not a specific game challenge
        if (!stats && game !== "all") return

        let shouldComplete = false

        // Check if the challenge requirement is met based on the challenge ID
        switch (challenge.id) {
          // Rock Paper Scissors challenges
          case "rps_daily_win_3":
            shouldComplete = (stats?.wins || 0) >= 3
            break
          case "rps_daily_play_5":
            shouldComplete = (stats?.plays || 0) >= 5
            break

          // Number Guess challenges
          case "guess_daily_win":
            shouldComplete = (stats?.plays || 0) >= 1 && (stats?.score || 0) > 0
            break
          case "guess_daily_under_5":
            shouldComplete = (stats?.bestScore || 999) <= 5
            break

          // Memory Match challenges
          case "memory_daily_complete":
            shouldComplete = (stats?.plays || 0) >= 1
            break
          case "memory_daily_level_2":
            shouldComplete = (stats?.level || 0) >= 2
            break

          // Trivia Quiz challenges
          case "trivia_daily_score_3":
            shouldComplete = (stats?.score || 0) >= 3
            break
          case "trivia_daily_perfect":
            shouldComplete = (stats?.score || 0) >= 5
            break

          // Word Unscramble challenges
          case "word_daily_solve_3":
            shouldComplete = (stats?.solved || 0) >= 3
            break
          case "word_daily_no_hints":
            shouldComplete = (stats?.solved || 0) >= 1 && (stats?.hintsUsed || 0) === 0
            break

          // Grid Puzzle challenges
          case "puzzle_daily_complete":
            shouldComplete = (stats?.plays || 0) >= 1
            break
          case "puzzle_daily_under_50":
            shouldComplete = (stats?.bestMoves || 999) <= 50
            break

          // Idle Clicker challenges
          case "clicker_daily_100":
            shouldComplete = (stats?.coins || 0) >= 100
            break
          case "clicker_daily_clicks_50":
            shouldComplete = (stats?.clicks || 0) >= 50
            break

          // Card Battle challenges
          case "battle_daily_win":
            shouldComplete = (stats?.wins || 0) >= 1
            break
          case "battle_daily_win_3":
            shouldComplete = (stats?.wins || 0) >= 3
            break

          // Reaction Speed challenges
          case "reaction_daily_under_400":
            shouldComplete = (stats?.bestTime || 9999) <= 400
            break
          case "reaction_daily_play_5":
            shouldComplete = (stats?.plays || 0) >= 5
            break

          // Special challenges
          case "daily_play_3_games":
            shouldComplete = Object.values(gameData.gameProgress).filter((g) => g.plays && g.plays > 0).length >= 3
            break
          case "daily_play_5_games":
            shouldComplete = Object.values(gameData.gameProgress).filter((g) => g.plays && g.plays > 0).length >= 5
            break
          case "daily_total_plays_10":
            shouldComplete = Object.values(gameData.gameProgress).reduce((sum, g) => sum + (g.plays || 0), 0) >= 10
            break
          case "daily_unlock_badge":
            shouldComplete = gameData.sessionStats.badgesUnlocked > 0
            break
          case "daily_complete_5_challenges":
            shouldComplete = gameData.challenges.filter((c) => c.completed).length >= 5
            break
        }

        if (shouldComplete) {
          completeChallenge(challenge.id)
        }
      }
    })
  }

  const incrementGamePlays = (game: string) => {
    const today = new Date().toISOString().split("T")[0]

    setGameData((prev) => ({
      ...prev,
      gameProgress: {
        ...prev.gameProgress,
        [game]: {
          ...prev.gameProgress[game],
          plays: (prev.gameProgress[game]?.plays || 0) + 1,
        },
      },
      sessionStats: {
        ...prev.sessionStats,
        totalPlays: prev.sessionStats.totalPlays + 1,
        dailyLogs: {
          ...prev.sessionStats.dailyLogs,
          [today]: {
            ...prev.sessionStats.dailyLogs[today],
            gamesPlayed: (prev.sessionStats.dailyLogs[today]?.gamesPlayed || 0) + 1,
          },
        },
      },
    }))
  }

  return (
    <GameDataContext.Provider
      value={{
        gameData,
        updateGameProgress,
        unlockBadge,
        completeChallenge,
        resetGameData,
        checkAndUnlockBadges,
        checkAndCompleteChallenge,
        incrementGamePlays,
        refreshDailyChallenges,
      }}
    >
      {children}
    </GameDataContext.Provider>
  )
}

export function useGameData() {
  const context = useContext(GameDataContext)
  if (context === undefined) {
    throw new Error("useGameData must be used within a GameDataProvider")
  }
  return context
}
