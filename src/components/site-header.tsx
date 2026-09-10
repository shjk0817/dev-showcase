// 站点顶部导航栏
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 渲染公开页面导航 */
export function SiteHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          开发成果展示
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
            首页
          </Link>
          <Link href="/feedback" className={cn(buttonVariants({ variant: "ghost" }))}>
            提交反馈
          </Link>
        </nav>
      </div>
    </header>
  );
}
