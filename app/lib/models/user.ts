import { ObjectId, Collection } from "mongodb"
import { getDatabase } from "../mongodb"

export interface User {
  _id?: ObjectId
  email: string
  name?: string
  image?: string
  highestScore?: number
  totalTime?: number
  wpm?: number
  createdAt: Date
  updatedAt: Date
}

export async function getUserCollection(): Promise<Collection<User>> {
  const db = await getDatabase()
  return db.collection("users") as unknown as Collection<User>
}

export async function createOrUpdateUser(
  email: string,
  userData: Partial<User>
): Promise<User> {
  const collection = await getUserCollection()

  const existingUser = await collection.findOne({ email })

  // Ensure name and image are never undefined
  const safeData = {
    name: userData.name || "Unknown",
    image: userData.image || "",
    ...userData, // include any other fields like highestScore
    updatedAt: new Date(),
  }

  if (existingUser) {
    await collection.updateOne(
      { email },
      { $set: safeData }
    )
    return { ...existingUser, ...safeData }
  }

  const newUser: User = {
    email,
    ...safeData,
    createdAt: new Date(),
  }

  const result = await collection.insertOne(newUser)
  return { ...newUser, _id: result.insertedId }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const collection = await getUserCollection()
  return collection.findOne({ email })
}

export async function updateUserStats(email: string, score: number, wpm: number): Promise<User> {
  const collection = await getUserCollection()
  
  const user = await collection.findOne({ email })
  
  if (!user) {
    throw new Error("User not found")
  }
  
  const newHighestScore = Math.max(user.highestScore || 0, score)
  const newHighestWpm = Math.max(user.wpm || 0, wpm)
  
  await collection.updateOne(
    { email },
    { 
      $set: { 
        highestScore: newHighestScore,
        wpm: newHighestWpm,
        updatedAt: new Date()
      }
    }
  )
  
  return { 
    ...user, 
    highestScore: newHighestScore, 
    wpm: newHighestWpm,
    updatedAt: new Date()
  }
}

export async function getAllUsers(sortBy: "highestScore" | "wpm" = "highestScore"): Promise<User[]> {
  const collection = await getUserCollection()
  return collection.find({}).sort({ [sortBy]: -1 }).toArray()
}
