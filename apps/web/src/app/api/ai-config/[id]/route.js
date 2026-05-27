import sql from "@/app/api/utils/sql";

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { model_id, api_key, is_active } = await request.json();

    if (is_active === true) {
      // Deactivate all others first
      await sql`UPDATE ai_config SET is_active = false`;
      await sql`UPDATE ai_config SET is_active = true, updated_at = now() WHERE id = ${id}`;
    }

    if (model_id || api_key) {
      const setClauses = [];
      const values = [];
      let idx = 1;
      if (model_id) {
        setClauses.push(`model_id = $${idx}`);
        values.push(model_id);
        idx++;
      }
      if (api_key) {
        setClauses.push(`api_key = $${idx}`);
        values.push(api_key);
        idx++;
      }
      setClauses.push(`updated_at = now()`);
      values.push(id);
      await sql(
        `UPDATE ai_config SET ${setClauses.join(", ")} WHERE id = $${idx}`,
        values,
      );
    }

    const updated =
      await sql`SELECT id, provider, model_id, is_active FROM ai_config WHERE id = ${id}`;
    if (updated.length === 0)
      return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(updated[0]);
  } catch (error) {
    console.error("PUT ai-config error:", error);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await sql`DELETE FROM ai_config WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE ai-config error:", error);
    return Response.json({ error: "Failed to delete" }, { status: 500 });
  }
}
