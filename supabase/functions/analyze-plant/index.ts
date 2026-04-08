import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert plant pathologist AI. Analyze plant diseases based on user input.

IMPORTANT: You must respond ONLY with a valid JSON object in this exact format (no markdown, no explanation outside JSON):

{
  "diseaseName": "Name of the disease or 'Healthy Plant'",
  "confidence": 85,
  "description": "Detailed description of the disease",
  "causes": ["cause 1", "cause 2"],
  "chemicalTreatment": ["treatment 1", "treatment 2"],
  "organicTreatment": ["treatment 1", "treatment 2"],
  "prevention": ["tip 1", "tip 2", "tip 3"],
  "isHealthy": false
}

Rules:
- confidence is a number 0-100
- If the plant appears healthy, set isHealthy to true, diseaseName to "Healthy Plant", and leave causes/treatments as empty arrays
- Provide at least 3 prevention tips
- Provide at least 2 items for causes, chemical treatment, and organic treatment when diseased
- Be specific and scientifically accurate
- Base your diagnosis on the symptoms/image provided`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { type, plantType, symptoms, imageBase64 } = await req.json();

    let userContent: any[];

    if (type === "text") {
      userContent = [
        {
          type: "text",
          text: `Plant type: ${plantType}\nSymptoms described by user: ${symptoms}\n\nPlease diagnose the most likely disease based on these symptoms.`,
        },
      ];
    } else if (type === "image") {
      userContent = [
        {
          type: "text",
          text: "Analyze this plant leaf image. Identify any disease, damage, or health issues visible. Provide a detailed diagnosis.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
          },
        },
      ];
    } else {
      throw new Error("Invalid analysis type. Use 'text' or 'image'.");
    }

    // Use gemini-2.5-flash for multimodal (image) support, gemini-3-flash-preview for text
    const model = type === "image" ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI model");
    }

    // Parse the JSON from the AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-plant error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
