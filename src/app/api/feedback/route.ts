// 公开反馈提交接口（需关联项目）
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(2).max(200),
  content: z.string().min(5).max(5000),
  type: z.enum(["issue", "suggestion", "feedback"]),
  contact: z.string().max(200).optional(),
  website: z.string().max(0).optional(),
});

/** 接收针对项目的匿名反馈 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "提交过于频繁，请稍后再试" }, { status: 429 });
  }
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success || parsed.data.website) {
    return NextResponse.json({ error: "提交内容无效" }, { status: 400 });
  }
  const { projectId, title, content, type, contact } = parsed.data;
  const project = await prisma.project.findFirst({
    where: { id: projectId, status: "published" },
  });
  if (!project) {
    return NextResponse.json({ error: "项目不存在或未发布" }, { status: 404 });
  }
  const feedback = await prisma.feedback.create({
    data: { projectId, title, content, type, contact: contact || null },
  });
  return NextResponse.json({ id: feedback.id, message: "反馈已提交，感谢你的意见！" });
}
