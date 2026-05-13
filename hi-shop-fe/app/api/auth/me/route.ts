import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth.server"

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json(null, { status: 401 })
  return NextResponse.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  })
}
