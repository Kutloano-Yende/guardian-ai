import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are GRC Shield AI — an expert Governance, Risk, and Compliance assistant embedded in an enterprise GRC platform.

## Your Roles
- **Risk Advisor**: Assess risks, predict escalation, suggest mitigation strategies and prioritization.
- **Compliance Advisor**: Map events to regulations (POPIA, OHS Act, Companies Act, King IV, financial regulations). Explain rules, consequences, fines, and corrective actions.
- **Incident Analyst**: Analyze incidents, identify root causes by comparing to historical data, recommend resolutions.
- **Audit Assistant**: Help prepare audits, generate checklists, summarize findings, recommend controls.
- **Performance Analyst**: Monitor KPIs, identify declining trends, recommend corrective actions.
- **Operational Decision Assistant**: Provide executive summaries, strategic recommendations, and impact predictions.

## Behavior Rules
1. Always explain your reasoning with evidence from the provided data.
2. Reference specific regulations when applicable (e.g., "POPIA Section 19", "King IV Principle 11").
3. Suggest concrete actions with responsible roles and deadlines.
4. Highlight consequences of inaction.
5. Adapt response depth to user role:
   - Risk Manager → detailed mitigation strategies, trend analysis
   - Audit Manager → checklists, findings summaries, control recommendations
   - Compliance Officer → regulatory mapping, violation analysis
   - Executive → concise summaries, key risks, strategic recommendations
   - User → clear explanations, step-by-step guidance
6. When analyzing cross-module relationships, explicitly trace connections (Asset → Risk → Incident → Action).
7. For predictive analysis, state assumptions and confidence level.
8. Always format responses with clear headings, bullet points, and action items.
9. If data is insufficient, state what additional information would improve the analysis.

## Response Format
Use markdown formatting. Include:
- **Analysis**: What the data shows
- **Risk/Impact**: Consequences and severity
- **Recommendations**: Specific actions with owners
- **Regulatory Context**: Applicable regulations (when relevant)
- **Timeline**: Suggested deadlines for actions`;

async function fetchGRCContext(supabase: any) {
  const [assets, risks, incidents, audits, compliance, actions, performance] = await Promise.all([
    supabase.from("assets").select("*").limit(50),
    supabase.from("risks").select("*").limit(50),
    supabase.from("incidents").select("*").limit(50),
    supabase.from("audits").select("*").limit(50),
    supabase.from("compliance").select("*").limit(50),
    supabase.from("actions").select("*").limit(50),
    supabase.from("performance").select("*").limit(50),
  ]);

  const summary: string[] = [];

  if (assets.data?.length) {
    const critical = assets.data.filter((a: any) => a.criticality === "critical" || a.criticality === "high");
    summary.push(`## Assets (${assets.data.length} total, ${critical.length} critical/high)\n${JSON.stringify(assets.data.slice(0, 20), null, 1)}`);
  }
  if (risks.data?.length) {
    const highRisks = risks.data.filter((r: any) => r.probability * r.impact >= 12);
    summary.push(`## Risks (${risks.data.length} total, ${highRisks.length} high-severity)\n${JSON.stringify(risks.data.slice(0, 20), null, 1)}`);
  }
  if (incidents.data?.length) {
    const open = incidents.data.filter((i: any) => i.status === "open" || i.status === "in_progress");
    summary.push(`## Incidents (${incidents.data.length} total, ${open.length} open/in-progress)\n${JSON.stringify(incidents.data.slice(0, 20), null, 1)}`);
  }
  if (audits.data?.length) {
    summary.push(`## Audits (${audits.data.length} total)\n${JSON.stringify(audits.data.slice(0, 10), null, 1)}`);
  }
  if (compliance.data?.length) {
    const nonCompliant = compliance.data.filter((c: any) => c.status === "non_compliant");
    summary.push(`## Compliance (${compliance.data.length} total, ${nonCompliant.length} non-compliant)\n${JSON.stringify(compliance.data.slice(0, 10), null, 1)}`);
  }
  if (actions.data?.length) {
    const overdue = actions.data.filter((a: any) => a.status !== "resolved" && a.status !== "closed" && new Date(a.due_date) < new Date());
    summary.push(`## Actions (${actions.data.length} total, ${overdue.length} overdue)\n${JSON.stringify(actions.data.slice(0, 10), null, 1)}`);
  }
  if (performance.data?.length) {
    const offTrack = performance.data.filter((p: any) => p.status === "off_track" || p.status === "at_risk");
    summary.push(`## Performance KPIs (${performance.data.length} total, ${offTrack.length} off-track/at-risk)\n${JSON.stringify(performance.data.slice(0, 10), null, 1)}`);
  }

  return summary.length > 0
    ? `\n\n--- CURRENT GRC DATA ---\n${summary.join("\n\n")}\n--- END GRC DATA ---`
    : "\n\n[No GRC data currently in the system. Respond based on general GRC best practices.]";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create client with user's JWT
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { message, conversationHistory = [], currentModule = "general" } = await req.json();

    // Fetch user roles
    const { data: rolesData } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const userRoles = rolesData?.map((r: any) => r.role) || ["user"];

    // Fetch GRC context
    const grcContext = await fetchGRCContext(supabase);

    const roleContext = `\n\nCurrent user roles: ${userRoles.join(", ")}. Current module: ${currentModule}. Adapt your response accordingly.`;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT + roleContext + grcContext },
      ...conversationHistory.slice(-10),
      { role: "user", content: message },
    ];

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.4,
        max_tokens: 2048,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    // Log to audit trail
    await supabase.from("ai_chat_logs").insert({
      user_id: user.id,
      user_message: message,
      ai_response: reply,
      context_module: currentModule,
      user_role: userRoles[0] || "user",
    });

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
