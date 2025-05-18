"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGameData } from "@/components/game-data-provider"
import { CHART_COLORS } from "@/constants/chartColors" // Declare CHART_COLORS

export default function DashboardPage() {
  const { gameData } = useGameData()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Loading your gaming statistics...</p>
      </div>
    )
  }

  // Calculate total games played
  const totalPlays = gameData.sessionStats.totalPlays

  // Calculate badge progress
  const totalBadges = gameData.badges.length
  const unlockedBadges = gameData.badges.filter((badge) => badge.unlocked).length
  const badgeProgress = totalBadges > 0 ? (unlockedBadges / totalBadges) * 100 : 0

  // Calculate challenge progress
  const totalChallenges = gameData.challenges.length
  const completedChallenges = gameData.challenges.filter((c) => c.completed).length
  const challengeProgress = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0

  // Prepare data for pie chart - games played distribution
  const gamesPlayedData = Object.entries(gameData.gameProgress)
    .map(([game, stats]) => ({
      name: formatGameName(game),
      value: stats.plays || 0,
    }))
    .filter((item) => item.value > 0)

  // Prepare data for bar chart - wins per game
  const winsData = Object.entries(gameData.gameProgress)
    .filter(([_, stats]) => stats.wins !== undefined)
    .map(([game, stats]) => ({
      name: formatGameName(game),
      wins: stats.wins || 0,
    }))
    .filter((item) => item.wins > 0)

  // Prepare data for line chart - daily activity
  const dailyData = Object.entries(gameData.sessionStats.dailyLogs)
    .map(([date, stats]) => ({
      date: formatDate(date),
      games: stats.gamesPlayed || 0,
      time: stats.timeSpent || 0,
      coins: stats.coinsEarned || 0,
    }))
    .slice(-7) // Last 7 days

  // Prepare data for radar chart - time spent per game
  const timeSpentData = Object.entries(gameData.gameProgress)
    .map(([game, stats]) => ({
      name: formatGameName(game),
      value: stats.timeSpent || 0,
    }))
    .filter((item) => item.value > 0)

  // Prepare data for performance metrics
  const performanceData = [
    {
      name: "Reaction Speed",
      value: gameData.gameProgress["reaction-speed"]?.bestTime
        ? Math.max(0, 100 - gameData.gameProgress["reaction-speed"].bestTime / 5)
        : 0,
      fill: "#3b82f6",
    },
    {
      name: "Memory Match",
      value: gameData.gameProgress["memory-match"]?.level ? gameData.gameProgress["memory-match"].level * 25 : 0,
      fill: "#10b981",
    },
    {
      name: "RPS Win Rate",
      value:
        gameData.gameProgress["rock-paper-scissors"]?.plays && gameData.gameProgress["rock-paper-scissors"]?.wins
          ? (gameData.gameProgress["rock-paper-scissors"].wins / gameData.gameProgress["rock-paper-scissors"].plays) *
            100
          : 0,
      fill: "#f59e0b",
    },
    {
      name: "Trivia Score",
      value: gameData.gameProgress["trivia-quiz"]?.bestScore ? gameData.gameProgress["trivia-quiz"].bestScore * 20 : 0,
      fill: "#ef4444",
    },
    {
      name: "Card Battle Win Rate",
      value:
        gameData.gameProgress["card-battle"]?.plays && gameData.gameProgress["card-battle"]?.wins
          ? (gameData.gameProgress["card-battle"].wins / gameData.gameProgress["card-battle"].plays) * 100
          : 0,
      fill: "#8b5cf6",
    },
  ].filter((item) => item.value > 0)

  return (
    <div className="container py-10">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
        <p className="text-muted-foreground">Track your gaming progress and statistics across all games.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Games Played</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlays}</div>
            <p className="text-xs text-muted-foreground">Across all game types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Badges Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unlockedBadges}/{totalBadges}
            </div>
            <Progress value={badgeProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Challenges Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedChallenges}/{totalChallenges}
            </div>
            <Progress value={challengeProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gameData.sessionStats.totalCoins}</div>
            <p className="text-xs text-muted-foreground">Earned from challenges</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="mt-6">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Games Played Distribution</CardTitle>
                <CardDescription>Breakdown of your gaming activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {gamesPlayedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gamesPlayedData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {gamesPlayedData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Play some games to see data here
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wins Per Game</CardTitle>
                <CardDescription>Your victories across competitive games</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {winsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={winsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="wins" fill="#3b82f6">
                          {winsData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Win some games to see data here
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>Your gaming activity over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="games"
                        stroke="#3b82f6"
                        name="Games Played"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="coins"
                        stroke="#f59e0b"
                        name="Coins Earned"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Play games over multiple days to see trends
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Your skill level across different games</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="10%"
                        outerRadius="80%"
                        barSize={10}
                        data={performanceData}
                      >
                        <RadialBar
                          minAngle={15}
                          label={{ position: "insideStart", fill: "#fff" }}
                          background
                          clockWise
                          dataKey="value"
                        />
                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                        <Tooltip />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Play more games to see performance metrics
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Mastery Progress</CardTitle>
                <CardDescription>Your progress towards mastering each game</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(gameData.gameProgress)
                    .filter(([_, stats]) => stats.plays && stats.plays > 0)
                    .map(([game, stats]) => {
                      // Calculate mastery percentage based on game type
                      let masteryPercentage = 0

                      if (game === "rock-paper-scissors") {
                        masteryPercentage = Math.min(100, ((stats.wins || 0) / 100) * 100)
                      } else if (game === "number-guess") {
                        const bestScore = stats.bestScore || 999
                        masteryPercentage = bestScore <= 3 ? 100 : bestScore <= 5 ? 75 : bestScore <= 7 ? 50 : 25
                      } else if (game === "memory-match") {
                        masteryPercentage = Math.min(100, ((stats.level || 0) / 4) * 100)
                      } else if (game === "trivia-quiz") {
                        masteryPercentage = Math.min(100, ((stats.bestScore || 0) / 5) * 100)
                      } else if (game === "word-unscramble") {
                        masteryPercentage = Math.min(100, ((stats.solved || 0) / 30) * 100)
                      } else if (game === "grid-puzzle") {
                        const bestMoves = stats.bestMoves || 999
                        masteryPercentage = bestMoves <= 30 ? 100 : bestMoves <= 40 ? 75 : bestMoves <= 50 ? 50 : 25
                      } else if (game === "idle-clicker") {
                        masteryPercentage = Math.min(100, ((stats.coins || 0) / 5000) * 100)
                      } else if (game === "card-battle") {
                        masteryPercentage = Math.min(100, ((stats.wins || 0) / 50) * 100)
                      } else if (game === "reaction-speed") {
                        const bestTime = stats.bestTime || 999
                        masteryPercentage =
                          bestTime <= 200
                            ? 100
                            : bestTime <= 250
                              ? 75
                              : bestTime <= 300
                                ? 50
                                : bestTime <= 400
                                  ? 25
                                  : 10
                      } else {
                        masteryPercentage = Math.min(100, ((stats.plays || 0) / 20) * 100)
                      }

                      return (
                        <div key={game}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium">{formatGameName(game)}</span>
                            <span className="text-xs text-muted-foreground">{Math.round(masteryPercentage)}%</span>
                          </div>
                          <Progress value={masteryPercentage} className="h-2" />
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Achievement Progress</CardTitle>
              <CardDescription>Your progress towards unlocking all achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(gameData.gameProgress)
                  .filter(([_, stats]) => stats.plays && stats.plays > 0)
                  .map(([game, _]) => {
                    // Count badges for this game
                    const gameBadges = gameData.badges.filter((b) => b.game === game)
                    const unlockedGameBadges = gameBadges.filter((b) => b.unlocked)
                    const badgePercentage =
                      gameBadges.length > 0 ? (unlockedGameBadges.length / gameBadges.length) * 100 : 0

                    return (
                      <div key={game} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium">{formatGameName(game)}</span>
                          <span className="text-sm text-muted-foreground">
                            {unlockedGameBadges.length}/{gameBadges.length} badges
                          </span>
                        </div>
                        <Progress value={badgePercentage} className="h-2" />
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Game Statistics</CardTitle>
              <CardDescription>Your performance across all games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.entries(gameData.gameProgress)
                  .filter(([_, stats]) => stats.plays && stats.plays > 0)
                  .map(([game, stats]) => (
                    <div key={game}>
                      <h3 className="mb-2 text-lg font-semibold">{formatGameName(game)}</h3>
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <div className="rounded-lg bg-muted p-3">
                          <div className="text-sm text-muted-foreground">Plays</div>
                          <div className="text-lg font-medium">{stats.plays}</div>
                        </div>

                        {stats.wins !== undefined && (
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm text-muted-foreground">Wins</div>
                            <div className="text-lg font-medium">{stats.wins}</div>
                          </div>
                        )}

                        {stats.losses !== undefined && (
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm text-muted-foreground">Losses</div>
                            <div className="text-lg font-medium">{stats.losses}</div>
                          </div>
                        )}

                        {stats.wins !== undefined && stats.plays !== undefined && (
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm text-muted-foreground">Win Rate</div>
                            <div className="text-lg font-medium">
                              {stats.plays > 0 ? `${Math.round((stats.wins / stats.plays) * 100)}%` : "0%"}
                            </div>
                          </div>
                        )}

                        {stats.bestScore !== undefined && (
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm text-muted-foreground">Best Score</div>
                            <div className="text-lg font-medium">{stats.bestScore}</div>
                          </div>
                        )}

                        {stats.bestTime !== undefined && (
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm text-muted-foreground">Best Time</div>
                            <div className="text-lg font-medium">
                              {game === "reaction-speed"
                                ? `${stats.bestTime}ms`
                                : `${Math.floor(stats.bestTime / 60)}:${(stats.bestTime % 60).toString().padStart(2, "0")}`}
                            </div>
                          </div>
                        )}

                        {stats.solved !== undefined && (
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm text-muted-foreground">Words Solved</div>
                            <div className="text-lg font-medium">{stats.solved}</div>
                          </div>
                        )}

                        {stats.coins !== undefined && (
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm text-muted-foreground">Coins Earned</div>
                            <div className="text-lg font-medium">{stats.coins}</div>
                          </div>
                        )}

                        {stats.cps !== undefined && (
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm text-muted-foreground">Coins Per Second</div>
                            <div className="text-lg font-medium">{stats.cps}</div>
                          </div>
                        )}

                        {stats.clicks !== undefined && (
                          <div className="rounded-lg bg-muted p-3">
                            <div className="text-sm text-muted-foreground">Total Clicks</div>
                            <div className="text-lg font-medium">{stats.clicks}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions
function formatGameName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getMostPlayedGame(gameProgress: any): string {
  let mostPlayed = ""
  let maxPlays = 0

  Object.entries(gameProgress).forEach(([game, stats]: [string, any]) => {
    if (stats.plays && stats.plays > maxPlays) {
      maxPlays = stats.plays
      mostPlayed = game
    }
  })

  return maxPlays > 0 ? formatGameName(mostPlayed) : "None yet"
}

function getBestPerformance(gameProgress: any): string {
  // Check for best win rate in competitive games
  let bestGame = ""
  let bestMetric = 0

  // First check win rates
  Object.entries(gameProgress).forEach(([game, stats]: [string, any]) => {
    if (stats.wins && stats.plays) {
      const winRate = stats.wins / stats.plays
      if (winRate > bestMetric) {
        bestMetric = winRate
        bestGame = `${formatGameName(game)} (${Math.round(winRate * 100)}% win rate)`
      }
    }
  })

  // If no win rates, check other metrics
  if (bestGame === "") {
    Object.entries(gameProgress).forEach(([game, stats]: [string, any]) => {
      if (game === "reaction-speed" && stats.bestTime) {
        const timeMetric = Math.max(0, 100 - stats.bestTime / 5)
        if (timeMetric > bestMetric) {
          bestMetric = timeMetric
          bestGame = `${formatGameName(game)} (${Math.round(timeMetric)}% speed)`
        }
      } else if (game === "memory-match" && stats.level) {
        const levelMetric = stats.level * 25
        if (levelMetric > bestMetric) {
          bestMetric = levelMetric
          bestGame = `${formatGameName(game)} (Level ${stats.level})`
        }
      } else if (game === "trivia-quiz" && stats.bestScore) {
        const scoreMetric = stats.bestScore * 20
        if (scoreMetric > bestMetric) {
          bestMetric = scoreMetric
          bestGame = `${formatGameName(game)} (Best Score ${stats.bestScore})`
        }
      } else if (game === "card-battle" && stats.wins && stats.plays) {
        const winRateMetric = (stats.wins / stats.plays) * 100
        if (winRateMetric > bestMetric) {
          bestMetric = winRateMetric
          bestGame = `${formatGameName(game)} (${Math.round(winRateMetric)}% win rate)`
        }
      }
    })
  }

  return bestGame || "No competitive games played yet"
}
