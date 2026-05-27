import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const hasTransactions = await sql`
      SELECT COUNT(*) as cnt FROM transactions WHERE category_id = ${id}
    `;

    if (parseInt(hasTransactions[0].cnt) > 0) {
      return Response.json(
        {
          error:
            "Cannot delete category with existing transactions. Reassign transactions first.",
        },
        { status: 400 },
      );
    }

    const result =
      await sql`DELETE FROM categories WHERE id = ${id} AND is_default = false RETURNING id`;

    if (result.length === 0) {
      return Response.json(
        { error: "Category not found or is a default category" },
        { status: 404 },
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
