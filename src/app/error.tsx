"use client";
// 全局错误边界页
import { Button } from "@/components/ui/button";

/** 渲染全局错误提示 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">页面出错了</h1>
      <p className="text-muted-foreground text-center max-w-md">
        加载时发生错误，请稍后重试。如持续出现请联系管理员。
      </p>
      <Button onClick={reset}>重试</Button>
    </main>
  );
}
