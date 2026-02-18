"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

/* ===================================================
   PAGE
=================================================== */

export default function ProductsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const search = params.get("search");

  const categoryParams = params.get("category");
  const brandParams = params.get("brand");

  const categories = categoryParams?.split(",") ?? [];
  const brands = brandParams?.split(",") ?? [];

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilter, setMobileFilter] = useState(false);

  /* ================= FETCH ================= */

  const fetchProducts = async () => {
    setLoading(true);

    let query = supabase.from("products").select("*");

    if (search) query = query.ilike("name", `%${search}%`);
    if (categories.length) query = query.in("category", categories);
    if (brands.length) query = query.in("brand", brands);

    const { data, error } = await query;

    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryParams, brandParams]);

  /* ================= UI ================= */

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 grid md:grid-cols-4 gap-8">

      {/* DESKTOP FILTER */}
      <aside className="hidden md:block space-y-8">
        <FilterContent />
      </aside>

      {/* PRODUCTS */}
      <section className="md:col-span-3">

        {/* MOBILE HEADER */}
        <div className="md:hidden mb-4 flex justify-between items-center">
          <h1 className="font-semibold text-lg">
            {search ? `Hasil "${search}"` : "Semua Produk"}
          </h1>

          <button
            onClick={() => setMobileFilter(true)}
            className="border border-gray-200 px-4 py-2 rounded-lg text-sm active:scale-95 transition"
          >
            Filter
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              addToCart={addToCart}
            />
          ))}
        </div>
      </section>

      {/* MOBILE FILTER */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h2 className="font-semibold text-lg">Filter</h2>
              <button onClick={() => setMobileFilter(false)}>
                Tutup
              </button>
            </div>

            <FilterContent />

            <button
              onClick={() => setMobileFilter(false)}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ===================================================
   PRODUCT CARD (FIXED ADD TO CART)
=================================================== */

function ProductCard({ product, addToCart }: any) {

  const handleAdd = async () => {
    await addToCart({
      id: String(product.id),
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
    });
  };

  return (
    <div
      className="
        bg-white
        rounded-xl
        border border-gray-100
        hover:shadow-md
        transition
        p-2 md:p-3
      "
    >
      <img
        src={product.image_url}
        className="w-full h-28 md:h-44 object-cover rounded-lg"
      />

      <h3 className="text-xs md:text-sm mt-2 line-clamp-2 min-h-[34px]">
        {product.name}
      </h3>

      <p className="text-blue-600 font-semibold text-sm mt-1">
        Rp {Number(product.price).toLocaleString()}
      </p>

      <p className="text-[11px] text-gray-400">
        {product.stock > 0 ? "Ready" : "Pre Order"}
      </p>

      <button
        onClick={handleAdd}
        className="
          mt-2 w-full
          bg-blue-600 hover:bg-blue-700
          active:scale-95
          text-white
          text-xs md:text-sm
          py-2
          rounded-lg
          transition-all
        "
      >
        + Keranjang
      </button>
    </div>
  );
}

/* ===================================================
   FILTER CONTENT
=================================================== */

function FilterContent() {
  return (
    <div className="space-y-8 text-sm">
      <FilterSection title="Kategori">
        <FilterCheckbox label="Handphone" type="category" value="handphone" />
        <FilterCheckbox label="Laptop" type="category" value="laptop" />
        <FilterCheckbox label="Aksesoris" type="category" value="aksesoris" />
      </FilterSection>

      <FilterSection title="Brand">
        <FilterCheckbox label="Apple" type="brand" value="apple" />
        <FilterCheckbox label="Samsung" type="brand" value="samsung" />
        <FilterCheckbox label="Xiaomi" type="brand" value="xiaomi" />
        <FilterCheckbox label="Asus" type="brand" value="asus" />
      </FilterSection>
    </div>
  );
}

/* ===================================================
   FILTER COMPONENTS
=================================================== */

function FilterSection({ title, children }: any) {
  return (
    <div>
      <h3 className="font-medium mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, type, value }: any) {
  const params = useSearchParams();
  const router = useRouter();

  const selected = params.get(type)?.split(",") ?? [];
  const checked = selected.includes(value);

  const toggle = () => {
    const updated = checked
      ? selected.filter((v) => v !== value)
      : [...selected, value];

    const newParams = new URLSearchParams(params.toString());

    updated.length
      ? newParams.set(type, updated.join(","))
      : newParams.delete(type);

    router.push(`/products?${newParams.toString()}`);
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={toggle}
        className="accent-blue-600"
      />
      {label}
    </label>
  );
}
