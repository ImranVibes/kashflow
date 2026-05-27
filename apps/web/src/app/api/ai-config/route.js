import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const configs = await sql`
      SELECT id, provider, model_id, is_active,
        CASE WHEN LENGTH(api_key) > 8
          THEN CONCAT(SUBSTRING(api_key, 1, 4), '••••••••', SUBSTRING(api_key, LENGTH(api_key) - 3))
          ELSE '••••••••'
        END as api_key_masked,
        created_at
      FROM ai_config
      ORDER BY is_active DESC, created_at DESC
    `;
    const active =
      await sql`SELECT * FROM ai_config WHERE is_active = true LIMIT 1`;
    return Response.json({ configs, active: active[0] || null });
  } catch (error) {
    console.error("GET ai-config error:", error);
    return Response.json(
      { error: "Failed to fetch AI config" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { provider, model_id, api_key, set_active } = await request.json();
    if (!provider || !model_id || !api_key) {
      return Response.json(
        { error: "provider, model_id, and api_key are required" },
        { status: 400 },
      );
    }

    // Check if this provider already exists — update it
    const existing =
      await sql`SELECT id FROM ai_config WHERE provider = ${provider} LIMIT 1`;

    let result;
    if (existing.length > 0) {
      result = await sql`
        UPDATE ai_config SET model_id = ${model_id}, api_key = ${api_key}, updated_at = now()
        WHERE provider = ${provider} RETURNING id, provider, model_id, is_active
      `;
    } else {
      result = await sql`
        INSERT INTO ai_config (provider, model_id, api_key, is_active)
        VALUES (${provider}, ${model_id}, ${api_key}, false)
        RETURNING id, provider, model_id, is_active
      `;
    }

    if (set_active) {
      // Deactivate all, then activate this one
      await sql`UPDATE ai_config SET is_active = false`;
      await sql`UPDATE ai_config SET is_active = true WHERE id = ${result[0].id}`;
      result[0].is_active = true;
    }

    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST ai-config error:", error);
    return Response.json(
      { error: "Failed to save AI config" },
      { status: 500 },
    );
  }
}
