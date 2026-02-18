"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  ArrowRight,
} from "lucide-react";

/* =====================================================
   CATEGORY DATA
===================================================== */

const categories = [
  { name: "Handphone", icon: Smartphone, query: "handphone" },
  { name: "Laptop", icon: Laptop, query: "laptop" },
  { name: "Smartwatch", icon: Watch, query: "smartwatch" },
  { name: "Aksesoris", icon: Headphones, query: "aksesoris" },
];

/* =====================================================
   BANNERS
===================================================== */

const banners = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505",
  "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434",
];

export default function Home() {
  const supabase = getSupabase();
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bestSeller, setBestSeller] = useState<any[]>([]);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  /* ================= AUTO SLIDE ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      nextBanner();
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerIndex]);

  const nextBanner = () =>
    setBannerIndex((prev) => (prev + 1) % banners.length);

  const prevBanner = () =>
    setBannerIndex(
      (prev) => (prev - 1 + banners.length) % banners.length
    );

  /* ================= SWIPE ================= */

  const handleTouchStart = (e: any) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: any) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) nextBanner();
    if (distance < -50) prevBanner();
  };

  /* ================= FETCH BEST SELLER ================= */

  useEffect(() => {
    const fetchBestSeller = async () => {
      const { data } = await supabase.rpc(
        "best_seller_products"
      );

      setBestSeller(data || []);
    };

    fetchBestSeller();
  }, []);

  return (
    <main className="bg-white pb-20">

      {/* =====================================================
         BANNER SLIDER
      ===================================================== */}
      <section className="max-w-6xl mx-auto px-4 pt-6">
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="
            relative
            w-full
            aspect-[16/7]
            md:aspect-[16/6]
            lg:aspect-[16/5]
            rounded-3xl
            overflow-hidden
          "
        >
          {banners.map((img, i) => (
            <img
              key={i}
              src={img}
              className={`
                absolute inset-0 w-full h-full
                object-cover object-center
                transition-opacity duration-700
                ${bannerIndex === i ? "opacity-100" : "opacity-0"}
              `}
            />
          ))}

          {/* DOT INDICATOR */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <div
                key={i}
                className={`
                  w-2.5 h-2.5 rounded-full transition
                  ${
                    bannerIndex === i
                      ? "bg-white scale-110"
                      : "bg-white/50"
                  }
                `}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
         CATEGORY
      ===================================================== */}
      <section className="max-w-6xl mx-auto px-4 mt-10">

        <h2 className="font-semibold text-lg mb-5">
          Kategori
        </h2>

        <div className="grid grid-cols-4 gap-3 md:gap-6 text-center">
          {categories.map((cat) => {
            const Icon = cat.icon;

            return (
              <Link
                key={cat.name}
                href={`/products?category=${cat.query}`}
                className="group"
              >
                <div className="
                  bg-gray-50 rounded-2xl
                  py-4 md:py-6
                  hover:bg-blue-50
                  active:scale-95
                  transition
                ">
                  <Icon className="mx-auto text-blue-500 mb-2" />
                  <p className="text-xs md:text-sm font-medium">
                    {cat.name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =====================================================
         BEST SELLER
      ===================================================== */}
      <section className="max-w-6xl mx-auto px-4 mt-14">

        <div className="flex justify-between mb-6">
          <h2 className="font-semibold text-lg">
            Best Seller 🔥
          </h2>

          <Link
            href="/products"
            className="flex items-center gap-1 text-blue-500 text-sm"
          >
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bestSeller.map((p) => (
            <Link
              key={p.product_id}
              href="/products"
              className="
                group
                bg-white
                border border-gray-100
                rounded-2xl
                p-3
                hover:shadow-md
                transition
              "
            >
              <img
                src={p.image_url}
                className="
                  w-full aspect-square
                  object-cover rounded-xl
                  group-hover:scale-[1.03]
                  transition
                "
              />

              <p className="text-sm mt-2 line-clamp-2 min-h-[40px]">
                {p.name}
              </p>

              <p className="text-blue-600 font-semibold text-sm mt-1">
                Rp {Number(p.price).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
         MORE PRODUCTS CTA
      ===================================================== */}
      <section className="bg-gray-50 mt-14 md:mt-20 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">

          <h2 className="text-xl font-semibold">
            Temukan Gadget Lainnya
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Jelajahi koleksi lengkap GadgetHub Store
          </p>

          <Link
            href="/products"
            className="
              inline-block mt-6
              bg-blue-600 text-white
              px-7 py-3 rounded-xl
              hover:bg-blue-700
              active:scale-95
              transition
            "
          >
            Lihat Produk Lebih Banyak
          </Link>

        </div>
      </section>

    </main>
  );
}
