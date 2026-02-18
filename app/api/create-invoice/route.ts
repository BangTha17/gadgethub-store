import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Xendit } from "xendit-node";

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    /* ================= GET CART ================= */

    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart kosong" },
        { status: 400 }
      );
    }

    /* ================= HITUNG TOTAL DI SERVER ================= */

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    /* ================= CEK ORDER PENDING ================= */

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "PENDING")
      .maybeSingle();

    // ✅ kalau sudah ada invoice aktif
    if (existingOrder?.invoice_url) {
      return NextResponse.json({
        invoiceUrl: existingOrder.invoice_url,
      });
    }

    /* ================= CREATE ORDER ================= */

    const externalId = `order-${Date.now()}`;

    const { data: order } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        external_id: externalId,
        amount: total,
        status: "PENDING",
      })
      .select()
      .single();

    /* ================= SAVE ORDER ITEMS ================= */

    const items = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      qty: item.qty,
    }));

    await supabase.from("order_items").insert(items);

    /* ================= CREATE INVOICE ================= */

    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId,
        amount: total,
      },
    });

    /* ================= SAVE INVOICE URL ================= */

    await supabase
      .from("orders")
      .update({
        invoice_url: invoice.invoiceUrl,
      })
      .eq("id", order.id);

    return NextResponse.json({
      invoiceUrl: invoice.invoiceUrl,
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Invoice error" },
      { status: 500 }
    );
  }
}
