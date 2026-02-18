"use client";

import { createContext, useContext, useState } from "react";

type Item = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image_url: string;
};

type CheckoutType = {
  items: Item[];
  setCheckoutItems: (items: Item[]) => void;
};

const CheckoutContext = createContext<CheckoutType | null>(null);

export function CheckoutProvider({ children }: any) {
  const [items, setItems] = useState<Item[]>([]);

  return (
    <CheckoutContext.Provider
      value={{
        items,
        setCheckoutItems: setItems,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export const useCheckout = () => {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("Checkout error");
  return ctx;
};
