"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Award, CheckCircle2, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGameData } from "@/components/game-data-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function BadgesPage() {
  const { gameData } = useGameData()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredBadges, setFilteredBadges] = useState(gameData.badges)
  const [sortOrder, setSortOrder] = useState<"default" | "newest" | "oldest" | "alphabetical">("default")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = gameData.badges

    // Apply tab filtering
    if (activeTab === "unlocked") {
      filtered = filtered.filter((badge) => badge.unlocked)
    } else if (activeTab === "locked") {
      filtered = filtered.filter((badge) => !badge.unlocked)
    } else if (activeTab !== "all") {
      filtered = filtered.filter((badge) => badge.game === activeTab)
    }

    // Apply search filtering
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (badge) =>
          badge.title.toLowerCase().includes(query) ||
          badge.description.toLowerCase().includes(query) ||
          badge.game.toLowerCase().includes(query) ||
          badge.requirement.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    if (sortOrder === "newest") {
      filtered = [...filtered].sort((a, b) => {
        if (!a.unlocked && !b.unlocked) return 0
        if (!a.unlocked) return 1
        if (!b.unlocked) return -1
        return new Date(b.unlockedAt || "").getTime() - new Date(a.unlockedAt || "").getTime()
      })
    } else if (sortOrder === "oldest") {
      filtered = [...filtered].sort((a, b) => {
        if (!a.unlocked && !b.unlocked) return 0
        if (!a.unlocked) return 1
        if (!b.unlocked) return -1
        return new Date(a.unlockedAt || "").getTime() - new Date(b.unlockedAt || "").getTime()
      })
    } else if (sortOrder === "alphabetical") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    } else {
      // Default sorting: unlocked first, then by game
      filtered = [...filtered].sort((a, b) => {
        if (a.unlocked && !b.unlocked) return -1
        if (!a.unlocked && b.unlocked) return 1
        return a.game.localeCompare(b.game)
      })
    }

    setFilteredBadges(filtered)
  }, [searchQuery, gameData.badges, sortOrder, activeTab])

  if (!mounted) {
    return (
      <div className="container py-10">
        <div className="h-screen animate-pulse">
          <div className="h-8 w-48 rounded-md bg-muted"></div>
          <div className="mt-4 h-4 w-full rounded-md bg-muted"></div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-64 rounded-lg bg-muted"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Group badges by game
  const badgesByGame: Record<string, typeof gameData.badges> = {}

  gameData.badges.forEach((badge) => {
    if (!badgesByGame[badge.game]) {
      badgesByGame[badge.game] = []
    }
    badgesByGame[badge.game].push(badge)
  })

  // Calculate badge stats
  const totalBadges = gameData.badges.length
  const unlockedBadges = gameData.badges.filter((badge) => badge.unlocked).length
  const badgeProgress = totalBadges > 0 ? (unlockedBadges / totalBadges) * 100 : 0

  return (
    <div className="container space-y-6 py-6 md:py-10">
      {/* Hero Section */}
      <div className="relative rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 md:p-8">
        <div className="absolute right-4 top-4 hidden text-9xl opacity-10 md:block">🏆</div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Badge Collection</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Showcase your achievements and track your progress across all games.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {unlockedBadges} of {totalBadges} Badges Unlocked
              </span>
            </div>
            <div className="hidden sm:block">•</div>
            <div>
              <Badge variant="outline" className="bg-primary/10">
                {Math.round(badgeProgress)}% Complete
              </Badge>
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${badgeProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search badges..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder("default")}>
                Default
                {sortOrder === "default" && <CheckCircle2 className="ml-2 h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                Newest First
                {sortOrder === "newest" && <CheckCircle2 className="ml-2 h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                Oldest First
                {sortOrder === "oldest" && <CheckCircle2 className="ml-2 h-4 w-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("alphabetical")}>
                Alphabetical
                {sortOrder === "alphabetical" && <CheckCircle2 className="ml-2 h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs and Badge Grid */}
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="mb-6 border-b">
          <ScrollArea className="pb-3">
            <TabsList className="inline-flex w-max">
              <TabsTrigger value="all" className="rounded-md">
                All Badges
                <Badge variant="outline" className="ml-2 bg-muted">
                  {gameData.badges.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unlocked" className="rounded-md">
                Unlocked
                <Badge variant="outline" className="ml-2 bg-primary/10">
                  {unlockedBadges}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="locked" className="rounded-md">
                Locked
                <Badge variant="outline" className="ml-2 bg-muted">
                  {totalBadges - unlockedBadges}
                </Badge>
              </TabsTrigger>
              {Object.entries(badgesByGame).map(([game, badges]) => (
                <TabsTrigger key={game} value={game} className="rounded-md">
                  {game === "all" ? "Special" : formatGameName(game)}
                  <Badge variant="outline" className="ml-2 bg-muted">
                    {badges.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <BadgeGrid badges={filteredBadges} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BadgeGrid({ badges }: { badges: any[] }) {
  if (badges.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed">
        <Award className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <p className="text-center text-muted-foreground">No badges found matching your criteria</p>
        <p className="mt-1 text-center text-sm text-muted-foreground/70">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {badges.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  )
}

function BadgeCard({ badge }: { badge: any }) {
  return (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }} className="h-full">
      <Card
        className={`group relative h-full overflow-hidden transition-all hover:shadow-md ${
          !badge.unlocked ? "opacity-70 hover:opacity-90" : ""
        }`}
      >
        <div className="relative">
          <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 text-5xl">
            {badge.icon}
          </div>
          {!badge.unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
              <Lock className="h-8 w-8 text-muted-foreground/70" />
            </div>
          )}
          {badge.unlocked && (
            <div className="absolute right-2 top-2 rounded-full bg-primary/20 p-1 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}
        </div>
        <CardContent className="flex flex-col p-3">
          <div className="mb-1 line-clamp-1 font-medium">{badge.title}</div>
          <div className="mb-2 line-clamp-1 text-xs text-muted-foreground">
            {badge.game === "all" ? "Special Badge" : formatGameName(badge.game)}
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{badge.description}</p>
          {badge.unlocked && badge.unlockedAt && (
            <div className="mt-auto pt-2 text-xs text-primary">
              <span className="inline-block rounded-sm bg-primary/10 px-1.5 py-0.5">
                Unlocked {formatDate(badge.unlockedAt)}
              </span>
            </div>
          )}
          {!badge.unlocked && (
            <div className="mt-auto pt-2 text-xs font-medium">
              <span className="inline-block rounded-sm bg-muted px-1.5 py-0.5">{badge.requirement}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

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
