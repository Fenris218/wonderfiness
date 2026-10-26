"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton({
  compact = false,
  tone = "light",
  className,
}: {
  compact?: boolean;
  tone?: "light" | "dark";
  className?: string;
}) {
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
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition disabled:opacity-50",
        tone === "dark"
          ? "text-white/60 hover:bg-white/10 hover:text-white"
          : "text-ink/60 hover:bg-ink/5 hover:text-ink",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      {compact ? null : <span>{loading ? "Đang thoát..." : "Đăng xuất"}</span>}
    </button>
  );
}
