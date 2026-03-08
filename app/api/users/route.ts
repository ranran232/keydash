import { NextRequest, NextResponse } from "next/server"
import { createOrUpdateUser, getUserByEmail, updateUserStats } from "../../lib/models/user"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, image } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await createOrUpdateUser(email, { name, image })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, score, wpm } = body

    console.log("PUT /api/users:", { email, score, wpm })

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    if (score === undefined || wpm === undefined) {
      return NextResponse.json(
        { error: "Score and WPM are required" },
        { status: 400 }
      )
    }

    const user = await updateUserStats(email, score, wpm)
    console.log("Updated user:", user)

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user stats:", error)
    return NextResponse.json(
      { error: "Failed to update user stats" },
      { status: 500 }
    )
  }
}
