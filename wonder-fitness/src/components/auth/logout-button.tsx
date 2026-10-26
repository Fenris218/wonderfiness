"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink/60 transition hover:bg-ink/5 hover:text-ink disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      {compact ? null : <span>{loading ? "Đang thoát..." : "Đăng xuất"}</span>}
    </button>
  );
}
