import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    let recurring;
    if (userId) {
      recurring = await sql(
        `SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM recurring_transactions r LEFT JOIN categories c ON r.category_id = c.id
        WHERE r.user_id = $1 ORDER BY r.next_date ASC`,
        [userId],
      );
    } else {
      recurring = await sql`
        SELECT r.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM recurring_transactions r LEFT JOIN categories c ON r.category_id = c.id
        WHERE r.user_id IS NULL ORDER BY r.next_date ASC
      `;
    }
    return Response.json(recurring);
  } catch (error) {
    console.error("Error fetching recurring:", error);
    return Response.json(
      { error: "Failed to fetch recurring transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const {
      category_id,
      transaction_type,
      amount,
      description,
      notes,
      frequency,
      next_date,
    } = await request.json();

    if (
      !transaction_type ||
      !amount ||
      !description ||
      !frequency ||
      !next_date
    ) {
      return Response.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const result = await sql(
      `INSERT INTO recurring_transactions (category_id, transaction_type, amount, description, notes, frequency, next_date, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        category_id || null,
        transaction_type,
        amount,
        description,
        notes || null,
        frequency,
        next_date,
        userId,
      ],
    );
    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating recurring:", error);
    return Response.json(
      { error: "Failed to create recurring transaction" },
      { status: 500 },
    );
  }
}
