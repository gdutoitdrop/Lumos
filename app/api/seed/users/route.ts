import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// Sample data for generating diverse user profiles
const mentalHealthConditions = [
  "Anxiety",
  "Depression",
  "ADHD",
  "Bipolar Disorder",
  "OCD",
  "PTSD",
  "Eating Disorder",
  "Insomnia",
  "Stress",
]

const interests = [
  "Meditation",
  "Yoga",
  "Reading",
  "Hiking",
  "Art Therapy",
  "Journaling",
  "Music",
  "Cooking",
  "Gardening",
  "Exercise",
  "Photography",
  "Travel",
  "Volunteering",
  "Support Groups",
]

const moods = [
  "Calm",
  "Anxious",
  "Hopeful",
  "Stressed",
  "Content",
  "Overwhelmed",
  "Motivated",
  "Tired",
  "Grateful",
  "Reflective",
]

const genders = ["Male", "Female", "Non-binary", "Prefer not to say"]

// Generate a random user profile
function generateUserProfile(index: number) {
  const username = `testuser${index}`
  const fullName = `Test User ${index}`
  const email = `testuser${index}@example.com`
  const password = "password123"

  // Select random badges (1-3)
  const badgeCount = Math.floor(Math.random() * 3) + 1
  const badges = []
  for (let i = 0; i < badgeCount; i++) {
    const condition = mentalHealthConditions[Math.floor(Math.random() * mentalHealthConditions.length)]
    if (!badges.includes(`${condition} Warrior`)) {
      badges.push(`${condition} Warrior`)
    }
  }

  // Select random interests (2-4)
  const interestCount = Math.floor(Math.random() * 3) + 2
  const userInterests = []
  for (let i = 0; i < interestCount; i++) {
    const interest = interests[Math.floor(Math.random() * interests.length)]
    if (!userInterests.includes(interest)) {
      userInterests.push(interest)
    }
  }

  // Select a random mood
  const mood = moods[Math.floor(Math.random() * moods.length)]

  // Select a random gender
  const gender = genders[Math.floor(Math.random() * genders.length)]

  return {
    email,
    password,
    profile: {
      username,
      full_name: fullName,
      bio: `I'm dealing with ${badges.join(" and ").replace(" Warrior", "").replace(" Warrior", "")}. I enjoy ${userInterests.join(", ")}.`,
      gender,
      mental_health_badges: badges,
      current_mood: `Feeling ${mood.toLowerCase()}`,
      looking_for: `Support and connection with people who understand ${badges[0].replace(" Warrior", "")}`,
      mental_health_journey: `I've been on my mental health journey for ${Math.floor(Math.random() * 10) + 1} years. Taking it one day at a time.`,
      interests: userInterests,
    },
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if this is an admin request
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get("adminKey")
    const count = Number.parseInt(searchParams.get("count") || "10")

    if (adminKey !== process.env.ADMIN_SEED_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results = {
      success: 0,
      failed: 0,
      users: [] as string[],
    }

    // Generate and create users
    for (let i = 1; i <= count; i++) {
      const userData = generateUserProfile(i)

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", userData.profile.username)
        .single()

      if (existingUser) {
        results.failed++
        continue
      }

      // Create new user
      const { data: newUser, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.profile.full_name,
          },
        },
      })

      if (error || !newUser.user) {
        results.failed++
        continue
      }

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: newUser.user.id,
        ...userData.profile,
      })

      if (profileError) {
        results.failed++
        continue
      }

      results.success++
      results.users.push(userData.email)
    }

    return NextResponse.json({
      message: `Created ${results.success} users, ${results.failed} failed`,
      users: results.users,
    })
  } catch (error: any) {
    console.error("Error creating test users:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
