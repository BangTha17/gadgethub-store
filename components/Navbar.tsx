"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, User, Menu, Search } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const supabase = getSupabase();
  const pathname = usePathname();
  const { cart } = useCart();

  const [user, setUser] = useState<any>(null);
  const [openProfile, setOpenProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  /*
  =========================
  AUTH SESSION
  =========================
  */
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /*
  =========================
  CLOSE DROPDOWN CLICK OUTSIDE
  =========================
  */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /*
  =========================
  HIDE NAVBAR ROUTES
  =========================
  */
  const hideNavbarRoutes = ["/login", "/register"];
  if (hideNavbarRoutes.includes(pathname)) return null;

  /*
  =========================
  LOGOUT
  =========================
  */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutModal(false);
    setOpenProfile(false);
  };

  const cartCount = cart?.length || 0;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={22} />
            </Link>

            <Link href="/" className="font-semibold text-lg">
              GadgetHub
            </Link>
          </div>

          {/* ================= SEARCH ================= */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div
              className="
                relative w-full
                bg-gray-100
                rounded-xl
                focus-within:bg-white
                focus-within:ring-2
                focus-within:ring-blue-500/20
                transition
              "
            >
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    router.push(`/products?search=${keyword}`);
                  }
                }}
                placeholder="Cari gadget..."
                className="
                  w-full
                  pl-10 pr-4
                  py-2.5
                  bg-transparent
                  outline-none
                  text-sm
                  rounded-xl
                "
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            {/* CART */}
            <Link
              href="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ShoppingCart size={22} />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* PROFILE */}
            <button
              onClick={() => setOpenProfile(!openProfile)}
              className="hidden md:flex p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <User size={22} />
            </button>

            {/* ================= DROPDOWN ================= */}
            <div
              className={`
                absolute right-0 top-12 w-64
                bg-white rounded-2xl
                shadow-xl border border-gray-100
                overflow-hidden
                transition-all duration-200 origin-top-right
                ${
                  openProfile
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }
              `}
            >
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">
                  {user ? user.email : "Guest"}
                </p>
                <p className="text-xs text-gray-500">
                  {user ? "Login berhasil" : "Silakan login"}
                </p>
              </div>

              <div className="py-2 text-sm">
                <Link
                  href="/profile"
                  className="block px-4 py-2 hover:bg-gray-50 transition"
                >
                  Setting Profil
                </Link>

                <Link href="/" className="block px-4 py-2 hover:bg-gray-50">
                  Beranda
                </Link>

                <Link
                  href="/products"
                  className="block px-4 py-2 hover:bg-gray-50"
                >
                  Semua Produk
                </Link>

                <Link href="/menu" className="block px-4 py-2 hover:bg-gray-50">
                  Menu Lainnya
                </Link>

                <div className="border-t my-2" />

                {!user ? (
                  <Link
                    href="/login"
                    className="block px-4 py-2 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutModal && (
        <div
          className="
      fixed inset-0 z-[999]
      flex items-center justify-center
      bg-black/40 backdrop-blur-md
      animate-fadeIn
    "
        >
          {/* CARD */}
          <div
            className="
        w-[92%] max-w-md
        bg-white
        rounded-3xl
        shadow-2xl
        p-7
        animate-modalUp
      "
          >
            {/* ICON */}
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <User className="text-red-500" size={22} />
            </div>

            {/* TEXT */}
            <h2 className="text-lg font-semibold text-gray-900">
              Keluar dari akun?
            </h2>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Kamu akan keluar dari akun ini dan perlu login kembali untuk
              melanjutkan aktivitas.
            </p>

            {/* ACTION */}
            <div className="flex justify-end gap-3 mt-7">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="
            px-5 py-2.5
            rounded-xl
            text-sm font-medium
            bg-gray-100
            hover:bg-gray-200
            transition
          "
              >
                Batal
              </button>

              <button
                onClick={handleLogout}
                className="
            px-5 py-2.5
            rounded-xl
            text-sm font-medium
            text-white
            bg-red-500
            hover:bg-red-600
            shadow-sm
            active:scale-95
            transition
          "
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
