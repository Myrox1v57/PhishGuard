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