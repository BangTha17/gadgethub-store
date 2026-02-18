"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User } from "lucide-react";

/* ===================================================
   REGISTER PAGE
=================================================== */

export default function RegisterPage() {
  const supabase = getSupabase();
  const router = useRouter();
  const params = useSearchParams();

  /* ================= STATE ================= */

  const [form, setForm] = useState({
    name: "",
    username: "",
    age: "",
    location: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleMode, setGoogleMode] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  /* ================= AUTO EMAIL FROM LOGIN ================= */

  useEffect(() => {
    const init = async () => {
      // dari redirect login biasa
      const emailFromLogin = params.get("email");

      if (emailFromLogin) {
        setForm((f) => ({ ...f, email: emailFromLogin }));
      }

      // cek google login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !emailFromLogin) {
        setGoogleMode(true);

        setForm((f) => ({
          ...f,
          email: user.email || "",
        }));
      }
    };

    init();
  }, []);

  /* ================= HANDLE CHANGE ================= */

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  /* ================= REGISTER ================= */

  const handleRegister = async (e: any) => {
    e.preventDefault();

    setLoading(true);

    /* ================= NORMAL REGISTER ================= */
    if (!googleMode) {
      if (form.password !== form.confirm) {
        setLoading(false);
        return setModal({
          open: true,
          title: "Password tidak cocok",
          message: "Pastikan password dan konfirmasi sama.",
        });
      }

      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        setLoading(false);
        return setModal({
          open: true,
          title: "Registrasi gagal",
          message: error.message,
        });
      }
    }

    /* ================= SAVE PROFILE ================= */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("profiles").upsert({
      id: user?.id,
      name: form.name,
      username: form.username,
      age: form.age,
      location: form.location,
      phone: form.phone,
      email: form.email,
    });

    setLoading(false);

    setModal({
      open: true,
      title: googleMode
        ? "Profil berhasil dilengkapi 🎉"
        : "Registrasi berhasil 🎉",
      message: googleMode
        ? "Akun siap digunakan."
        : "Cek email kamu untuk verifikasi akun.",
    });
  };

  /* ================= UI ================= */

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
        <form
          onSubmit={handleRegister}
          className="
            w-full max-w-lg
            bg-white
            p-8 rounded-3xl
            shadow-sm border border-gray-100
          "
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
              <User size={22} />
            </div>

            <h1 className="text-2xl font-semibold">Buat Akun GadgetHub</h1>

            <p className="text-sm text-gray-500 mt-1">
              Lengkapi data untuk mulai berbelanja
            </p>
          </div>

          {/* ================= FORM ================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              value={form.name}
              onChange={(v: any) => update("name", v)}
            />

            <Input
              label="Username"
              value={form.username}
              onChange={(v: any) => update("username", v)}
            />

            <Input
              label="Umur"
              type="number"
              value={form.age}
              onChange={(v: any) => update("age", v)}
            />

            <Input
              label="Lokasi"
              value={form.location}
              onChange={(v: any) => update("location", v)}
            />

            <Input
              label="No Telepon"
              value={form.phone}
              onChange={(v: any) => update("phone", v)}
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v: any) => update("email", v)}
            />
          </div>

          {/* PASSWORD */}
          {/* PASSWORD */}
          {!googleMode && (
            <div className="mt-4 space-y-4">
              <PasswordInput
                placeholder="Password"
                show={showPass}
                toggle={() => setShowPass(!showPass)}
                value={form.password}
                onChange={(v: any) => update("password", v)}
              />

              <PasswordInput
                placeholder="Ulangi Password"
                show={showConfirm}
                toggle={() => setShowConfirm(!showConfirm)}
                value={form.confirm}
                onChange={(v: any) => update("confirm", v)}
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            disabled={loading}
            className="
              mt-6 w-full py-3 rounded-xl
              bg-blue-600 text-white font-medium
              hover:bg-blue-700
              active:scale-[0.98]
              transition
            "
          >
            {loading ? "Membuat akun..." : "Daftar"}
          </button>

          <p className="text-sm text-center mt-6 text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-blue-600 font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>

      {/* ================= MODAL ================= */}
      {modal.open && (
        <NotificationModal
          title={modal.title}
          message={modal.message}
          onClose={() => {
            setModal({ ...modal, open: false });
            router.push("/login");
          }}
        />
      )}
    </>
  );
}

/* ===================================================
   INPUT COMPONENT
=================================================== */

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <input
      type={type}
      placeholder={label}
      required
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full border border-gray-200
        rounded-xl px-4 py-3
        focus:ring-2 focus:ring-blue-500
        outline-none
      "
    />
  );
}

/* ===================================================
   PASSWORD INPUT
=================================================== */

function PasswordInput({ placeholder, show, toggle, value, onChange }: any) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full border border-gray-200
          rounded-xl px-4 py-3
          focus:ring-2 focus:ring-blue-500
          outline-none
        "
      />

      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-3 text-gray-400"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

/* ===================================================
   MODAL
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
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Oke
          </button>
        </div>
      </div>
    </div>
  );
}
