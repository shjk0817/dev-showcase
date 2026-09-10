// 404 页面
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 页面未找到 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">页面不存在</h1>
      <p className="text-muted-foreground">你访问的链接可能已失效或输入有误。</p>
      <Link href="/" className={cn(buttonVariants())}>返回首页</Link>
    </main>
  );
}
