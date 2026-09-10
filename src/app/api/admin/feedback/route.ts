// 管理端反馈列表与更新接口
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { parseJsonBody, prismaErrorResponse } from "@/lib/api-utils";
import { deleteUploads } from "@/lib/file-cleanup";
import { writeAuditLog, getClientIpFromHeaders } from "@/lib/audit-log";

/** 获取全部反馈列表 */
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const items = await prisma.feedback.findMany({
    include: { attachments: true, project: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    items.map((f) => ({
      ...f,
      projectTitle: f.project?.title,
      projectSlug: f.project?.slug,
      createdAt: f.createdAt.toISOString(),
    }))
  );
}

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  adminNote: z.string().max(2000).optional(),
});

const deleteSchema = z.object({ id: z.string() });

/** 更新反馈状态或备注 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });
  const { id, status, adminNote } = parsed.data;
  try {
    const item = await prisma.feedback.update({
      where: { id },
      data: { ...(status && { status }), ...(adminNote !== undefined && { adminNote }) },
    });
    await writeAuditLog({
      action: "feedback.update",
      target: item.title,
      detail: status ? `status=${status}` : "note",
      operator: session.user?.name ?? "admin",
      ip: getClientIpFromHeaders(request.headers),
    });
    return NextResponse.json(item);
  } catch (err) {
    const resp = prismaErrorResponse(err);
    if (resp) return resp;
    throw err;
  }
}

/** 删除反馈 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });
  const existing = await prisma.feedback.findUnique({
    where: { id: parsed.data.id },
    include: { attachments: true },
  });
  if (!existing) return NextResponse.json({ error: "反馈不存在" }, { status: 404 });
  await prisma.feedback.delete({ where: { id: parsed.data.id } });
  await deleteUploads(existing.attachments.map((a) => a.fileUrl));
  await writeAuditLog({
    action: "feedback.delete",
    target: existing.title,
    detail: `id=${parsed.data.id}`,
    operator: session.user?.name ?? "admin",
    ip: getClientIpFromHeaders(request.headers),
  });
  return NextResponse.json({ ok: true });
}
