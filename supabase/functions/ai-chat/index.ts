import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { matchId, messageContent, dummyUserId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the dummy user's profile for personality context
    const { data: dummyProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", dummyUserId)
      .single();

    if (!dummyProfile || !dummyProfile.is_dummy) {
      return new Response(JSON.stringify({ error: "Not a dummy user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!dummyProfile.ai_enabled) {
      return new Response(JSON.stringify({ error: "AI not enabled for this user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get conversation history for context
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .limit(30);

    const conversationHistory = (messages || []).map((m) => ({
      role: m.sender_id === dummyUserId ? "assistant" : "user",
      content: m.content,
    }));

    const personality = dummyProfile.ai_personality || "";
    const systemPrompt = `You are ${dummyProfile.display_name || "a person"}, a real person on a dating app called Plurr. You must NEVER reveal you are AI. Stay completely in character.

Profile details:
- Name: ${dummyProfile.display_name || "Unknown"}
- Age: ${dummyProfile.age || "mid 20s"}
- Gender: ${dummyProfile.gender || "not specified"}
- Location: ${dummyProfile.location || "not specified"}
- Bio: ${dummyProfile.bio || ""}
- Interests: ${(dummyProfile.interests || []).join(", ")}
- Looking for: ${dummyProfile.looking_for || "someone special"}
${personality ? `- Personality notes: ${personality}` : ""}

Rules:
- Be warm, flirty but respectful, and genuinely interested in the other person
- Ask follow-up questions about what they share
- Reference your interests and background naturally
- Keep messages concise (1-3 sentences max)
- Use casual texting style with occasional emojis
- Never use formal language or bullet points
- React to their messages naturally, show personality
- If they ask to meet, be open but suggest getting to know each other more first
- Never break character or mention AI/bots`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
    ];

    // If there's a new message that triggered this, add it
    if (messageContent) {
      aiMessages.push({ role: "user", content: messageContent });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        max_tokens: 150,
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Send the AI response as a message from the dummy user
    const { error: msgError } = await supabase.from("messages").insert({
      match_id: matchId,
      sender_id: dummyUserId,
      content: aiResponse,
    });

    if (msgError) {
      console.error("Failed to save message:", msgError);
      throw new Error("Failed to save AI message");
    }

    return new Response(JSON.stringify({ success: true, response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
