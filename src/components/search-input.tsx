"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(window.location.search);
      if (value) next.set("q", value);
      else next.delete("q");
      const qs = next.toString();
      router.push(qs ? `/library?${qs}` : "/library");
    }, 300);
    return () => clearTimeout(timer);
  }, [value, router]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
