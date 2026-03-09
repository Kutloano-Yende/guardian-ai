import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are GRC Shield AI — an intelligent assistant embedded within the organization's Governance, Risk, and Compliance platform.

## Identity
You are both:
- A **general-purpose AI assistant** capable of answering any user question
- A **specialized GRC intelligence system** connected to the organization's internal data

Your goal is to assist users with any type of request while helping them understand risk, compliance, operational, and governance implications.

## Knowledge Scope
You are NOT limited to GRC topics. You can assist with:
- General knowledge, technology, business strategy, legal frameworks
- Weather, cybersecurity, global events, operational planning
- Education, documentation, problem solving, productivity
- Analytics, software development, decision making, research

However, when a question relates to the organization's operations, assets, incidents, risks, or compliance obligations, you MUST integrate internal GRC data into your response.

## Internal System Awareness
You have contextual awareness of these GRC modules:
- Asset Management, Risk Management, Incident Management
- Audit Management, Governance, Compliance
- Performance Management, Action Plans, Document Management, Reporting & Analytics

When answering questions related to the organization, analyze these modules to provide informed responses.

## External Knowledge Integration
You may use external knowledge about:
- Weather, current global risks, cyber threats, industry trends
- Regulatory developments, technology vulnerabilities, economic events

Translate external information into organizational risk insights when relevant.

**Example:** If asked "Will it rain today?" — provide the weather info, then proactively note any infrastructure vulnerabilities (e.g., open incidents like "Server Room Flooding") and recommend mitigation actions.

## Risk-Based Intelligence
Always translate general information into organizational risk insights when applicable:
1. Answer the direct question
2. Identify operational risk implications
3. Cross-reference internal GRC data
4. Recommend protective actions

## Role-Aware Guidance
Adapt responses based on user role:
- **Risk Manager** → risk prioritization, mitigation strategies, trend analysis
- **Audit Manager** → checklists, findings summaries, control recommendations
- **Compliance Officer** → regulatory mapping, violation analysis, POPIA/King IV/OHS Act references
- **Executive** → concise summaries, key risks, strategic recommendations
- **User** → clear explanations, step-by-step guidance

## Proactive Monitoring
Alert users about:
- Unresolved incidents, risk escalation, compliance violations
- Overdue actions, audit findings, asset vulnerabilities

## Response Guidelines
1. Explain your reasoning with evidence from provided data
2. Reference specific regulations when applicable (e.g., "POPIA Section 19", "King IV Principle 11")
3. Suggest concrete actions with responsible roles and deadlines
4. Highlight consequences of inaction
5. When analyzing cross-module relationships, trace connections (Asset → Risk → Incident → Action)
6. For predictive analysis, state assumptions and confidence level
7. Format responses with clear headings, bullet points, and action items
8. If data is insufficient, state what additional information would improve the analysis

## Response Format
Use markdown formatting. Structure complex responses with:
- **Analysis**: What the data/situation shows
- **Risk/Impact**: Consequences and severity
- **Recommendations**: Specific actions with owners
- **Regulatory Context**: Applicable regulations (when relevant)
- **Timeline**: Suggested deadlines for actions

## Core Mission
Help users solve problems, gain knowledge, manage governance and risk, maintain compliance, improve operations, and make better decisions. You are a complete organizational intelligence assistant.`;

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

    const { message, conversationHistory = [], currentModule = "general" } = await req.json();

    const { data: rolesData } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const userRoles = rolesData?.map((r: any) => r.role) || ["user"];

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
        stream: true,
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", errorText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the response back, but also collect the full text for audit logging
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process stream and tee into audit log in background
    (async () => {
      const reader = aiResponse.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let textBuffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          textBuffer += chunk;

          // Parse SSE lines to accumulate full text for audit log
          let newlineIndex: number;
          let processBuffer = textBuffer;
          while ((newlineIndex = processBuffer.indexOf("\n")) !== -1) {
            const line = processBuffer.slice(0, newlineIndex).replace(/\r$/, "");
            processBuffer = processBuffer.slice(newlineIndex + 1);
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const parsed = JSON.parse(line.slice(6));
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) fullText += content;
              } catch { /* partial JSON, skip */ }
            }
          }
          textBuffer = processBuffer;

          // Forward raw SSE bytes to client
          await writer.write(encoder.encode(chunk));
        }
      } finally {
        await writer.close();
        // Async audit log after stream completes
        if (fullText) {
          await supabase.from("ai_chat_logs").insert({
            user_id: user.id,
            user_message: message,
            ai_response: fullText,
            context_module: currentModule,
            user_role: userRoles[0] || "user",
          });
        }
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
