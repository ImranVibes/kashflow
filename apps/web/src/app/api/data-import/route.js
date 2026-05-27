import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const backup = await request.json();

    if (!backup || !backup.version) {
      return Response.json(
        { error: "Invalid backup file format" },
        { status: 400 },
      );
    }

    const {
      transactions = [],
      categories = [],
      budgets = [],
      recurring_transactions = [],
    } = backup;

    let categoriesImported = 0;
    let transactionsImported = 0;
    let budgetsImported = 0;
    let recurringImported = 0;

    const categoryIdMap = {};

    // Build a map of existing categories visible to this user
    let existingCategories;
    if (userId) {
      existingCategories = await sql(
        `SELECT * FROM categories WHERE user_id IS NULL OR user_id = $1`,
        [userId],
      );
    } else {
      existingCategories =
        await sql`SELECT * FROM categories WHERE user_id IS NULL`;
    }

    const existingByName = {};
    existingCategories.forEach((c) => {
      existingByName[`${c.name}__${c.category_type}`] = c.id;
    });

    for (const cat of categories) {
      const key = `${cat.name}__${cat.category_type}`;
      if (existingByName[key]) {
        categoryIdMap[cat.id] = existingByName[key];
      } else {
        const result = await sql(
          `INSERT INTO categories (name, category_type, icon, color, is_default, user_id)
           VALUES ($1, $2, $3, $4, false, $5) RETURNING id`,
          [
            cat.name,
            cat.category_type,
            cat.icon || "circle",
            cat.color || "#6B7280",
            userId,
          ],
        );
        categoryIdMap[cat.id] = result[0].id;
        existingByName[key] = result[0].id;
        categoriesImported++;
      }
    }

    // Import transactions with user_id
    for (const t of transactions) {
      const newCategoryId = t.category_id
        ? categoryIdMap[t.category_id] || null
        : null;
      try {
        await sql(
          `INSERT INTO transactions (category_id, transaction_type, amount, description, notes, transaction_date, user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            newCategoryId,
            t.transaction_type,
            t.amount,
            t.description,
            t.notes || null,
            t.transaction_date,
            userId,
          ],
        );
        transactionsImported++;
      } catch (e) {
        console.error("Skipping transaction:", e.message);
      }
    }

    // Import budgets with user_id
    for (const b of budgets) {
      const newCategoryId = b.category_id
        ? categoryIdMap[b.category_id] || null
        : null;
      try {
        await sql(
          `INSERT INTO budgets (category_id, amount, period, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
          [newCategoryId, b.amount, b.period || "month", userId],
        );
        budgetsImported++;
      } catch (e) {
        console.error("Skipping budget:", e.message);
      }
    }

    // Import recurring transactions with user_id
    for (const r of recurring_transactions) {
      const newCategoryId = r.category_id
        ? categoryIdMap[r.category_id] || null
        : null;
      try {
        await sql(
          `INSERT INTO recurring_transactions (category_id, transaction_type, amount, description, notes, frequency, next_date, is_active, user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newCategoryId,
            r.transaction_type,
            r.amount,
            r.description,
            r.notes || null,
            r.frequency,
            r.next_date,
            r.is_active !== false,
            userId,
          ],
        );
        recurringImported++;
      } catch (e) {
        console.error("Skipping recurring:", e.message);
      }
    }

    return Response.json({
      success: true,
      imported: {
        categories: categoriesImported,
        transactions: transactionsImported,
        budgets: budgetsImported,
        recurring: recurringImported,
      },
    });
  } catch (error) {
    console.error("Import error:", error);
    return Response.json(
      { error: "Failed to import data: " + error.message },
      { status: 500 },
    );
  }
}
