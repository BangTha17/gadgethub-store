"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

/* ================= TYPES ================= */

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

export type CartItem = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  qty: number;
  image_url: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  increaseQty: (id: string) => Promise<void>;
  decreaseQty: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
};

/* ================= CONTEXT ================= */

const CartContext = createContext<CartContextType | null>(null);

/* ================= PROVIDER ================= */

export function CartProvider({ children }: any) {
  const supabase = getSupabase();
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ================= FETCH CART ================= */

  const fetchCart = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCart([]);
      return;
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id);

    if (!error) setCart(data || []);
  };

  /* ================= INIT + AUTH LISTENER ================= */

  useEffect(() => {
    fetchCart();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ================= ADD ================= */

  const addToCart = async (product: Product) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Login dulu untuk menambah cart");
      return;
    }

    // cek sudah ada?
    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("cart_items")
        .update({ qty: existing.qty + 1 })
        .eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        qty: 1,
      });
    }

    fetchCart();
  };

  /* ================= INCREASE ================= */

  const increaseQty = async (id: string) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    await supabase
      .from("cart_items")
      .update({ qty: item.qty + 1 })
      .eq("id", id);

    fetchCart();
  };

  /* ================= DECREASE ================= */

  const decreaseQty = async (id: string) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (item.qty <= 1) {
      await removeItem(id);
      return;
    }

    await supabase
      .from("cart_items")
      .update({ qty: item.qty - 1 })
      .eq("id", id);

    fetchCart();
  };

  /* ================= REMOVE ================= */

  const removeItem = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    fetchCart();
  };

  /* ================= CLEAR ================= */

  const clearCart = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setCart([]);
  };

  /* ================= COUNT ================= */

  const cartCount = cart.reduce((t, i) => t + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("CartContext error");
  return context;
};
