import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    let categories;
    if (userId) {
      // Show default (shared) categories + user's own categories
      categories = await sql(
        `SELECT * FROM categories WHERE user_id IS NULL OR user_id = $1 ORDER BY category_type, name`,
        [userId],
      );
    } else {
      // Guest mode: show only default categories
      categories =
        await sql`SELECT * FROM categories WHERE user_id IS NULL ORDER BY category_type, name`;
    }
    return Response.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const body = await request.json();
    const name = body.name;
    const categoryType = body.category_type;
    const icon = body.icon || "circle";
    const color = body.color || "#6B7280";

    if (!name || !categoryType) {
      return Response.json(
        { error: "Name and category type are required" },
        { status: 400 },
      );
    }

    const result = await sql(
      `INSERT INTO categories (name, category_type, icon, color, is_default, user_id)
       VALUES ($1, $2, $3, $4, false, $5)
       RETURNING *`,
      [name, categoryType, icon, color, userId],
    );

    return Response.json(result[0], { status: 201 });
  } catch (err) {
    console.error("Error creating category:", err);
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
