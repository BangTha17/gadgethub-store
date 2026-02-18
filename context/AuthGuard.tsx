"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: any) {
  const supabase = getSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      /* ===== CHECK PROFILE ===== */
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile?.name) {
        router.push(`/register?email=${user.email}`);
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) return null;

  return children;
}
