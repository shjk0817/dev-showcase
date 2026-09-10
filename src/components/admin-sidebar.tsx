"use client";
// 管理后台侧边导航（支持移动端折叠）
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/admin", label: "仪表盘", exact: true },
  { href: "/admin/projects", label: "项目管理", exact: false },
  { href: "/admin/feedback", label: "反馈管理", exact: false },
  { href: "/admin/audit", label: "操作审计", exact: false },
];

/** 判断导航项是否激活 */
function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 渲染后台侧边栏 */
export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b bg-slate-50 px-4 py-3">
        <span className="font-bold text-slate-800">JKTAC 管理后台</span>
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)} aria-label="菜单">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>
      <aside
        className={cn(
          "w-56 border-r bg-slate-50 min-h-screen p-4 flex flex-col shrink-0",
          "md:static md:translate-x-0",
          "fixed inset-y-0 left-0 z-30 pt-14 transition-transform md:pt-4",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <h2 className="hidden md:block text-lg font-bold mb-6 text-slate-800">JKTAC 管理后台</h2>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-2 rounded-md text-sm transition-colors",
                isActive(pathname, link.href, link.exact)
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
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="关闭菜单"
        />
      )}
    </>
  );
}
