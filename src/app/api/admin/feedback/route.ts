// 管理端反馈列表与更新接口
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

/** 获取全部反馈列表 */
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const items = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  adminNote: z.string().max(2000).optional(),
});

/** 更新反馈状态或备注 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }
  const { id, status, adminNote } = parsed.data;
  const item = await prisma.feedback.update({
    where: { id },
    data: { ...(status && { status }), ...(adminNote !== undefined && { adminNote }) },
  });
  return NextResponse.json(item);
}

/** 删除反馈 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await request.json();
  await prisma.feedback.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
