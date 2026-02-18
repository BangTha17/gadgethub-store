"use client";
export const dynamic = "force-dynamic";

import {
  User,
  Home,
  Package,
  Heart,
  RotateCcw,
  Info,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MenuPage() {
  const [user, setUser] = useState<any>(null);

  /*
  =========================
  AUTH LISTENER (AUTO UPDATE)
  =========================
  */
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const menus = [
    {
      title: "Navigasi",
      items: [
        { name: "Beranda", icon: Home, href: "/" },
        { name: "Semua Produk", icon: Package, href: "/products" },
      ],
    },
    {
      title: "Aktivitas",
      items: [
        { name: "Pesanan Saya", icon: Package, href: "/orders" },
        { name: "Wishlist", icon: Heart, href: "/wishlist" },
        { name: "Beli Lagi", icon: RotateCcw, href: "#" },
      ],
    },
    {
      title: "Lainnya",
      items: [
        { name: "Tentang Toko", icon: Info, href: "#" },
        { name: "Bantuan", icon: MessageCircle, href: "#" },
      ],
    },
  ];

  return (
    <main className="max-w-3xl mx-auto px-5 py-10">

      {/* ================= PROFILE CARD ================= */}
      <div className="bg-white rounded-2xl shadow-sm border p-5 flex items-center justify-between mb-10">

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <User size={22} />
          </div>

          {/* User Info */}
          <div>
            <p className="font-semibold text-gray-800">
              {user ? user.email : "Halo, Guest"}
            </p>

            {!user ? (
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Masuk / Daftar
              </Link>
            ) : (
              <p className="text-sm text-gray-500">
                Kelola akun & pesanan Anda
              </p>
            )}
          </div>
        </div>

        <ChevronRight className="text-gray-400" />
      </div>

      {/* ================= MENU SECTIONS ================= */}
      <div className="space-y-10">
        {menus.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h2>

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="
                      flex items-center justify-between
                      px-5 py-4
                      hover:bg-gray-50
                      transition-all duration-150
                      group
                    "
                  >
                    <div className="flex items-center gap-4">
                      <Icon
                        size={20}
                        className="text-gray-600 group-hover:text-blue-600 transition"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {item.name}
                      </span>
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-gray-500 transition"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
