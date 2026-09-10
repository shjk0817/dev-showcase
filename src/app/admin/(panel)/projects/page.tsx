// 管理端项目列表页
import Link from "next/link";
import { prisma } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

/** 项目列表管理页 */
export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">项目管理</h1>
        <Link href="/admin/projects/new" className={cn(buttonVariants())}>
          新建项目
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.title}</TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell>
                <Badge variant={p.status === "published" ? "default" : "secondary"}>
                  {p.status === "published" ? "已发布" : "草稿"}
                </Badge>
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/projects/${p.id}`}
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                >
                  编辑
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
