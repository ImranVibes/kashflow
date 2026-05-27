import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    let transactions, categories, budgets, recurring;

    if (userId) {
      transactions = await sql(
        `SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = $1 ORDER BY t.transaction_date DESC`,
        [userId],
      );
      categories = await sql(
        `SELECT * FROM categories WHERE user_id IS NULL OR user_id = $1 ORDER BY name`,
        [userId],
      );
      budgets = await sql(
        `SELECT b.*, c.name as category_name FROM budgets b LEFT JOIN categories c ON b.category_id = c.id WHERE b.user_id = $1`,
        [userId],
      );
      recurring = await sql(
        `SELECT r.*, c.name as category_name FROM recurring_transactions r LEFT JOIN categories c ON r.category_id = c.id WHERE r.user_id = $1`,
        [userId],
      );
    } else {
      transactions =
        await sql`SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id IS NULL ORDER BY t.transaction_date DESC`;
      categories =
        await sql`SELECT * FROM categories WHERE user_id IS NULL ORDER BY name`;
      budgets =
        await sql`SELECT b.*, c.name as category_name FROM budgets b LEFT JOIN categories c ON b.category_id = c.id WHERE b.user_id IS NULL`;
      recurring =
        await sql`SELECT r.*, c.name as category_name FROM recurring_transactions r LEFT JOIN categories c ON r.category_id = c.id WHERE r.user_id IS NULL`;
    }

    const backup = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      transactions,
      categories,
      budgets,
      recurring_transactions: recurring,
    };

    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="business-tracker-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return Response.json({ error: "Failed to export data" }, { status: 500 });
  }
}
