export async function GemmaAnalysis(scrapedData: {screenshot: string; content: string;}){
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "google/gemma-3-27b:free",
            messages: [
                {
                    role: "system",
                    content: "You are cybersecurity expert. You have to Analyze the provided website content and screenshot for phishing , malware or suspicious behaivior. Provide a detailed report on your findings and any potential risks associated with the website. And rate the risk score 0-100. Also analyze the email screnshot to see for milicious content check the email address, subject and content of the email."
                }, {
                    role: "user",
                    content: [
                        {type: "text", text: `Analyze this site source code: ${scrapedData.content.slice(0, 2000)}`},
                        {type: "image_url" , image_url: {url: `data:image/png;base64,${scrapedData.screenshot}`}}
                    ]
                }
            ]
        })
    })
    return response.json();
}

type UrlAiAnalysisResult = {
    aiScore: number;
    confidence: number;
    reasons: string[];
    model: string;
};

function extractFirstJsonBlock(input: string): string | null {
    const start = input.indexOf("{");
    const end = input.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
        return null;
    }

    return input.slice(start, end + 1);
}

export async function analyzeUrlWithAi(payload: { url: string; htmlSnippet: string; }): Promise<UrlAiAnalysisResult | null> {
    if (!process.env.OPENROUTER_API_KEY) {
        return null;
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemma-3-27b:free",
                temperature: 0.1,
                messages: [
                    {
                        role: "system",
                        content: "You are a phishing analyst. Respond only with valid JSON containing keys: ai_score (0..1), confidence (0..100), reasons (string[]).",
                    },
                    {
                        role: "user",
                        content: `Analyze phishing risk for URL: ${payload.url}\nHTML snippet:\n${payload.htmlSnippet.slice(0, 2500)}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json() as {
            model?: string;
            choices?: Array<{ message?: { content?: string } }>;
        };

        const content = data.choices?.[0]?.message?.content ?? "";
        const jsonBlock = extractFirstJsonBlock(content);
        if (!jsonBlock) {
            return null;
        }

        const parsed = JSON.parse(jsonBlock) as {
            ai_score?: number;
            confidence?: number;
            reasons?: string[];
        };

        const aiScore = Number.isFinite(parsed.ai_score) ? Math.max(0, Math.min(1, parsed.ai_score as number)) : 0;
        const confidence = Number.isFinite(parsed.confidence) ? Math.max(0, Math.min(100, parsed.confidence as number)) : 50;
        const reasons = Array.isArray(parsed.reasons) ? parsed.reasons.filter((reason) => typeof reason === "string") : ["AI risk analysis completed."];

        return {
            aiScore,
            confidence,
            reasons,
            model: data.model ?? "google/gemma-3-27b:free",
        };
    } catch {
        return null;
    }
}