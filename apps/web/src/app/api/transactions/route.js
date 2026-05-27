import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const search = url.searchParams.get("search");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let queryStr = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filter by user: if logged in show only their data, if guest show only null-user data
    if (userId) {
      queryStr += ` AND t.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else {
      queryStr += ` AND t.user_id IS NULL`;
    }

    if (type && type !== "all") {
      queryStr += ` AND t.transaction_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (search) {
      queryStr += ` AND LOWER(t.description) LIKE LOWER($${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (startDate) {
      queryStr += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryStr += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    queryStr += ` ORDER BY t.transaction_date DESC, t.created_at DESC`;
    queryStr += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const transactions = await sql(queryStr, params);
    return Response.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const {
      transaction_type,
      amount,
      description,
      category_id,
      notes,
      transaction_date,
    } = await request.json();

    if (!transaction_type || !amount || !description) {
      return Response.json(
        { error: "Type, amount, and description are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO transactions (transaction_type, amount, description, category_id, notes, transaction_date, user_id)
      VALUES (
        ${transaction_type},
        ${amount},
        ${description},
        ${category_id || null},
        ${notes || null},
        ${transaction_date || new Date().toISOString().split("T")[0]},
        ${userId}
      )
      RETURNING *
    `;

    const transaction = await sql`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ${result[0].id}
    `;

    return Response.json(transaction[0], { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return Response.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
