import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let fromCurrency, toCurrency;
  try {
    const body = await req.json();
    fromCurrency = body.fromCurrency;
    toCurrency = body.toCurrency;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!fromCurrency || !toCurrency) {
    return Response.json(
      { error: "Missing fromCurrency or toCurrency" },
      { status: 400 },
    );
  }

  if (fromCurrency === toCurrency) {
    return Response.json({
      success: true,
      factor: 1,
      fromCurrency,
      toCurrency,
    });
  }

  let rates;
  try {
    // Free API — no key required, up-to-date daily rates
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    if (!res.ok) throw new Error(`Exchange rate API returned ${res.status}`);
    const data = await res.json();
    rates = data.rates;
  } catch (err) {
    console.error("Failed to fetch exchange rates:", err);
    return Response.json(
      { error: "Could not fetch exchange rates. Try again later." },
      { status: 502 },
    );
  }

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) {
    return Response.json(
      {
        error: `Unsupported currency: ${!fromRate ? fromCurrency : toCurrency}`,
      },
      { status: 400 },
    );
  }

  // Convert: amount_in_from → USD → amount_in_to
  // factor = toRate / fromRate  (all rates are "X per 1 USD")
  const factor = toRate / fromRate;
  const userId = parseInt(session.user.id, 10);

  try {
    await sql.transaction([
      sql`
        UPDATE transactions
        SET amount = ROUND((amount * ${factor})::numeric, 2)
        WHERE user_id = ${userId}
      `,
      sql`
        UPDATE budgets
        SET amount = ROUND((amount * ${factor})::numeric, 2)
        WHERE user_id = ${userId}
      `,
      sql`
        UPDATE recurring_transactions
        SET amount = ROUND((amount * ${factor})::numeric, 2)
        WHERE user_id = ${userId}
      `,
    ]);
  } catch (err) {
    console.error("DB update failed during currency conversion:", err);
    return Response.json(
      {
        error:
          "Database update failed. Your currency preference was not changed.",
      },
      { status: 500 },
    );
  }

  return Response.json({ success: true, factor, fromCurrency, toCurrency });
}
