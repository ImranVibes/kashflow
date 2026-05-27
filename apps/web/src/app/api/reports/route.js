import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "month";

    let dateFilter = "";
    let periodLabel = "";
    const now = new Date();

    if (period === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      dateFilter = d.toISOString().split("T")[0];
      periodLabel = "Last 7 Days";
    } else if (period === "month") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      dateFilter = d.toISOString().split("T")[0];
      periodLabel = "Last 30 Days";
    } else if (period === "year") {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      dateFilter = d.toISOString().split("T")[0];
      periodLabel = "Last 12 Months";
    }

    const totals = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE transaction_date >= ${dateFilter}
    `;

    const transactions = await sql`
      SELECT t.*, c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.transaction_date >= ${dateFilter}
      ORDER BY t.transaction_date DESC
    `;

    const categoryBreakdown = await sql`
      SELECT
        c.name,
        c.category_type,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COUNT(t.id) as transaction_count
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id AND t.transaction_date >= ${dateFilter}
      GROUP BY c.id, c.name, c.category_type
      HAVING COUNT(t.id) > 0
      ORDER BY total_amount DESC
    `;

    const totalIncome = parseFloat(totals[0].total_income);
    const totalExpenses = parseFloat(totals[0].total_expenses);
    const netProfit = totalIncome - totalExpenses;
    const reportDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const transactionRows = transactions
      .map(
        (t) => `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 10px 12px; font-size: 13px; color: #111827;">${t.transaction_date}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #111827;">${t.description}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #6B7280;">${t.category_name || "Uncategorized"}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-weight: 600; color: ${t.transaction_type === "income" ? "#16A34A" : "#DC2626"};">
          ${t.transaction_type === "income" ? "+" : "-"}$${parseFloat(t.amount).toFixed(2)}
        </td>
      </tr>
    `,
      )
      .join("");

    const categoryRows = categoryBreakdown
      .map(
        (c) => `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 10px 12px; font-size: 13px; color: #111827;">${c.name}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #6B7280; text-transform: capitalize;">${c.category_type}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: center; color: #6B7280;">${c.transaction_count}</td>
        <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-weight: 600; color: #111827;">$${parseFloat(c.total_amount).toFixed(2)}</td>
      </tr>
    `,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; background: #fff; }
    .header { background: linear-gradient(135deg, #1D4ED8, #2563EB); color: white; padding: 40px; }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 14px; opacity: 0.85; }
    .content { padding: 32px 40px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .summary-card { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 20px; }
    .summary-card .label { font-size: 12px; color: #6B7280; margin-bottom: 6px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-card .value { font-size: 24px; font-weight: 700; }
    .income .value { color: #16A34A; }
    .expense .value { color: #DC2626; }
    .profit .value { color: ${netProfit >= 0 ? "#16A34A" : "#DC2626"}; }
    .section-title { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #E5E7EB; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead { background: #F9FAFB; }
    thead th { padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th:last-child { text-align: right; }
    .footer { text-align: center; padding: 20px 40px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Financial Report</h1>
    <p>Period: ${periodLabel} &nbsp;|&nbsp; Generated: ${reportDate}</p>
  </div>
  <div class="content">
    <div class="summary-grid">
      <div class="summary-card income">
        <div class="label">Total Income</div>
        <div class="value">$${totalIncome.toFixed(2)}</div>
      </div>
      <div class="summary-card expense">
        <div class="label">Total Expenses</div>
        <div class="value">$${totalExpenses.toFixed(2)}</div>
      </div>
      <div class="summary-card profit">
        <div class="label">Net Profit</div>
        <div class="value">${netProfit >= 0 ? "" : "-"}$${Math.abs(netProfit).toFixed(2)}</div>
      </div>
    </div>

    <h2 class="section-title">Category Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Type</th>
          <th style="text-align:center;">Transactions</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>${categoryRows}</tbody>
    </table>

    <h2 class="section-title">All Transactions (${transactions.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${transactionRows}</tbody>
    </table>
  </div>
  <div class="footer">Business Expense Tracker &mdash; Confidential Financial Report</div>
</body>
</html>`;

    const pdfResponse = await fetch("/integrations/pdf-generation/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: { html } }),
    });

    if (!pdfResponse.ok) {
      throw new Error("PDF generation failed");
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="financial-report-${period}-${now.toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return Response.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
