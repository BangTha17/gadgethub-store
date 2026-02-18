"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail } from "lucide-react";

/* ===================================================
   LOGIN PAGE
=================================================== */

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });

  /* ================= LOGIN ================= */

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      return setModal({
        open: true,
        title: "Login gagal",
        message: error.message,
      });
    }

    router.push("/");
  };

  /* ================= GOOGLE LOGIN ================= */

  const loginGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/register`,
      },
    });
  };

  /* ================= UI ================= */

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form
          onSubmit={handleLogin}
          className="
            w-full max-w-md
            bg-white
            p-8
            rounded-3xl
            shadow-sm
            border border-gray-100
          "
        >
          {/* HEADER */}
          <h1 className="text-2xl font-semibold text-center mb-2">
            Masuk ke GadgetHub
          </h1>

          <p className="text-sm text-gray-500 text-center mb-8">
            Selamat datang kembali 👋
          </p>

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            onClick={loginGoogle}
            className="
              w-full flex items-center justify-center gap-3
              border border-gray-200
              py-3 rounded-xl
              hover:bg-gray-50
              transition mb-6
              font-medium text-sm
            "
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
            />
            Lanjutkan dengan Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-400">atau</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            required
            className="
              w-full border border-gray-200
              rounded-xl px-4 py-3
              focus:ring-2 focus:ring-blue-500
              outline-none mb-4
            "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <div className="relative mb-6">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              required
              className="
                w-full border border-gray-200
                rounded-xl px-4 py-3
                focus:ring-2 focus:ring-blue-500
                outline-none
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            disabled={loading}
            className="
              w-full py-3 rounded-xl
              bg-blue-600 text-white font-medium
              hover:bg-blue-700
              active:scale-[0.98]
              transition
              shadow-sm
            "
          >
            {loading ? "Memproses..." : "Login"}
          </button>

          {/* REGISTER */}
          <p className="text-sm text-center mt-6 text-gray-500">
            Belum punya akun?{" "}
            <Link
              href={`/register?email=${email}`}
              className="text-blue-600 font-medium"
            >
              Daftar sekarang
            </Link>
          </p>
        </form>
      </div>

      {/* ================= MODAL ================= */}
      {modal.open && (
        <NotificationModal
          title={modal.title}
          message={modal.message}
          onClose={() => setModal({ ...modal, open: false })}
        />
      )}
    </>
  );
}

/* ===================================================
   REUSABLE MODAL
=================================================== */

function NotificationModal({ title, message, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 w-[90%] max-w-sm shadow-xl animate-modalUp">
        <h2 className="font-semibold text-lg">{title}</h2>

        <p className="text-sm text-gray-500 mt-2">{message}</p>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="
              px-5 py-2.5
              bg-blue-600 text-white
              rounded-xl
              hover:bg-blue-700
              transition
            "
          >
            Oke
          </button>
        </div>
      </div>
    </div>
  );
}
