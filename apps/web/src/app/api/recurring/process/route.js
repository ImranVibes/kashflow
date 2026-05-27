import sql from "@/app/api/utils/sql";

function getNextDate(currentDate, frequency) {
  const date = new Date(currentDate);
  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().split("T")[0];
}

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const dueRecurring = await sql`
      SELECT * FROM recurring_transactions
      WHERE is_active = TRUE AND next_date <= ${today}
    `;

    const processed = [];

    for (const recurring of dueRecurring) {
      await sql`
        INSERT INTO transactions (transaction_type, amount, description, category_id, notes, transaction_date)
        VALUES (${recurring.transaction_type}, ${recurring.amount}, ${recurring.description}, ${recurring.category_id}, ${recurring.notes}, ${recurring.next_date})
      `;

      const nextDate = getNextDate(recurring.next_date, recurring.frequency);
      await sql`UPDATE recurring_transactions SET next_date = ${nextDate} WHERE id = ${recurring.id}`;

      processed.push({ id: recurring.id, description: recurring.description });
    }

    return Response.json({ processed, count: processed.length });
  } catch (error) {
    console.error("Error processing recurring:", error);
    return Response.json(
      { error: "Failed to process recurring transactions" },
      { status: 500 },
    );
  }
}
