import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { runUrlScanner } from "@/app/lib/scanner/urlScanner";
import { createClient } from "@/app/utils/superbase/server";

type ScanRequestBody = {
  url?: string;
};

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let requestBody: ScanRequestBody;
  try {
    requestBody = (await request.json()) as ScanRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const inputUrl = requestBody.url?.trim();
  if (!inputUrl) {
    return NextResponse.json({ error: "URL is required." }, { status: 400 });
  }

  const {
    data: job,
    error: jobError,
  } = await supabase
    .from("url_scan_jobs")
    .insert({
      user_id: user.id,
      status: "running",
      requested_url: inputUrl,
      source: "dashboard_scan",
      started_at: new Date().toISOString(),
      request_meta: {
        user_agent: request.headers.get("user-agent"),
      },
    })
    .select("id")
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Failed to create scan job." }, { status: 500 });
  }

  const startedAt = Date.now();

  try {
    const scan = await runUrlScanner(inputUrl);

    const signalRows = scan.signals.map((entry) => ({
      job_id: job.id,
      category: entry.category,
      signal_key: entry.key,
      is_triggered: entry.triggered,
      signal_value_num: entry.value ?? null,
      weight: entry.weight,
      reason: entry.reason,
      evidence: entry.evidence ?? {},
    }));

    if (signalRows.length) {
      const { error: signalError } = await supabase.from("url_scan_signals").insert(signalRows);
      if (signalError) {
        throw new Error(signalError.message);
      }
    }

    const { error: resultError } = await supabase.from("url_scan_results").insert({
      job_id: job.id,
      risk_score: scan.riskScore,
      confidence: scan.confidence,
      verdict: scan.verdict,
      lexical_score: scan.components.lexical,
      domain_score: scan.components.domain,
      reputation_score: scan.components.reputation,
      browser_score: scan.components.browser,
      ai_score: scan.components.ai,
      override_flags: scan.overrideFlags,
      reasons: scan.reasons,
      model_provider: scan.model?.provider ?? null,
      model_name: scan.model?.name ?? null,
      model_version: scan.model?.version ?? null,
      latency_ms: Date.now() - startedAt,
    });

    if (resultError) {
      throw new Error(resultError.message);
    }

    const { error: updateError } = await supabase
      .from("url_scan_jobs")
      .update({
        status: "completed",
        normalized_url: scan.normalizedUrl,
        final_url: scan.finalUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      jobId: job.id,
      result: {
        risk_score: scan.riskScore,
        confidence: scan.confidence,
        verdict: scan.verdict,
        final_url: scan.finalUrl,
        urlscan_uuid: scan.urlscanUuid,
        urlscan_source: scan.urlscanSource,
        urlscan_score: scan.urlscanScore,
        reasons: scan.reasons,
        signals: scan.signals,
        components: scan.components,
        override_flags: scan.overrideFlags,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed.";

    await supabase
      .from("url_scan_jobs")
      .update({
        status: "failed",
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}