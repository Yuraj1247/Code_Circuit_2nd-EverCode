import type React from "react"
import { Inter } from "next/font/google"
import ClientLayout from "./clientLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "GameVerse - The Ultimate Free Gaming Hub",
  description: "Play 10 addictive mini-games, unlock badges, and track your progress - all in one place.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'