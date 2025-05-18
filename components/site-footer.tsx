import Link from "next/link"
import { Gamepad2, Github } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Gamepad2 className="h-5 w-5 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js, Tailwind CSS, and LocalStorage. No sign-up required.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4">
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              About
            </Link>
            <Link
              href="/games"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              Games
            </Link>
            <Link
              href="/settings"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
            >
              Settings
            </Link>
          </nav>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
