import { NextResponse } from "next/server"
import { z } from "zod"
import { createSupabaseServerClient } from "@/lib/supabase-server"

/**
 * PROJ-7: Asana-Anbindung
 *
 * Legt für eine von einem Admin freigegebene Idee eine Aufgabe im Asana-Projekt
 * "Justinian Forum" im Abschnitt "Feature-Voting-Board" an.
 * Projekt- und Abschnitts-IDs sind keine Geheimnisse; das Token kommt aus ASANA_ACCESS_TOKEN.
 */

const ASANA_PROJECT_GID = "1216384775326492" // Justinian Forum
const ASANA_SECTION_GID = "1220202805496706" // Feature-Voting-Board

const bodySchema = z.object({
  ideaId: z.string().uuid(),
})

export async function POST(request: Request) {
  const token = process.env.ASANA_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ error: "Asana not configured" }, { status: 503 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ideaId" }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (profileError) {
    return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 })
  }
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .select("id, title, description, status, asana_task_gid")
    .eq("id", parsed.data.ideaId)
    .single()
  if (ideaError || !idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 })
  }

  // Idempotent: Zu einer Idee wird nur einmal eine Aufgabe angelegt.
  if (idea.asana_task_gid) {
    return NextResponse.json({ taskGid: idea.asana_task_gid, created: false })
  }

  let asanaRes: Response
  try {
    asanaRes = await fetch("https://app.asana.com/api/1.0/tasks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          name: idea.title,
          notes: `${idea.description}\n\nStatus: ${idea.status}`,
          memberships: [{ project: ASANA_PROJECT_GID, section: ASANA_SECTION_GID }],
        },
      }),
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    return NextResponse.json({ error: "Asana unreachable" }, { status: 502 })
  }

  if (!asanaRes.ok) {
    console.error("Asana task creation failed", asanaRes.status)
    return NextResponse.json({ error: "Asana task creation failed" }, { status: 502 })
  }

  const json = (await asanaRes.json()) as { data?: { gid?: string } }
  const taskGid = json.data?.gid
  if (!taskGid) {
    return NextResponse.json({ error: "Asana response missing task id" }, { status: 502 })
  }

  const { error: updateError } = await supabase
    .from("ideas")
    .update({ asana_task_gid: taskGid })
    .eq("id", idea.id)
  if (updateError) {
    // Aufgabe existiert bereits in Asana; ohne gespeicherte GID könnte sie doppelt entstehen.
    console.error("Saving asana_task_gid failed", updateError.message)
    return NextResponse.json({ taskGid, created: true, saved: false }, { status: 500 })
  }

  return NextResponse.json({ taskGid, created: true })
}
