"use client";

import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckout } from "@/context/CheckoutContext";

export default function CartPage() {
  const router = useRouter();
  const { setCheckoutItems } = useCheckout();

  const { cart, increaseQty, decreaseQty, removeItem } = useCart();

  const [selected, setSelected] = useState<string[]>([]);

  /* ================= SELECT LOGIC ================= */

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selected.length === cart.length) {
      setSelected([]);
    } else {
      setSelected(cart.map((item) => item.id));
    }
  };

  const deleteSelected = () => {
    selected.forEach((id) => removeItem(id));
    setSelected([]);
  };

  /* ================= TOTAL ================= */

  const total = cart
    .filter((item) => selected.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.qty, 0);

  /* ================= CHECKOUT ================= */

  const handleCheckout = () => {
    const selectedItems = cart.filter((item) => selected.includes(item.id));

    setCheckoutItems(selectedItems);

    router.push("/checkout");
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* TITLE */}
      <h1 className="text-2xl font-semibold mb-6">Keranjang Belanja</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500">Keranjang masih kosong.</p>
      ) : (
        <>
          {/* SELECT HEADER */}
          <div className="flex items-center justify-between mb-5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selected.length === cart.length && cart.length > 0}
                onChange={selectAll}
              />
              Pilih Semua
            </label>

            {selected.length > 0 && (
              <button
                onClick={deleteSelected}
                className="text-red-500 text-sm hover:underline"
              >
                Hapus ({selected.length})
              </button>
            )}
          </div>

          {/* CART ITEMS */}
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="
                  flex gap-4 items-start
                  bg-white
                  border border-gray-100
                  rounded-xl
                  p-4
                  hover:shadow-md
                  transition
                "
              >
                {/* CHECKBOX */}
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="mt-2"
                />

                {/* IMAGE */}
                <img
                  src={item.image_url}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-50"
                />

                {/* INFO */}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800">
                    {item.name}
                  </h3>

                  <p className="text-blue-600 font-semibold mt-1">
                    Rp {item.price.toLocaleString()}
                  </p>

                  {/* QTY */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="border rounded-md p-1 hover:bg-gray-100"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="text-sm">{item.qty}</span>

                    <button
                      onClick={() => increaseQty(item.id)}
                      className="border rounded-md p-1 hover:bg-gray-100"
                    >
                      <Plus size={16} />
                    </button>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-4 text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL BAR */}
          <div
            className="
              sticky bottom-0 mt-10
              bg-white border-t border-gray-100
              pt-5 pb-4
              flex items-center justify-between
            "
          >
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-blue-600">
                Rp {total.toLocaleString()}
              </p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={selected.length === 0}
              className="
                bg-blue-600 hover:bg-blue-700
                transition
                text-white
                px-6 py-3
                rounded-xl
                font-medium
                disabled:bg-gray-300
                disabled:cursor-not-allowed
              "
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </main>
  );
}
