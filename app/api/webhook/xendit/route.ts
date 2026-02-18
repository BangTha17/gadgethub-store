import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ================= SUPABASE ADMIN ================= */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/* ===================================================
   XENDIT WEBHOOK (SECURED VERSION)
=================================================== */

export async function POST(req: Request) {
  try {
    /* ================= VERIFY CALLBACK TOKEN ================= */

    const callbackToken = req.headers.get("x-callback-token");

    if (callbackToken !== process.env.XENDIT_CALLBACK_TOKEN) {
      console.log("❌ Invalid Xendit callback token");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ================= READ BODY ================= */

    const body = await req.json();

    const status = body.status;
    const externalId = body.external_id;
    const paidAmount = body.paid_amount;

    if (!externalId) {
      return NextResponse.json(
        { error: "Missing external_id" },
        { status: 400 }
      );
    }

    /* ================= GET ORDER ================= */

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("external_id", externalId)
      .single();

    if (orderError || !order) {
      console.log("❌ Order not found:", externalId);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    /* ================= VERIFY PAYMENT ================= */

    if (status === "PAID") {

      /* 🔒 VERIFY AMOUNT */
      if (Number(order.amount) !== Number(paidAmount)) {
        console.log("❌ Amount mismatch");
        return NextResponse.json(
          { error: "Invalid payment amount" },
          { status: 400 }
        );
      }

      /* ===== UPDATE ORDER ===== */

      await supabase
        .from("orders")
        .update({
          status: "PAID",
          paid_at: new Date(),
        })
        .eq("id", order.id);

      /* ===== CLEAR USER CART ===== */

      await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", order.user_id);

      console.log("Payment success:", externalId);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("Webhook error:", err);

    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 }
    );
  }
}
