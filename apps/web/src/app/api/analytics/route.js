import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "month";

    let dateFilter = "";
    const now = new Date();
    if (period === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      dateFilter = d.toISOString().split("T")[0];
    } else if (period === "month") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      dateFilter = d.toISOString().split("T")[0];
    } else if (period === "year") {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      dateFilter = d.toISOString().split("T")[0];
    }

    let totals, categoryBreakdown, dailyTrend, recentTransactions;

    if (userId) {
      totals = await sql(
        `SELECT
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
          COUNT(*) as total_transactions
        FROM transactions
        WHERE transaction_date >= $1 AND user_id = $2`,
        [dateFilter, userId],
      );

      categoryBreakdown = await sql(
        `SELECT c.id, c.name, c.icon, c.color, c.category_type,
          COALESCE(SUM(t.amount), 0) as total_amount,
          COUNT(t.id) as transaction_count
        FROM categories c
        LEFT JOIN transactions t ON c.id = t.category_id AND t.transaction_date >= $1 AND t.user_id = $2
        GROUP BY c.id, c.name, c.icon, c.color, c.category_type
        HAVING COUNT(t.id) > 0
        ORDER BY total_amount DESC`,
        [dateFilter, userId],
      );

      dailyTrend = await sql(
        `SELECT transaction_date,
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as expenses
        FROM transactions
        WHERE transaction_date >= $1 AND user_id = $2
        GROUP BY transaction_date
        ORDER BY transaction_date ASC`,
        [dateFilter, userId],
      );

      recentTransactions = await sql(
        `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1
        ORDER BY t.transaction_date DESC, t.created_at DESC
        LIMIT 10`,
        [userId],
      );
    } else {
      // Guest mode — show only null-user data
      totals = await sql(
        `SELECT
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
          COUNT(*) as total_transactions
        FROM transactions
        WHERE transaction_date >= $1 AND user_id IS NULL`,
        [dateFilter],
      );

      categoryBreakdown = await sql(
        `SELECT c.id, c.name, c.icon, c.color, c.category_type,
          COALESCE(SUM(t.amount), 0) as total_amount,
          COUNT(t.id) as transaction_count
        FROM categories c
        LEFT JOIN transactions t ON c.id = t.category_id AND t.transaction_date >= $1 AND t.user_id IS NULL
        GROUP BY c.id, c.name, c.icon, c.color, c.category_type
        HAVING COUNT(t.id) > 0
        ORDER BY total_amount DESC`,
        [dateFilter],
      );

      dailyTrend = await sql(
        `SELECT transaction_date,
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as expenses
        FROM transactions
        WHERE transaction_date >= $1 AND user_id IS NULL
        GROUP BY transaction_date
        ORDER BY transaction_date ASC`,
        [dateFilter],
      );

      recentTransactions = await sql(
        `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id IS NULL
        ORDER BY t.transaction_date DESC, t.created_at DESC
        LIMIT 10`,
        [],
      );
    }

    const totalIncome = parseFloat(totals[0].total_income);
    const totalExpenses = parseFloat(totals[0].total_expenses);
    const netProfit = totalIncome - totalExpenses;

    return Response.json({
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        totalTransactions: parseInt(totals[0].total_transactions),
      },
      categoryBreakdown,
      dailyTrend,
      recentTransactions,
      period,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
