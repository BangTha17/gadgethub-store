"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div
      className="
        bg-white rounded-2xl
        overflow-hidden
        shadow-sm
        hover:shadow-md
        transition-shadow duration-200
      "
    >
      {/* IMAGE */}
      <div className="bg-gray-50">
        <img
          src={product.image_url}
          className="w-full h-44 md:h-52 object-cover"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3
          className="
          text-sm text-gray-800
          line-clamp-2 min-h-[40px]
        "
        >
          {product.name}
        </h3>

        <p className="text-blue-600 font-semibold mt-2">
          Rp {product.price.toLocaleString()}
        </p>

        <button
          onClick={() => addToCart(product)}
          className="
    mt-4 w-full
    flex items-center justify-center gap-2
    bg-blue-50 text-blue-600
    py-2 rounded-xl text-sm
    hover:bg-blue-600 hover:text-white
    transition-colors duration-200
  "
        >
          <ShoppingCart size={16} />
          Tambah
        </button>
      </div>
    </div>
  );
}
