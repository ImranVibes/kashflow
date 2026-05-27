import { offlineDb } from "./offlineDb";

export const offlineAiParser = {
  async parseTransaction(input) {
    if (!input || !input.trim()) {
      throw new Error("Input is empty");
    }

    const { active } = await offlineDb.getAiConfigs();
    if (!active || !active.api_key) {
      throw new Error("NO_API_KEY");
    }

    const categories = await offlineDb.getCategories();
    const categoriesListStr = categories
      .map((c) => `- ID: ${c.id}, Name: "${c.name}", Type: "${c.category_type}"`)
      .join("\n");

    const systemPrompt = `You are a financial assistant for the KashFlow app. 
Analyze the user's input and extract transaction details.
You must select the most appropriate category from this list:
${categoriesListStr}

Respond ONLY with a JSON object. No markdown formatting, no backticks, no other text. Just the JSON object.
Schema:
{
  "transaction_type": "expense" | "income",
  "amount": number,
  "description": "A short, clean description of the transaction (e.g. 'Bus fare', 'Salary payment')",
  "category_id": number (choose the ID from the list above)
}`;

    const provider = active.provider;
    const model = active.model_id;
    const apiKey = active.api_key;

    let parsed = null;

    if (provider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `User transaction input: "${input}"` },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
      }

      const resJson = await response.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response from Gemini API");

      parsed = this.cleanAndParseJson(text);
    } else if (provider === "openai") {
      const url = "https://api.openai.com/v1/chat/completions";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
      }

      const resJson = await response.json();
      const text = resJson.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response from OpenAI API");

      parsed = this.cleanAndParseJson(text);
    } else if (provider === "anthropic") {
      const url = "https://api.anthropic.com/v1/messages";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "dangerously-allow-html-user-sent-messages": "true"
        },
        body: JSON.stringify({
          model,
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: input }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`);
      }

      const resJson = await response.json();
      const text = resJson.content?.[0]?.text;
      if (!text) throw new Error("Empty response from Anthropic API");

      parsed = this.cleanAndParseJson(text);
    } else if (provider === "mistral") {
      const url = "https://api.mistral.ai/v1/chat/completions";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Mistral API error: ${response.status}`);
      }

      const resJson = await response.json();
      const text = resJson.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response from Mistral API");

      parsed = this.cleanAndParseJson(text);
    } else if (provider === "openrouter") {
      const url = "https://openrouter.ai/api/v1/chat/completions";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://kashflow.app",
          "X-Title": "KashFlow",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
      }

      const resJson = await response.json();
      const text = resJson.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response from OpenRouter API");

      parsed = this.cleanAndParseJson(text);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }

    // Post-process the parsed result to ensure it matches the local category map
    if (parsed) {
      const matchedCat = categories.find(
        (c) => c.id.toString() === parsed.category_id?.toString()
      );
      parsed.category_name = matchedCat ? matchedCat.name : "Uncategorized";
      parsed.category_id = matchedCat ? matchedCat.id : null;
      parsed.amount = parseFloat(parsed.amount) || 0;
    }

    return parsed;
  },

  cleanAndParseJson(text) {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();
    return JSON.parse(cleanText);
  },
};
