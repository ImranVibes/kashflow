import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result =
      await sql`DELETE FROM recurring_transactions WHERE id = ${id} RETURNING id`;
    if (result.length === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting recurring:", error);
    return Response.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { is_active } = await request.json();
    const result = await sql`
      UPDATE recurring_transactions SET is_active = ${is_active} WHERE id = ${id} RETURNING *
    `;
    if (result.length === 0) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating recurring:", error);
    return Response.json({ error: "Failed to update" }, { status: 500 });
  }
}
