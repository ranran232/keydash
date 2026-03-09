"use client"

import { useState, useEffect, useCallback } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

const electricKeyframes = `
  @keyframes electric-flicker {
    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
      text-shadow: 
        0 0 10px rgba(34, 211, 238, 0.9),
        0 0 20px rgba(34, 211, 238, 0.7),
        0 0 30px rgba(34, 211, 238, 0.5);
      opacity: 1;
    }
    20%, 24%, 55% {
      text-shadow: none;
      opacity: 0.8;
    }
  }
`

interface UserData {
  name?: string
  image?: string
  email?: string
  highestScore?: number
  wpm?: number
}

export default function Header() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const fetchUserData = useCallback(() => {
    if (session?.user?.email) {
      fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setUserData(data)
          }
        })
        .catch(console.error)
    }
  }, [session])

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setUserData(data)
          }
        })
        .catch(console.error)
    }
  }, [session])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.email) {
        fetchUserData()
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [session, fetchUserData])

  useEffect(() => {
    if (profileOpen && session?.user?.email) {
      fetchUserData()
    }
  }, [profileOpen, session, fetchUserData])

  const handleSignOut = () => {
    signOut({ callbackUrl: "/signin" })
  }

  if (status === "loading") {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-zinc-800/50 z-50">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="w-20 h-8 bg-zinc-800 animate-pulse rounded" />
          <div className="w-8 h-8 bg-zinc-800 animate-pulse rounded-full" />
        </div>
      </header>
    )
  }

  if (!session) return null

  return (
    <>
      <style>{electricKeyframes}</style>
      <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-zinc-800/50 z-50">
        <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-bold text-white tracking-tight">K</span>
            <span className="text-xl font-bold text-white tracking-tight">DASH</span>
            <svg 
              className="w-4 h-4 text-cyan-400 -ml-0.5" 
              style={{
                animation: "electric-flicker 0.15s infinite",
                filter: "drop-shadow(0 0 6px rgba(34, 211, 238, 0.9))"
              }} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Leaderboard */}
            <Link
              href="/leaderboard"
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0v14a2 012 2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Leaderboard</span>
            </Link>

            {/* Profile - Clickable */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-3 hover:bg-zinc-800/50 p-1.5 pr-3 rounded-full transition-colors cursor-pointer"
            >
              <p className="hidden sm:block text-sm text-white font-medium">
                {userData?.name || session.user?.name || "Player"}
              </p>
              <div className="relative">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-9 h-9 rounded-full border-2 border-zinc-600 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full border-2 border-zinc-600 bg-zinc-800 flex items-center justify-center">
                    <span className="text-sm text-white font-medium">
                      {(userData?.name || session.user?.name || "P")[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </button>

            {/* Logout button - desktop */}
            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden absolute top-full left-0 right-0 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 p-4 flex flex-col gap-3">
            <Link
              href="/leaderboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer w-full"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0v14a2 012 2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Leaderboard
            </Link>
            <div className="text-sm text-zinc-400 text-center pb-2 border-b border-zinc-800">
              {userData?.name || session.user?.name || "Player"}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer w-full"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />
      {/* Spacer for fixed footer */}
      <div />

      {/* Profile Modal */}
      {profileOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setProfileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div 
            className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setProfileOpen(false)}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center text-center">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-zinc-700 object-cover mb-4"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-zinc-700 bg-zinc-800 flex items-center justify-center mb-4">
                  <span className="text-2xl text-white font-medium">
                    {(userData?.name || session.user?.name || "P")[0].toUpperCase()}
                  </span>
                </div>
              )}

              <h2 className="text-xl font-bold text-white mb-1">
                {userData?.name || session.user?.name || "Player"}
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                {session.user?.email}
              </p>

              <div className="flex gap-6 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-cyan-400">
                    {userData?.highestScore || 0}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Best</span>
                </div>
                <div className="w-px bg-zinc-700" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-purple-400">
                    {userData?.wpm || 0}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">WPM</span>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
