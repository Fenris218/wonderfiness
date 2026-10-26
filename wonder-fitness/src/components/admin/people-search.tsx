"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function PeopleSearch({ defaultValue, placeholder }: { defaultValue?: string; placeholder?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/admin/hoi-vien${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2">
      <Search className="h-4 w-4 text-ink/30" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-56 bg-transparent text-[13px] outline-none placeholder:text-ink/35"
      />
      <button type="submit" className="text-[11.5px] font-semibold text-brand">
        Tìm
      </button>
    </form>
  );
}
