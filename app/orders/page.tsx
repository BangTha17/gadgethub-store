"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/context/AuthGuard";

type Order = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    name: string;
    price: number;
    qty: number;
  }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    ALL: 0,
    UNPAID: 0,
    PAID: 0,
    SHIPPED: 0,
    DONE: 0,
  });

  const [activeTab, setActiveTab] = useState("ALL");

  const tabs = [
    { label: "Semua", value: "ALL" },
    { label: "Belum Bayar", value: "UNPAID" },
    { label: "Dikemas", value: "PAID" },
    { label: "Dikirim", value: "SHIPPED" },
    { label: "Selesai", value: "DONE" },
  ];

  const fetchOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let query = supabase
      .from("orders")
      .select(
        `
    *,
    order_items (*)
  `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    /* FILTER BERDASARKAN TAB */
    if (activeTab !== "ALL") {
      query = query.eq("status", activeTab);
    }

    const { data } = await query;

    const list = data || [];

    setOrders(list);

    setCounts({
      ALL: list.length,
      UNPAID: list.filter((o) => o.status === "UNPAID").length,
      PAID: list.filter((o) => o.status === "PAID").length,
      SHIPPED: list.filter((o) => o.status === "SHIPPED").length,
      DONE: list.filter((o) => o.status === "DONE").length,
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  return (
    <AuthGuard>
      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-8">Pesanan Saya</h1>
        {/* STATUS TABS */}
        <div className="flex gap-2 overflow-x-auto mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
        px-4 py-2 rounded-full text-sm whitespace-nowrap transition
        ${
          activeTab === tab.value
            ? "bg-blue-600 text-white"
            : "bg-gray-100 hover:bg-gray-200"
        }
      `}
            >
              {tab.label} ({counts[tab.value as keyof typeof counts]})
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500 text-sm">Memuat pesanan...</p>}

        {orders.length === 0 && !loading && (
          <div className="bg-gray-50 rounded-2xl p-8 text-center text-sm text-gray-500">
            Belum ada pesanan.
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
            >
              {/* HEADER */}
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                </div>

                <span
                  className={`
                    text-xs px-3 py-1 rounded-full
                    ${
                      order.status === "PAID"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-600"
                    }
                  `}
                >
                  {order.status}
                </span>
              </div>

              {/* ITEMS */}
              <div className="space-y-2 text-sm">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.name} x{item.qty}
                    </span>
                    <span>Rp {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <OrderTimeline status={order.status} />
              {/* TOTAL */}
              <div className="border-t mt-4 pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-blue-600">
                  Rp {order.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </AuthGuard>
  );
}

function OrderTimeline({ status }: { status: string }) {
  const steps = [
    { key: "UNPAID", label: "Dibayar" },
    { key: "PAID", label: "Dikemas" },
    { key: "SHIPPED", label: "Dikirim" },
    { key: "DONE", label: "Selesai" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const active = i <= currentIndex;

          return (
            <div
              key={step.key}
              className="flex-1 flex flex-col items-center relative"
            >
              {/* LINE */}
              {i !== 0 && (
                <div
                  className={`
                    absolute top-2 -left-1/2 w-full h-[2px]
                    ${active ? "bg-blue-500" : "bg-gray-200"}
                  `}
                />
              )}

              {/* DOT */}
              <div
                className={`
                  w-4 h-4 rounded-full z-10
                  ${active ? "bg-blue-600" : "bg-gray-300"}
                `}
              />

              {/* LABEL */}
              <p
                className={`
                  text-[11px] mt-2 text-center
                  ${active ? "text-blue-600 font-medium" : "text-gray-400"}
                `}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
