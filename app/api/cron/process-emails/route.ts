import { NextResponse } from "next/server"
import { processEmailQueue } from "@/lib/email-processor"

export async function POST(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization")

    if (!process.env.CRON_SECRET_KEY || authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await processEmailQueue()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing email queue:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
