// 管理端操作审计日志页
import { prisma } from "@/lib/db";
import { getAuditActionLabel } from "@/lib/audit-log";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

/** 审计日志列表页 */
export default async function AuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">操作审计</h1>
      <p className="text-sm text-muted-foreground mb-6">最近 200 条管理操作记录</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>时间</TableHead>
            <TableHead>操作</TableHead>
            <TableHead>对象</TableHead>
            <TableHead>详情</TableHead>
            <TableHead>操作人</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                暂无审计记录
              </TableCell>
            </TableRow>
          )}
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm whitespace-nowrap">
                {log.createdAt.toLocaleString("zh-CN")}
              </TableCell>
              <TableCell>{getAuditActionLabel(log.action)}</TableCell>
              <TableCell className="max-w-[120px] truncate">{log.target ?? "-"}</TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                {log.detail ?? "-"}
              </TableCell>
              <TableCell>{log.operator}</TableCell>
              <TableCell className="text-sm">{log.ip ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
