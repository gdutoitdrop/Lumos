import { NextResponse } from "next/server"
import { processEmailQueue } from "@/lib/email"

export async function GET(request: Request) {
  // Verify the request is from a cron job
  const authHeader = request.headers.get("authorization")

  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await processEmailQueue()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error processing email queue:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
