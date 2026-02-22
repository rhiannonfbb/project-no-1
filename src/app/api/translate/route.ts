import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const DEEPL_API_URL = process.env.DEEPL_API_KEY?.endsWith(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate"

export async function POST(request: Request) {
  const body = await request.json() as { ideaId?: string; targetLocale?: string }
  const { ideaId, targetLocale } = body

  if (!ideaId || !targetLocale) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  if (!["de", "en"].includes(targetLocale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 })
  }

  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Translation not configured" }, { status: 503 })
  }

  // Fetch the idea (public SELECT — allowed by RLS)
  const { data: idea, error: fetchError } = await supabase
    .from("ideas")
    .select("title, description, original_language, translations")
    .eq("id", ideaId)
    .single()

  if (fetchError || !idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 })
  }

  // Return cached translation if available
  const cached = (idea.translations as Record<string, { title: string; description: string }> | null)?.[targetLocale]
  if (cached) {
    return NextResponse.json(cached)
  }

  // Call DeepL REST API
  const targetLang = targetLocale === "de" ? "DE" : "EN-GB"
  const deeplResp = await fetch(DEEPL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [idea.title, idea.description],
      target_lang: targetLang,
      ...(idea.original_language
        ? { source_lang: (idea.original_language as string).toUpperCase().slice(0, 2) }
        : {}),
    }),
  })

  if (!deeplResp.ok) {
    return NextResponse.json({ error: "Translation failed" }, { status: 502 })
  }

  const result = await deeplResp.json() as { translations: { text: string }[] }
  const [translatedTitle, translatedDesc] = result.translations

  // Cache result in DB via SECURITY DEFINER RPC (bypasses RLS owner check)
  await supabase.rpc("cache_idea_translation", {
    p_idea_id: ideaId,
    p_locale: targetLocale,
    p_title: translatedTitle.text,
    p_description: translatedDesc.text,
  })

  return NextResponse.json({ title: translatedTitle.text, description: translatedDesc.text })
}
