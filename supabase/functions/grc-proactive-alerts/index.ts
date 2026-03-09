import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are GRC Shield AI analyzing organizational data to generate proactive alerts. 
Your task is to identify the most critical issues requiring immediate attention.

Analyze the provided GRC data and return EXACTLY 3-5 actionable alerts in the specified JSON format.
Focus on:
1. Critical/high severity unresolved incidents
2. Overdue actions with high impact
3. Non-compliant items with regulatory consequences
4. High-risk items (probability × impact ≥ 12)
5. At-risk or off-track KPIs

For each alert, provide:
- A clear, concise title (max 60 chars)
- Brief description of the issue and its impact
- Severity level based on urgency
- The module it relates to
- A specific recommended action

Prioritize alerts by business impact and regulatory risk.`;

async function fetchGRCData(supabase: any) {
  const [incidents, actions, compliance, risks, performance] = await Promise.all([
    supabase.from("incidents").select("*").in("status", ["open", "in_progress"]).limit(50),
    supabase.from("actions").select("*").neq("status", "resolved").neq("status", "closed").limit(50),
    supabase.from("compliance").select("*").limit(50),
    supabase.from("risks").select("*").eq("status", "open").limit(50),
    supabase.from("performance").select("*").in("status", ["off_track", "at_risk"]).limit(20),
  ]);

  const now = new Date();
  const overdueActions = actions.data?.filter((a: any) => new Date(a.due_date) < now) || [];
  const criticalIncidents = incidents.data?.filter((i: any) => i.severity === "critical" || i.severity === "high") || [];
  const nonCompliant = compliance.data?.filter((c: any) => c.status === "non_compliant") || [];
  const highRisks = risks.data?.filter((r: any) => r.probability * r.impact >= 12) || [];

  return {
    summary: {
      criticalIncidents: criticalIncidents.length,
      overdueActions: overdueActions.length,
      nonCompliantItems: nonCompliant.length,
      highRisks: highRisks.length,
      offTrackKPIs: performance.data?.length || 0,
    },
    criticalIncidents: criticalIncidents.slice(0, 10),
    overdueActions: overdueActions.slice(0, 10),
    nonCompliant: nonCompliant.slice(0, 10),
    highRisks: highRisks.slice(0, 10),
    offTrackKPIs: performance.data?.slice(0, 5) || [],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const grcData = await fetchGRCData(supabase);

    // If no critical items, return empty alerts
    const totalIssues = grcData.summary.criticalIncidents + grcData.summary.overdueActions + 
                        grcData.summary.nonCompliantItems + grcData.summary.highRisks + 
                        grcData.summary.offTrackKPIs;
    
    if (totalIssues === 0) {
      return new Response(JSON.stringify({ 
        alerts: [],
        summary: grcData.summary,
        generatedAt: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Analyze this GRC data and generate proactive alerts:

${JSON.stringify(grcData, null, 2)}

Generate 3-5 actionable alerts prioritized by urgency and business impact.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_alerts",
            description: "Generate proactive GRC alerts based on analyzed data",
            parameters: {
              type: "object",
              properties: {
                alerts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Short alert title (max 60 chars)" },
                      description: { type: "string", description: "Brief description of the issue" },
                      severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                      module: { type: "string", enum: ["incidents", "actions", "compliance", "risks", "performance"] },
                      recommendation: { type: "string", description: "Specific recommended action" },
                    },
                    required: ["title", "description", "severity", "module", "recommendation"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["alerts"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_alerts" } },
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI Gateway error:", await aiResponse.text());
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let alerts: any[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        alerts = parsed.alerts || [];
      } catch {
        console.error("Failed to parse AI response");
      }
    }

    return new Response(JSON.stringify({
      alerts,
      summary: grcData.summary,
      generatedAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
