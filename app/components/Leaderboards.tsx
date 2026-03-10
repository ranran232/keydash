"use client"

import Link from "next/link"
import { useState } from "react"

interface User {
  email: string
  name?: string
  image?: string
  highestScore?: number
  wpm?: number
}

interface LeaderboardsProps {
  users: User[]
  sortBy: "highestScore" | "wpm"
  currentUserEmail: string | null
}

const Leaderboards = ({ users, sortBy, currentUserEmail }: LeaderboardsProps) => {
  const currentSort = sortBy
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const getRankStyles = (index: number, isCurrentUser: boolean) => {
    const baseStyles = isCurrentUser ? "border-l-4 border-l-cyan-500" : ""
    if (index === 0) return `bg-gradient-to-r from-purple-600 via-yellow-500 to-purple-600 text-white animate-shine ${baseStyles}`
    if (index === 1) return `bg-yellow-500 text-black ${baseStyles}`
    if (index === 2) return `bg-green-500 text-white ${baseStyles}`
    if (index === 3) return `bg-zinc-300 text-black ${baseStyles}`
    return `bg-zinc-900/50 border border-zinc-800 text-white ${baseStyles}`
  }

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 pb-16">
      <style>{`
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-shine {
          background-size: 200% auto;
          animation: shine 3s linear infinite;
        }
      `}</style>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Leaderboards</h1>
          <Link 
            href="/"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← Back
          </Link>
        </div>

        <div className="flex gap-2 mb-6">
          <Link
            href="/leaderboard"
            className={`px-4 py-2 rounded-lg transition-colors ${
              !currentSort || currentSort === "highestScore"
                ? "bg-cyan-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Score
          </Link>
          <Link
            href="/leaderboard?sort=wpm"
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentSort === "wpm"
                ? "bg-cyan-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            WPM
          </Link>
        </div>

        <div className="space-y-2">
          {users.map((user, index) => (
            <div
              key={user.email}
              className={`flex items-center gap-3 p-3 rounded-xl ${getRankStyles(index, user.email === currentUserEmail)}`}
            >
              <div className="w-6 text-center font-bold text-sm">
                #{index + 1}
              </div>
              
              <div className="relative">
                {index === 0 && (
                  <svg className="absolute -top-6 left-1/2 -translate-x-1/2 w-7 h-7  text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
                  </svg>
                )}
                <button
                  onClick={() => setSelectedUser(user)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {(user.name || "A")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>
              </div>
              
              <div className="flex-1">
                <div className="font-medium">
                  {user.name || "Anonymous"}
                </div>
                {user.email === "afacebu.randy@gmail.com" && (
                  <div className="text-xs font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-2 py-0.5 rounded w-fit mt-1">
                    Creator
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-bold">
                  {currentSort === "wpm" ? (user.wpm || 0) : (user.highestScore || 0)}
                </div>
                <div className="text-xs uppercase opacity-70">
                  {currentSort === "wpm" ? "WPM" : "Score"}
                </div>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center text-zinc-500 py-8">
              No players yet. Be the first!
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div 
            className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col items-center text-center">
              {selectedUser.image ? (
                <img
                  src={selectedUser.image}
                  alt={selectedUser.name || "User"}
                  className="w-24 h-24 rounded-full border-4 border-zinc-700 object-cover mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-zinc-700 bg-zinc-800 flex items-center justify-center mb-4">
                  <span className="text-3xl font-medium">
                    {(selectedUser.name || "A")[0].toUpperCase()}
                  </span>
                </div>
              )}

              <h2 className="text-xl font-bold text-white mb-1">
                {selectedUser.name || "Anonymous"}
              </h2>
              {selectedUser.email !== "afacebu.randy@gmail.com" && (
                <p className="text-sm text-zinc-500 mb-6">
                  {selectedUser.email}
                </p>
              )}

              <div className="flex gap-6 w-full justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-cyan-400">
                    {selectedUser.highestScore || 0}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Best Score</span>
                </div>
                <div className="w-px bg-zinc-700" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-purple-400">
                    {selectedUser.wpm || 0}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">WPM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaderboards
