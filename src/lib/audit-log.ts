// 管理端操作审计日志
import { prisma } from "@/lib/db";

export type AuditParams = {
  action: string;
  target?: string;
  detail?: string;
  operator?: string;
  ip?: string;
};

/** 写入审计日志（失败不阻断主流程） */
export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        target: params.target ?? null,
        detail: params.detail ?? null,
        operator: params.operator ?? "admin",
        ip: params.ip ?? null,
      },
    });
  } catch (err) {
    console.error("[audit]", err);
  }
}

/** 从请求头获取客户端 IP */
export function getClientIpFromHeaders(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return "unknown";
}

/** 审计动作中文标签 */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  "auth.login": "登录",
  "project.create": "创建项目",
  "project.update": "更新项目",
  "project.delete": "删除项目",
  "media.create": "添加媒体",
  "media.delete": "删除媒体",
  "feedback.update": "更新反馈",
  "feedback.delete": "删除反馈",
};

/** 获取审计动作显示名 */
export function getAuditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}
