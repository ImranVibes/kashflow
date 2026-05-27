import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`DELETE FROM budgets WHERE id = ${id} RETURNING id`;
    if (result.length === 0) {
      return Response.json({ error: "Budget not found" }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return Response.json({ error: "Failed to delete budget" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { amount, period } = await request.json();

    const result = await sql`
      UPDATE budgets SET amount = ${amount}, period = ${period}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return Response.json({ error: "Budget not found" }, { status: 404 });
    }
    return Response.json(result[0]);
  } catch (error) {
    console.error("Error updating budget:", error);
    return Response.json({ error: "Failed to update budget" }, { status: 500 });
  }
}
