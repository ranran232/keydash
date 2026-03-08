"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

const electricKeyframes = `
  @keyframes electric-flicker {
    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
      text-shadow: 
        0 0 10px rgba(34, 211, 238, 0.9),
        0 0 20px rgba(34, 211, 238, 0.7),
        0 0 30px rgba(34, 211, 238, 0.5),
        0 0 40px rgba(34, 211, 238, 0.3),
        0 0 60px rgba(34, 211, 238, 0.1);
      opacity: 1;
    }
    20%, 24%, 55% {
      text-shadow: none;
      opacity: 0.8;
    }
  }
  @keyframes electric-spark {
    0%, 100% {
      transform: scale(1);
      filter: brightness(1);
    }
    50% {
      transform: scale(1.02);
      filter: brightness(1.3);
    }
  }
`

export default function SignIn() {
  const [loading, setLoading] = useState(false)

  const handleSignIn = () => {
    setLoading(true)
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 gap-8">

      {/* Logo - Above card */}
      <style>{electricKeyframes}</style>
      <div className="relative flex items-center gap-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-cyan-300" style={{
          animation: "electric-flicker 0.15s infinite, electric-spark 2s ease-in-out infinite",
          textShadow: '0 0 10px rgba(34, 211, 238, 0.9), 0 0 20px rgba(34, 211, 238, 0.7), 0 0 30px rgba(34, 211, 238, 0.5)'
        }}>KEY DASH</h1>
        <svg className="w-8 h-8 text-cyan-400" style={{
          animation: "electric-spark 1.5s ease-in-out infinite",
          filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.9))"
        }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 blur-xl opacity-40 animate-pulse" style={{ zIndex: -1 }} />
      </div>

      {/* Card */}
      <div className="w-full max-w-md sm:max-w-lg bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-zinc-500">Sign in to continue to your account</p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 active:bg-zinc-200 disabled:bg-zinc-200 disabled:cursor-not-allowed text-zinc-800 font-medium text-sm rounded-xl px-4 py-3 transition-all duration-150 shadow-sm hover:shadow-md disabled:shadow-sm cursor-pointer"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin text-zinc-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600">
          By continuing, you agree to our{" "}
          <a href="#" className="text-zinc-500 hover:text-white transition-colors">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-zinc-500 hover:text-white transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  )
}