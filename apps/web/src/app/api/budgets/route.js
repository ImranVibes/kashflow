import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    let budgets;
    if (userId) {
      budgets = await sql(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color, c.category_type
        FROM budgets b LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.user_id = $1 ORDER BY c.name`,
        [userId],
      );
    } else {
      budgets = await sql`
        SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color, c.category_type
        FROM budgets b LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.user_id IS NULL ORDER BY c.name
      `;
    }
    return Response.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return Response.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const { category_id, amount, period } = await request.json();

    if (!category_id || !amount) {
      return Response.json(
        { error: "Category and amount are required" },
        { status: 400 },
      );
    }

    // Check if budget already exists for this user+category+period
    let existing;
    if (userId) {
      existing = await sql(
        `SELECT id FROM budgets WHERE category_id = $1 AND period = $2 AND user_id = $3`,
        [category_id, period || "month", userId],
      );
    } else {
      existing = await sql(
        `SELECT id FROM budgets WHERE category_id = $1 AND period = $2 AND user_id IS NULL`,
        [category_id, period || "month"],
      );
    }

    if (existing.length > 0) {
      const updated = await sql(
        `UPDATE budgets SET amount = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [amount, existing[0].id],
      );
      return Response.json(updated[0]);
    }

    const result = await sql(
      `INSERT INTO budgets (category_id, amount, period, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [category_id, amount, period || "month", userId],
    );
    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return Response.json({ error: "Failed to create budget" }, { status: 500 });
  }
}
