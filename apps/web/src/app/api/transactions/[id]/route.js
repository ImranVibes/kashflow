import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await sql`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ${id}
    `;

    if (result.length === 0) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return Response.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      transaction_type,
      amount,
      description,
      category_id,
      notes,
      transaction_date,
    } = body;

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    if (transaction_type !== undefined) {
      setClauses.push(`transaction_type = $${paramIndex}`);
      values.push(transaction_type);
      paramIndex++;
    }
    if (amount !== undefined) {
      setClauses.push(`amount = $${paramIndex}`);
      values.push(amount);
      paramIndex++;
    }
    if (description !== undefined) {
      setClauses.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }
    if (category_id !== undefined) {
      setClauses.push(`category_id = $${paramIndex}`);
      values.push(category_id);
      paramIndex++;
    }
    if (notes !== undefined) {
      setClauses.push(`notes = $${paramIndex}`);
      values.push(notes);
      paramIndex++;
    }
    if (transaction_date !== undefined) {
      setClauses.push(`transaction_date = $${paramIndex}`);
      values.push(transaction_date);
      paramIndex++;
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const queryStr = `UPDATE transactions SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const result = await sql(queryStr, values);

    if (result.length === 0) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    const transaction = await sql`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ${id}
    `;

    return Response.json(transaction[0]);
  } catch (error) {
    console.error("Error updating transaction:", error);
    return Response.json(
      { error: "Failed to update transaction" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result =
      await sql`DELETE FROM transactions WHERE id = ${id} RETURNING id`;

    if (result.length === 0) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    return Response.json({ success: true, id: result[0].id });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return Response.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
}
