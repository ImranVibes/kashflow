import sql from "@/app/api/utils/sql";

async function callGemini(apiKey, modelId, systemPrompt, userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
    }),
  });
  if (!res.ok)
    throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function callOpenAI(apiKey, modelId, systemPrompt, userMessage) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 512,
    }),
  });
  if (!res.ok)
    throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropic(apiKey, modelId, systemPrompt, userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelId,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      max_tokens: 512,
    }),
  });
  if (!res.ok)
    throw new Error(`Anthropic error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text;
}

async function callMistral(apiKey, modelId, systemPrompt, userMessage) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 512,
    }),
  });
  if (!res.ok)
    throw new Error(`Mistral error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callOpenRouter(apiKey, modelId, systemPrompt, userMessage) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://businesstracker.app",
      "X-Title": "Business Tracker",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 512,
    }),
  });
  if (!res.ok)
    throw new Error(`OpenRouter error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callPlatformGemini(systemPrompt, userMessage) {
  const res = await fetch("/integrations/google-gemini-2-5-flash/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Platform error: ${res.status}`);
  const data = await res.json();
  return data.choices[0].message.content;
}

function extractJSON(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1) return raw.slice(start, end + 1);
  throw new Error("No JSON found in response");
}

export async function POST(request) {
  try {
    const { input, currency } = await request.json();
    if (!input || !input.trim()) {
      return Response.json(
        { error: "Input text is required" },
        { status: 400 },
      );
    }

    const currencyCode = currency?.code || "USD";
    const currencyName = currency?.name || "US Dollar";
    const currencySymbol = currency?.symbol || "$";

    const categories =
      await sql`SELECT id, name, category_type FROM categories ORDER BY name`;
    const categoryList = categories
      .map((c) => `${c.id}: ${c.name} (${c.category_type})`)
      .join("\n");

    const systemPrompt = `You are a smart financial assistant. Parse natural language (in any language) into transaction data.
The user's preferred currency is ${currencyCode} (${currencyName}, symbol: ${currencySymbol}).

Extract these exact fields:
- transaction_type: "expense" or "income"
- amount: the numeric amount (as a number, no currency symbols)
- description: a clean, concise English description
- category_id: best matching category ID from the list
- transaction_date: date if mentioned (YYYY-MM-DD), otherwise null
- confidence: "high", "medium", or "low"

Currency rules (IMPORTANT):
- If no currency is mentioned, assume ${currencyCode}
- "Taka" or "টাকা" = BDT (Bangladeshi Taka)
- "Rupee", "Rupiya", "Rs", "টাকা" = could be BDT/INR/PKR depending on context
- "Dollar", "$" = USD
- "Euro", "€" = EUR
- "Pound", "£" = GBP
- Always extract just the raw number (e.g. if user says "200 Taka", amount = 200)

Language rules:
- "bhara" / "ভাড়া" = fare/rent (expense)
- "khabar" / "খাবার" = food (expense)
- "salary" / "বেতন" = salary (income)
- "bill" / "বিল" = utility bill (expense)
- paying/buying/cost/spent/subscription/fee → "expense"
- received/earned/revenue/sold/income → "income"

Available categories:
${categoryList}

Return ONLY valid JSON, no markdown, no extra text.
Today's date: ${new Date().toISOString().split("T")[0]}`;

    const activeConfig =
      await sql`SELECT * FROM ai_config WHERE is_active = true LIMIT 1`;
    let rawText;
    let usedProvider = "platform";
    let usedModel = "gemini-2.5-flash";

    if (activeConfig.length > 0) {
      const { provider, model_id, api_key } = activeConfig[0];
      usedProvider = provider;
      usedModel = model_id;
      try {
        switch (provider) {
          case "gemini":
            rawText = await callGemini(api_key, model_id, systemPrompt, input);
            break;
          case "openai":
            rawText = await callOpenAI(api_key, model_id, systemPrompt, input);
            break;
          case "anthropic":
            rawText = await callAnthropic(
              api_key,
              model_id,
              systemPrompt,
              input,
            );
            break;
          case "mistral":
            rawText = await callMistral(api_key, model_id, systemPrompt, input);
            break;
          case "openrouter":
            rawText = await callOpenRouter(
              api_key,
              model_id,
              systemPrompt,
              input,
            );
            break;
          default:
            rawText = await callPlatformGemini(systemPrompt, input);
            usedProvider = "platform";
        }
      } catch (err) {
        console.error("Custom provider failed, falling back:", err.message);
        rawText = await callPlatformGemini(systemPrompt, input);
        usedProvider = "platform";
      }
    } else {
      rawText = await callPlatformGemini(systemPrompt, input);
    }

    const parsed = JSON.parse(extractJSON(rawText));
    const matchedCategory = categories.find((c) => c.id === parsed.category_id);

    return Response.json({
      ...parsed,
      category_name: matchedCategory ? matchedCategory.name : "Unknown",
      transaction_date:
        parsed.transaction_date || new Date().toISOString().split("T")[0],
      used_provider: usedProvider,
      used_model: usedModel,
      currency_code: currencyCode,
    });
  } catch (error) {
    console.error("AI parse error:", error);
    return Response.json(
      { error: "Failed to parse. Please try again or enter manually." },
      { status: 500 },
    );
  }
}
