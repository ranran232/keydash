"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import wordLists from "../wordList/words.json"

const BACKGROUND_MUSIC = "https://res.cloudinary.com/dtvjjump9/video/upload/v1772952370/sounduniversestudio-repeat-gaming-background-music-instrumental-218942_dn5xzp.mp3"
const CLICK_SOUND = "https://res.cloudinary.com/dtvjjump9/video/upload/v1772954731/universfield-interface-124464_hec3zs.mp3"
const CORRECT_SOUND = "https://res.cloudinary.com/dtvjjump9/video/upload/v1772955479/freesound_community-rightanswer-95219_apmqg1.mp3"

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

const DIFFICULTY_POINTS = {
  easy: 1,
  normal: 3,
  hard: 6,
  extreme: 10
}

const GAME_DURATION = 60

type Difficulty = "easy" | "normal" | "hard" | "extreme"

interface GameStats {
  highestScore: number
  totalTime?: number
  wpm: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

interface Star {
  id: number
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

export default function TypingGame() {
  const { data: session } = useSession()
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [currentWord, setCurrentWord] = useState("")
  const [input, setInput] = useState("")
  const [score, setScore] = useState(0)
  const [wordsCompleted, setWordsCompleted] = useState(0)
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [particles, setParticles] = useState<Particle[]>([])
  const [glowIntensity, setGlowIntensity] = useState(0)
  const [wordComplete, setWordComplete] = useState(false)
  const [stars, setStars] = useState<Star[]>([])
  const [stats, setStats] = useState<GameStats>({ highestScore: 0, totalTime: 0, wpm: 0 })
  const [mounted, setMounted] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const particleIdRef = useRef(0)
  const scoreRef = useRef(0)
  const emailRef = useRef<string | null>(null)

  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const correctSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (session?.user?.email) {
      emailRef.current = session.user.email
    }
  }, [session])

  useEffect(() => {
    setMounted(true)

    if (session?.user?.email) {
      fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setStats({
              highestScore: data.highestScore || 0,
              wpm: data.wpm || 0
            })
          }
        })
        .catch(console.error)
    }

    bgMusicRef.current = new Audio(BACKGROUND_MUSIC)
    bgMusicRef.current.loop = true
    bgMusicRef.current.volume = 0.3

    clickSoundRef.current = new Audio(CLICK_SOUND)
    clickSoundRef.current.volume = 0.5

    correctSoundRef.current = new Audio(CORRECT_SOUND)
    correctSoundRef.current.volume = 0.4
    correctSoundRef.current.load()

    const playOnInteraction = () => {
      if (soundEnabled && !difficulty && bgMusicRef.current) {
        bgMusicRef.current.play().catch(() => {})
      }
      document.removeEventListener('click', playOnInteraction)
    }
    document.addEventListener('click', playOnInteraction)

    if (soundEnabled && !difficulty && bgMusicRef.current) {
      bgMusicRef.current.play().catch(() => {})
    }

    return () => {
      document.removeEventListener('click', playOnInteraction)
      bgMusicRef.current?.pause()
      clickSoundRef.current?.pause() 
    }
  }, [session])

  const getRandomWord = useCallback((diff: Difficulty, used: string[]) => {
    const list = wordLists[diff]
    const availableWords = list.filter(word => !used.includes(word))
    if (availableWords.length === 0) return list[Math.floor(Math.random() * list.length)]
    return availableWords[Math.floor(Math.random() * availableWords.length)]
  }, [])

  const saveStats = async (newWpm: number) => {
  
    
    const newStats = {
      highestScore: Math.max(stats.highestScore, score),
      wpm: newWpm
    }
    setStats(newStats)

    if (emailRef.current) {
      try {
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailRef.current,
            score: score,
            wpm: newWpm
          })
        })
        const data = await res.json()
      
      } catch (error) {
        console.error("Error saving stats:", error)
      }
    } else {
      console.log("No email found")
    }
  }

  const spawnParticles = (x: number, y: number, count: number, color: string) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 2 + Math.random() * 4
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color
      })
    }
    setParticles(prev => [...prev, ...newParticles])
  }

  useEffect(() => {
    if (particles.length === 0) return
    
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0)
      )
    }, 16)
    
    return () => clearInterval(interval)
  }, [particles.length])

  const startGame = (diff: Difficulty) => {
    clickSoundRef.current!.currentTime = 0
    clickSoundRef.current?.play().catch(() => {})
    bgMusicRef.current?.pause()
    setDifficulty(diff)
    setCurrentWord(getRandomWord(diff, usedWords))
    setInput("")
    setScore(0)
    setWordsCompleted(0)
    setUsedWords([])
    setStartTime(Date.now())
    setIsGameOver(false)
    setWpm(0)
    setTimeLeft(GAME_DURATION)
    setGlowIntensity(0)
    setParticles([])
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const calculateWpm = useCallback(() => {
    if (!startTime) return 0
    const timeElapsed = (Date.now() - startTime) / 1000 / 60
    if (timeElapsed === 0) return 0
    return Math.round(wordsCompleted / timeElapsed)
  }, [startTime, wordsCompleted])

  useEffect(() => {
    if (startTime && !isGameOver) {
      const interval = setInterval(() => {
        setWpm(calculateWpm())
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [startTime, isGameOver, calculateWpm])

  useEffect(() => {
    if (wordComplete) {
      setGlowIntensity(1)
      const timeout = setTimeout(() => setGlowIntensity(0), 300)
      return () => clearTimeout(timeout)
    }
  }, [wordComplete])

  useEffect(() => {
    if (!difficulty && soundEnabled && bgMusicRef.current) {
      bgMusicRef.current.play().catch(() => {})
    }
  }, [difficulty, soundEnabled])

  useEffect(() => {
    const newStars = [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 2}s`
    }))
    setStars(newStars)
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!difficulty || isGameOver) return

    const value = e.target.value.toLowerCase()
    setInput(value)

    if (value === currentWord) {
      const points = DIFFICULTY_POINTS[difficulty]
      setScore(prev => prev + points)
      setWordsCompleted(prev => prev + 1)
      setUsedWords(prev => {
        const newUsed = [...prev, currentWord]
        setCurrentWord(getRandomWord(difficulty, newUsed))
        return newUsed
      })
      setInput("")
      setWordComplete(true)
      spawnParticles(window.innerWidth / 2, window.innerHeight / 2, 12, "#22c55e")
      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0
        correctSoundRef.current.play().catch(() => {})
      }
      setTimeout(() => setWordComplete(false), 300)
    }
  }

  const endGame = () => {
    setIsGameOver(true)
    const finalWpm = calculateWpm()
    setWpm(finalWpm)
    saveStats(finalWpm)
  }

  const resetGame = () => {
    setDifficulty(null)
    setCurrentWord("")
    setInput("")
    setScore(0)
    setWordsCompleted(0)
    setStartTime(null)
    setIsGameOver(false)
    setWpm(0)
    setTimeLeft(GAME_DURATION)
    setGlowIntensity(0)
    bgMusicRef.current?.play().catch(() => {})
  }

  const getTimeColor = () => {
    if (timeLeft > 30) return "text-green-400"
    if (timeLeft > 10) return "text-yellow-400"
    return "text-red-400"
  }

  if (!difficulty) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration
            }}
          />
        ))}

        <div className="relative w-full max-w-md sm:max-w-lg bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 sm:gap-8 hover:border-zinc-700/50 transition-all duration-500">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />

            <div className="flex flex-col items-center gap-2 text-center relative z-10">
            <style>{electricKeyframes}</style>
            <div className="relative flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-cyan-300" style={{
                animation: "electric-flicker 0.15s infinite, electric-spark 2s ease-in-out infinite",
                textShadow: '0 0 10px rgba(34, 211, 238, 0.9), 0 0 20px rgba(34, 211, 238, 0.7), 0 0 30px rgba(34, 211, 238, 0.5)'
              }}>KEY DASH</h1>
              <svg className="w-6 h-6 text-cyan-400" style={{
                animation: "electric-spark 1.5s ease-in-out infinite",
                filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.9))"
              }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 blur-xl opacity-40 animate-pulse" />
            </div>
            <p className="text-sm text-zinc-400">Select difficulty to start</p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          <div className="flex flex-col gap-3 relative z-10">
            {(["easy", "normal", "hard", "extreme"] as Difficulty[]).map((diff, i) => (
              <button
                key={diff}
                onClick={() => startGame(diff)}
                className="group w-full flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/30 hover:border-zinc-600/50 text-white font-medium text-sm rounded-2xl px-5 py-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer relative overflow-hidden"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  diff === "easy" ? "bg-gradient-to-r from-green-500/20 to-transparent" :
                  diff === "normal" ? "bg-gradient-to-r from-yellow-500/20 to-transparent" :
                  diff === "hard" ? "bg-gradient-to-r from-red-500/20 to-transparent" :
                  "bg-gradient-to-r from-purple-500/20 to-transparent"
                }`} />
                <span className="capitalize relative z-10 flex items-center gap-2">
                  {diff === "easy" && <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />}
                  {diff === "normal" && <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]" />}
                  {diff === "hard" && <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_10px_#f87171]" />}
                  {diff === "extreme" && <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]" />}
                  {diff}
                </span>
                <span className="text-zinc-400 text-xs relative z-10">{DIFFICULTY_POINTS[diff]} pts/word</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
      
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            backgroundColor: p.color,
            opacity: p.life,
            transform: `scale(${p.life})`,
            boxShadow: `0 0 ${10 * p.life}px ${p.color}`
          }}
        />
      ))}

      <div 
        className={`relative w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-4 md:gap-6 transition-all duration-300 ${
          glowIntensity > 0 ? "scale-[1.02]" : "scale-100"
        } ${timeLeft <= 15 && !isGameOver ? "border-red-500/50" : "border-zinc-800/50"}`}
        style={{
          boxShadow: timeLeft <= 15 && !isGameOver 
            ? `0 0 ${30 + (15 - timeLeft) * 2}px rgba(239, 68, 68, ${0.3 + (15 - timeLeft) * 0.02})`
            : glowIntensity > 0 ? `0 0 ${50 * glowIntensity}px rgba(34, 197, 94, ${0.3 * glowIntensity})` : undefined
        }}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        
        <div className="flex items-center justify-between relative z-10">
          {/* Left: Difficulty and Time */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Difficulty</span>
              <span className={`text-sm font-medium capitalize ${
                difficulty === "easy" ? "text-green-400" :
                difficulty === "normal" ? "text-yellow-400" :
                difficulty === "hard" ? "text-red-400" : "text-purple-400"
              }`}>
                {difficulty}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Time</span>
              <div className={`text-xl font-bold tracking-wider transition-all duration-300 ${getTimeColor()}`}>
                {timeLeft}
              </div>
            </div>
          </div>
          
          {/* Center: Score */}
          <div className="flex flex-col text-center">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Score</span>
            <span 
              className={`text-4xl sm:text-5xl font-bold ${score > stats.highestScore ? "text-cyan-400" : "text-white"}`}
              style={score > stats.highestScore ? {
                animation: "electric-flicker 0.1s infinite, electric-spark 0.5s ease-in-out infinite",
                textShadow: '0 0 20px rgba(34, 211, 238, 1), 0 0 40px rgba(34, 211, 238, 0.9), 0 0 60px rgba(34, 211, 238, 0.7), 0 0 80px rgba(34, 211, 238, 0.5), 0 0 100px rgba(34, 211, 238, 0.3)',
                filter: "brightness(1.3)"
              } : undefined}
            >{score}</span>
          </div>

          {/* Right: WPM */}
          <div className="flex flex-col text-right">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">WPM</span>
            <span className="text-xl font-bold text-white">{wpm}</span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

        <div className="flex flex-col items-center gap-4 md:gap-6 py-4 md:py-6 px-2 relative z-10">
          <div 
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-200 break-all text-center ${
              wordComplete ? "scale-110" : "scale-100"
            }`}
            style={{
              textShadow: glowIntensity > 0 ? `0 0 ${30 * glowIntensity}px rgba(34, 197, 94, ${0.5 * glowIntensity})` : "0 0 20px rgba(255,255,255,0.1)"
            }}
          >
            {currentWord.split("").map((char, i) => {
              let color = "text-zinc-600"
              let shadow = ""
              if (i < input.length) {
                if (input[i] === char) {
                  color = "text-green-400"
                  shadow = "drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                } else {
                  color = "text-red-400"
                  shadow = "drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]"
                }
              }
              return (
                <span key={i} className={`${color} ${shadow} transition-all duration-75`}>
                  {char}
                </span>
              )
            })}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            onBlur={() => !isGameOver && inputRef.current?.focus()}
            className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-zinc-800/50 border border-zinc-700/30 hover:border-zinc-600/50 focus:border-blue-500/50 rounded-2xl px-4 py-3 md:px-6 md:py-4 text-center text-lg md:text-xl font-medium outline-none transition-all duration-300 placeholder:text-zinc-600"
            placeholder="Type here..."
            autoFocus
            disabled={isGameOver}
          />
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-4 sm:gap-6 z-20 animate-in fade-in duration-300 p-4">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Game Over!</h2>
              <div className="flex gap-4 sm:gap-8 justify-center mb-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Score</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{score}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Words</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{wordsCompleted}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">WPM</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{wpm}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full max-w-[200px]">
              <button
                onClick={resetGame}
                className="flex-1 bg-zinc-700/80 hover:bg-zinc-600/80 border border-zinc-600/50 text-white font-medium text-sm rounded-xl px-4 py-3 transition-all duration-150 cursor-pointer"
              >
                Menu
              </button>
              <button
                onClick={() => difficulty && startGame(difficulty)}
                className="flex-1 bg-blue-600/80 hover:bg-blue-500/80 border border-blue-500/50 text-white font-medium text-sm rounded-xl px-4 py-3 transition-all duration-150 cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent relative z-10" />

        <div className="flex gap-3 relative z-10">
          <button
            onClick={endGame}
            disabled={isGameOver}
            className="flex-1 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/30 hover:border-zinc-600/50 text-white font-medium text-sm rounded-2xl px-4 py-3 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            End Game
          </button>
          <button
            onClick={resetGame}
            className="flex-1 bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/30 hover:border-zinc-600/50 text-white font-medium text-sm rounded-2xl px-4 py-3 transition-all duration-150 cursor-pointer"
          >
            Menu
          </button>
        </div>
      </div>
    </main>
  )
}
