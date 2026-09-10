// 管理后台仪表盘
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getFeedbackTypeLabel, getFeedbackStatusLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** 后台首页仪表盘 */
export default async function AdminDashboard() {
  const [projectCount, openFeedback, recentFeedback] = await Promise.all([
    prisma.project.count(),
    prisma.feedback.count({ where: { status: "open" } }),
    prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader><CardTitle>项目总数</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{projectCount}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>待处理反馈</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-orange-600">{openFeedback}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>快捷操作</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Link href="/admin/projects/new" className={cn(buttonVariants({ size: "sm" }))}>
              新建项目
            </Link>
            <Link href="/" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
              查看网站
            </Link>
          </CardContent>
        </Card>
      </div>
      <h2 className="text-lg font-semibold mb-3">最近反馈</h2>
      <div className="space-y-2">
        {recentFeedback.map((f) => (
          <Link
            key={f.id}
            href="/admin/feedback"
            className="border rounded-lg p-3 flex justify-between items-center hover:bg-slate-50 transition-colors"
          >
            <div>
              <p className="font-medium">{f.title}</p>
              <p className="text-sm text-muted-foreground">{getFeedbackTypeLabel(f.type)}</p>
            </div>
            <Badge variant="outline">{getFeedbackStatusLabel(f.status)}</Badge>
          </Link>
        ))}
        {recentFeedback.length === 0 && (
          <p className="text-muted-foreground">暂无反馈</p>
        )}
      </div>
    </div>
  );
}
