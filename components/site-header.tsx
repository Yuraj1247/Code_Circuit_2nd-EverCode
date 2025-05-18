"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Award, BarChart2, Calendar, Gamepad2, Home, Info, Menu, Settings, X } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { ChatbotToggle } from "@/components/chatbot-toggle"

interface SiteHeaderProps {
  permissionStatus?: string | null
  onPermissionChange?: (status: string) => void
}

export function SiteHeader({ permissionStatus, onPermissionChange }: SiteHeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200",
        scrolled && "shadow-sm",
      )}
    >
      <div className=" container flex h-16 items-center justify-between">
        <div className=" flex items-center gap-2 md:gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Gamepad2 className="h-6 w-6 text-primary" />
            <span className=" font-bold sm:inline-block">GameVerse</span>
          </Link>
          <nav className="hidden md:flex md:gap-6">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-foreground/80",
                  pathname === item.href ? "text-foreground" : "text-foreground/60",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ChatbotToggle permissionStatus={permissionStatus} onPermissionChange={onPermissionChange} />
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu with Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-background shadow-xl md:hidden"
            >
              <div className=" bg-purple-800 flex h-16 items-center justify-between border-b px-6">
                <Link href="/" className="flex items-center space-x-2">
                  <Gamepad2 className="h-6 w-6 text-primary" />
                  <span className="font-bold">GameVerse</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollableNavigation />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

function ScrollableNavigation() {
  const pathname = usePathname()

  return (
    <div className="h-[calc(100vh-4rem)] bg-purple-700 overflow-y-auto pb-8">
      <nav className="space-y-1 p-4">
        {mobileNavItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition-colors hover:bg-muted",
              pathname === item.href ? "bg-muted text-foreground" : "text-foreground/70",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 border-t px-4 pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">© 2025 GameVerse</p>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "Games", href: "/games" },
  { label: "Daily Challenges", href: "/daily-challenges" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Badges", href: "/badges" },
  { label: "About", href: "/about" },
]

const mobileNavItems = [
  { label: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
  { label: "Games", href: "/games", icon: <Gamepad2 className="h-5 w-5" /> },
  { label: "Daily Challenges", href: "/daily-challenges", icon: <Calendar className="h-5 w-5" /> },
  { label: "Dashboard", href: "/dashboard", icon: <BarChart2 className="h-5 w-5" /> },
  { label: "Badges", href: "/badges", icon: <Award className="h-5 w-5" /> },
  { label: "About", href: "/about", icon: <Info className="h-5 w-5" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
]
