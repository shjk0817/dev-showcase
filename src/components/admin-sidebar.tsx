// 管理后台侧边导航
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/projects", label: "项目管理" },
  { href: "/admin/feedback", label: "反馈管理" },
];

/** 渲染后台侧边栏 */
export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 border-r bg-slate-50 min-h-screen p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-6 text-slate-800">管理后台</h2>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm transition-colors",
              pathname === link.href
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-200"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        退出登录
      </Button>
    </aside>
  );
}
