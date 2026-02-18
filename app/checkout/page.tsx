"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/context/AuthGuard";

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  /* ================= TOTAL ================= */

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  /* ================= PAYMENT ================= */

  const payNow = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      const data = await res.json();

      window.location.href = data.invoiceUrl;
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <AuthGuard>
      <main className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
        {/* ================= FORM ================= */}
        <div>
          <h1 className="text-2xl font-semibold mb-6">Data Pengiriman</h1>

          <div className="space-y-4">
            <input
              placeholder="Nama Lengkap"
              className="w-full border border-gray-200 rounded-xl p-3"
            />

            <input
              placeholder="Nomor HP"
              className="w-full border border-gray-200 rounded-xl p-3"
            />

            <textarea
              placeholder="Alamat Lengkap"
              className="w-full border border-gray-200 rounded-xl p-3"
            />

            <select className="w-full border border-gray-200 rounded-xl p-3">
              <option>JNE Regular</option>
              <option>J&T Express</option>
              <option>SiCepat</option>
            </select>
          </div>
        </div>

        {/* ================= ORDER SUMMARY ================= */}
        <div className="bg-gray-50 rounded-2xl p-6 h-fit shadow-sm">
          <h2 className="font-semibold mb-4">Ringkasan Pesanan</h2>

          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x{item.qty}
                </span>

                <span>Rp {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t mt-5 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-blue-600 text-lg">
              Rp {total.toLocaleString()}
            </span>
          </div>

          <button
            onClick={payNow}
            disabled={cart.length === 0 || loading}
            className="
            mt-6 w-full
            bg-blue-600 hover:bg-blue-700
            text-white
            py-3 rounded-xl
            font-medium
            transition
            disabled:bg-gray-300
          "
          >
            {loading ? "Mengalihkan ke pembayaran..." : "Bayar Sekarang"}
          </button>
        </div>
      </main>
    </AuthGuard>
  );
}
