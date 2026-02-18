"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

import AuthGuard from "@/context/AuthGuard";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

/* ===================================================
   PAGE
=================================================== */

export default function ProfilePage() {
  const supabase = getSupabase();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>({
    name: "",
    username: "",
    age: "",
    location: "",
    phone: "",
    email: "",
    avatar_url: "",
  });

  const [initialForm, setInitialForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  /* ================= FETCH PROFILE ================= */

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setForm(data);
      setInitialForm(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= UPDATE ================= */

  const update = (key: string, value: string) => {
    setForm((f: any) => ({ ...f, [key]: value }));
  };

  /* ================= DIRTY CHECK ================= */

  const isChanged =
    JSON.stringify(form) !== JSON.stringify(initialForm);

  /* ================= SAVE ================= */

  const saveProfile = async () => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("profiles").upsert({
      ...form,
      id: user?.id,
      updated_at: new Date(),
    });

    setSaving(false);
    setInitialForm(form);

    setModal({
      open: true,
      title: "Perubahan disimpan",
      message: "Profil berhasil diperbarui.",
    });
  };

  if (loading)
    return <p className="p-10 text-center">Loading...</p>;

  return (
    <AuthGuard>
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-10">

        {/* TITLE */}
        <h1 className="text-xl md:text-2xl font-semibold mb-6 md:mb-8">
          Setting Profil
        </h1>

        <div
          className="
          bg-white rounded-3xl border border-gray-100
          shadow-sm
          p-5 md:p-8
          space-y-8
        "
        >
          {/* ================= HEADER ================= */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <User size={22} />
            </div>

            <div>
              <p className="font-semibold text-base">
                {form.name || "User"}
              </p>
              <p className="text-sm text-gray-500">
                {form.email}
              </p>
            </div>
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
              value={form.email}
              disabled
            />
          </div>

          {/* ================= ACTION ================= */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">

            {/* BACK */}
            <button
              type="button"
              onClick={() => router.back()}
              className="
                flex-1 py-3 rounded-xl
                border border-gray-200
                hover:bg-gray-50
                transition
              "
            >
              Kembali
            </button>

            {/* SAVE */}
            <button
              onClick={saveProfile}
              disabled={!isChanged || saving}
              className={`
                flex-1 py-3 rounded-xl font-medium transition
                ${
                  !isChanged
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                }
              `}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

        {/* ================= MODAL ================= */}
        {modal.open && (
          <NotificationModal
            title={modal.title}
            message={modal.message}
            onClose={() =>
              setModal({ ...modal, open: false })
            }
          />
        )}
      </main>
    </AuthGuard>
  );
}

/* ===================================================
   INPUT
=================================================== */

function Input({
  label,
  value,
  onChange,
  disabled = false,
  type = "text",
}: any) {
  return (
    <input
      type={type}
      placeholder={label}
      disabled={disabled}
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      className="
        w-full
        border border-gray-200
        rounded-xl
        px-4 py-3
        text-sm
        outline-none
        focus:ring-2 focus:ring-blue-500
        transition
        disabled:bg-gray-50
      "
    />
  );
}

/* ===================================================
   MODAL (PROFESSIONAL)
=================================================== */

function NotificationModal({ title, message, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-[90%] max-w-sm shadow-xl border border-gray-100 animate-modalUp">

        <div className="px-6 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {message}
          </p>
        </div>

        <div className="flex justify-end px-6 py-5 border-t mt-4">
          <button
            onClick={onClose}
            className="
              px-5 py-2.5
              bg-blue-600 text-white
              rounded-lg
              hover:bg-blue-700
              transition
            "
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
