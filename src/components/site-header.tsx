// 站点顶部导航栏
import Link from "next/link";

/** 渲染公开页面导航 */
export function SiteHeader() {
  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          JKTAC
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            首页
          </Link>
        </nav>
      </div>
    </header>
  );
}
